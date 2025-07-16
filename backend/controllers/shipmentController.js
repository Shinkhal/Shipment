import { db } from "../config/firebase.js";
import { sendEmail} from "../utils/EmailSender.js";

//Generate unique tracking ID
const generateTrackingId = () => {
  const prefix = "SP";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Calculate estimated delivery
const calculateEstimatedDelivery = (serviceType, pickupDate) => {
  const pickup = pickupDate ? new Date(pickupDate) : new Date();
  const deliveryDate = new Date(pickup);

  switch (serviceType) {
    case "SameDay":
      break;
    case "Express":
      deliveryDate.setDate(pickup.getDate() + 2);
      break;
    case "Standard":
    default:
      deliveryDate.setDate(pickup.getDate() + 5);
      break;
  }

  return deliveryDate;
};

// Email helper functions
const sendShipmentCreatedEmail = async (shipment) => {
  const { sender, receiver, trackingId, estimatedDelivery, service, package: pkg } = shipment;

  const htmlTemplate = (recipient, role) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ccc;">
      <h2 style="color: #2c3e50;">${role === 'sender' ? 'Shipment Created' : 'Incoming Shipment'}</h2>
      <p>Dear <strong>${recipient.name}</strong>,</p>
      <p>${role === 'sender' ? 'Your shipment has been successfully created. Here are the details:' : 'A shipment is on its way to you. Below are the details:'}</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px;"><strong>Tracking ID:</strong></td><td>${trackingId}</td></tr>
        <tr><td style="padding: 8px;"><strong>Service Type:</strong></td><td>${service?.type || 'Standard'}</td></tr>
        <tr><td style="padding: 8px;"><strong>Package:</strong></td><td>${pkg?.description}</td></tr>
        <tr><td style="padding: 8px;"><strong>Weight:</strong></td><td>${pkg?.weight} kg</td></tr>
        ${role === 'sender' ? `<tr><td style="padding: 8px;"><strong>Receiver:</strong></td><td>${receiver?.name}</td></tr>` : `<tr><td style="padding: 8px;"><strong>Sender:</strong></td><td>${sender?.name}</td></tr>`}
        <tr><td style="padding: 8px;"><strong>Estimated Delivery:</strong></td><td>${new Date(estimatedDelivery).toDateString()}</td></tr>
      </table>
      <p style="margin-top: 20px;">Track your shipment anytime using the tracking ID: <strong>${trackingId}</strong>.</p>
      <p style="margin-top: 10px;">Thank you for using ShipNest!</p>
    </div>
  `;

  const plainText = (recipient, role) => 
`Dear ${recipient.name},

${role === 'sender' ? 'Your shipment has been successfully created.' : 'A shipment is on the way to you.'}

Tracking ID: ${trackingId}
Service Type: ${service?.type || 'Standard'}
Package: ${pkg?.description}
Weight: ${pkg?.weight} kg
${role === 'sender' ? 'Receiver' : 'Sender'}: ${role === 'sender' ? receiver?.name : sender?.name}
Estimated Delivery: ${new Date(estimatedDelivery).toDateString()}

Track using Tracking ID: ${trackingId}

Thank you,
ShipNest
`;

  if (sender.email) {
    try {
      await sendEmail({
        to: sender.email,
        subject: `✅ Shipment Created - Tracking ID: ${trackingId}`,
        html: htmlTemplate(sender, 'sender'),
        text: plainText(sender, 'sender')
      });
    } catch (error) {
      console.error('Error sending email to sender:', error);
    }
  }

  if (receiver.email) {
    try {
      await sendEmail({
        to: receiver.email,
        subject: `📦 You Have an Incoming Shipment - Tracking ID: ${trackingId}`,
        html: htmlTemplate(receiver, 'receiver'),
        text: plainText(receiver, 'receiver')
      });
    } catch (error) {
      console.error('Error sending email to receiver:', error);
    }
  }
};


const sendCancellationEmail = async (shipment) => {
  const { sender, receiver, trackingId, package: pkg } = shipment;

  const htmlTemplate = (recipient, role) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ccc;">
      <h2 style="color: #c0392b;">Shipment Cancelled</h2>
      <p>Dear <strong>${recipient.name}</strong>,</p>
      <p>The shipment ${role === 'sender' ? 'you created' : 'intended for you'} has been cancelled. Details below:</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px;"><strong>Tracking ID:</strong></td><td>${trackingId}</td></tr>
        <tr><td style="padding: 8px;"><strong>Package:</strong></td><td>${pkg?.description}</td></tr>
        <tr><td style="padding: 8px;"><strong>${role === 'sender' ? 'Receiver' : 'Sender'}:</strong></td><td>${role === 'sender' ? receiver?.name : sender?.name}</td></tr>
      </table>
      <p style="margin-top: 20px;">For questions, please contact our support team.</p>
      <p style="margin-top: 10px;">Thank you for using ShipNest.</p>
    </div>
  `;

  const plainText = (recipient, role) =>
`Dear ${recipient.name},

The shipment ${role === 'sender' ? 'you created' : 'intended for you'} has been cancelled.

Tracking ID: ${trackingId}
Package: ${pkg?.description}
${role === 'sender' ? 'Receiver' : 'Sender'}: ${role === 'sender' ? receiver?.name : sender?.name}

If you have any questions, please contact our support.

Thank you,
ShipNest
`;

  if (sender.email) {
    try {
      await sendEmail({
        to: sender.email,
        subject: `❌ Shipment Cancelled - Tracking ID: ${trackingId}`,
        html: htmlTemplate(sender, 'sender'),
        text: plainText(sender, 'sender')
      });
    } catch (error) {
      console.error('Error sending cancellation email to sender:', error);
    }
  }

  if (receiver.email) {
    try {
      await sendEmail({
        to: receiver.email,
        subject: `⚠️ Shipment Cancelled - Tracking ID: ${trackingId}`,
        html: htmlTemplate(receiver, 'receiver'),
        text: plainText(receiver, 'receiver')
      });
    } catch (error) {
      console.error('Error sending cancellation email to receiver:', error);
    }
  }
};


// Create Shipment
export const createShipment = async (req, res) => {
  const {
    sender,
    receiver,
    pickup,
    delivery,
    package: pkg,
    service,
    paymentInfo = {}
  } = req.body;

  const userId = req.user.uid;

  try {
    if (
      !sender?.name || !sender?.phone ||
      !receiver?.name || !receiver?.phone ||
      !pickup?.address || !delivery?.address ||
      !pkg?.description
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const trackingId = generateTrackingId();
    const estimatedDelivery = calculateEstimatedDelivery(service?.type, service?.pickupDate);

    const shipment = {
      trackingId,
      sender: {
        name: sender.name,
        phone: sender.phone,
        email: sender.email || ""
      },
      receiver: {
        name: receiver.name,
        phone: receiver.phone,
        email: receiver.email || ""
      },
      pickup: {
        address: pickup.address,
        city: pickup.city,
        state: pickup.state,
        pincode: pickup.pincode
      },
      delivery: {
        address: delivery.address,
        city: delivery.city,
        state: delivery.state,
        pincode: delivery.pincode
      },
      package: {
        description: pkg.description,
        weight: parseFloat(pkg.weight) || 0,
        category: pkg.category || "Others"
      },
      service: {
        type: service?.type || "Standard",
        pickupDate: service?.pickupDate || "",
        preferredTime: service?.preferredTime || "Anytime"
      },
      payment: {
        status: paymentInfo.status || "Pending",
        method: paymentInfo.method || "Razorpay",
        transactionId: paymentInfo.transactionId || "",
        amount: parseFloat(paymentInfo.amount) || 0,
        paidAt: paymentInfo.paidAt ? new Date(paymentInfo.paidAt) : null
      },
      createdBy: userId,
      status: "Pending",
      createdAt: new Date(),
      estimatedDelivery,
      statusHistory: [
        {
          status: "Pending",
          timestamp: new Date(),
          description: "Shipment created and waiting for pickup"
        }
      ]
    };

    const docRef = await db.collection("shipments").add(shipment);
    
    await sendShipmentCreatedEmail(shipment);
    
    res.status(201).json({ id: docRef.id, trackingId, ...shipment });

  } catch (error) {
    console.error("Error creating shipment:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get Shipment by Tracking ID
export const getShipmentByTrackingId = async (req, res) => {
  const { trackingId } = req.params;

  try {
    const snapshot = await db
      .collection("shipments")
      .where("trackingId", "==", trackingId)
      .limit(1)
      .get();

    if (snapshot.empty) return res.status(404).json({ error: "Shipment not found" });

    const doc = snapshot.docs[0];
    const data = doc.data();

    res.status(200).json({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      estimatedDelivery: data.estimatedDelivery?.toDate?.()?.toISOString() || data.estimatedDelivery
    });

  } catch (error) {
    console.error("Error fetching shipment by tracking ID:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get Active Shipments
export const getActiveShipments = async (req, res) => {
  const userId = req.user.uid;

  try {
    const snapshot = await db
      .collection("shipments")
      .where("createdBy", "==", userId)
      .where("status", "in", ["Pending", "Processing", "Shipped", "In Transit"])
      .orderBy("createdAt", "desc")
      .get();

    const shipments = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        senderName: data.sender?.name,
        receiverName: data.receiver?.name,
        status: data.status,
        weight: data.package?.weight,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        estimatedDelivery: data.estimatedDelivery?.toDate?.()?.toISOString() || data.estimatedDelivery,
        lastUpdated: data.lastUpdated?.toDate?.()?.toISOString() || data.lastUpdated
      };
    });

    res.status(200).json(shipments);

  } catch (err) {
    console.error("Error fetching active shipments:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get Shipment History
export const getShipmentHistory = async (req, res) => {
  const userId = req.user.uid;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;

  try {
    let baseQuery = db.collection("shipments").where("createdBy", "==", userId);

    if (status && status.trim() !== '') {
      baseQuery = baseQuery.where("status", "==", status);
    }
    if (req.query.dateFrom) {
      const dateFrom = new Date(req.query.dateFrom);
      dateFrom.setHours(0, 0, 0, 0); // Start of day
      baseQuery = baseQuery.where("createdAt", ">=", dateFrom);
    }

    if (req.query.dateTo) {
      const dateTo = new Date(req.query.dateTo);
      dateTo.setHours(23, 59, 59, 999); // End of day
      baseQuery = baseQuery.where("createdAt", "<=", dateTo);
    }

    const countSnapshot = await baseQuery.get();
    const totalItems = countSnapshot.size;

    const snapshot = await baseQuery
      .orderBy("createdAt", "desc")
      .offset((page - 1) * limit)
      .limit(limit)
      .get();

    const shipments = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        estimatedDelivery: data.estimatedDelivery?.toDate?.()?.toISOString() || data.estimatedDelivery,
        deliveredAt: data.deliveredAt?.toDate?.()?.toISOString() || data.deliveredAt,
        lastUpdated: data.lastUpdated?.toDate?.()?.toISOString() || data.lastUpdated
      };
    });

    res.status(200).json({
      shipments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems: totalItems,
        itemsPerPage: limit
      }
    });

  } catch (err) {
    console.error("Error fetching shipment history:", err);
    res.status(500).json({ error: err.message });
  }
};

// Cancel Shipment
export const cancelShipment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.uid;

  try {
    const docRef = db.collection('shipments').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const data = doc.data();

    if (data.createdBy !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const nonCancelableStatuses = ['Shipped', 'In Transit', 'Delivered', 'Cancelled', 'Returned'];
    if (nonCancelableStatuses.includes(data.status)) {
      return res.status(400).json({ error: `Cannot cancel shipment in '${data.status}' status` });
    }

    const updatedData = {
      status: 'Cancelled',
      lastUpdated: new Date(),
      statusHistory: [
        ...(data.statusHistory || []),
        {
          status: 'Cancelled',
          timestamp: new Date(),
          description: 'Shipment was cancelled by the user.'
        }
      ]
    };

    await docRef.update(updatedData);

    const cancelledShipment = { ...data, ...updatedData };
    await sendCancellationEmail(cancelledShipment);

    res.status(200).json({ message: 'Shipment cancelled successfully' });

  } catch (err) {
    console.error('Error cancelling shipment:', err);
    res.status(500).json({ error: err.message });
  }
};