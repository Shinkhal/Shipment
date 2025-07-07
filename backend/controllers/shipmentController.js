import { db } from "../config/firebase.js";

// Generate unique tracking ID
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

// ✅ Create Shipment
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
    // Validate required fields
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
    res.status(201).json({ id: docRef.id, trackingId, ...shipment });

  } catch (error) {
    console.error("Error creating shipment:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Shipment by Tracking ID
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

// ✅ Get Active Shipments
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

// ✅ Get Shipment History
export const getShipmentHistory = async (req, res) => {
  const userId = req.user.uid;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;

  try {
    let baseQuery = db.collection("shipments").where("createdBy", "==", userId);

    // Apply status filter if provided
    if (status && status.trim() !== '') {
      baseQuery = baseQuery.where("status", "==", status);
    }

    // Apply date filters if provided
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

    // Get filtered count for pagination
    const countSnapshot = await baseQuery.get();
    const totalItems = countSnapshot.size;

    // Get paginated results
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

// ✅ Cancel Shipment
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

    // Ensure the user owns the shipment
    if (data.createdBy !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Only allow cancel if not yet shipped or beyond
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

    res.status(200).json({ message: 'Shipment cancelled successfully' });

  } catch (err) {
    console.error('Error cancelling shipment:', err);
    res.status(500).json({ error: err.message });
  }
};
