import jwt from 'jsonwebtoken';
import { db, auth } from '../config/firebase.js';
import { sendEmail } from '../utils/EmailSender.js';

const sendStatusUpdateEmail = async (shipment, newStatus, description) => {
  const { sender, receiver, trackingId, package: pkg } = shipment;

  const statusMessages = {
    'Processing': 'Your shipment is being processed and will be picked up soon.',
    'Shipped': 'Your shipment has been picked up and is on its way.',
    'In Transit': 'Your shipment is currently in transit to the destination.',
    'Delivered': 'Your shipment has been successfully delivered.',
    'Returned': 'Your shipment has been returned to the sender.',
    'Cancelled': 'Your shipment has been cancelled.'
  };

  const statusMessage = statusMessages[newStatus] || description;

  const generateEmailHTML = (name, role) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ccc;">
      <h2 style="color: #2c3e50;">Shipment Status Update</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Your ${role === 'sender' ? 'shipment' : 'incoming shipment'} status has been updated. Below are the details:</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px;"><strong>Tracking ID:</strong></td><td>${trackingId}</td></tr>
        <tr><td style="padding: 8px;"><strong>Package:</strong></td><td>${pkg?.description || 'N/A'}</td></tr>
        <tr><td style="padding: 8px;"><strong>Status:</strong></td><td>${newStatus}</td></tr>
        <tr><td style="padding: 8px;"><strong>Update:</strong></td><td>${statusMessage}</td></tr>
        <tr><td style="padding: 8px;"><strong>Updated On:</strong></td><td>${new Date().toLocaleString()}</td></tr>
        ${role === 'receiver' ? `<tr><td style="padding: 8px;"><strong>Sender:</strong></td><td>${sender?.name || 'N/A'}</td></tr>` : ''}
      </table>
      <p style="margin-top: 20px;">You can track your shipment anytime using the tracking ID: <strong>${trackingId}</strong>.</p>
      <p style="margin-top: 10px;">Thank you for using ShipNest!</p>
    </div>
  `;

  const plainText = `Shipment Status Update
Tracking ID: ${trackingId}
Package: ${pkg?.description || 'N/A'}
Status: ${newStatus}
Update: ${statusMessage}
Updated On: ${new Date().toLocaleString()}
`;
  // Email to sender
  if (sender?.email) {
    try {
      await sendEmail({
        to: sender.email,
        subject: `📦 Shipment Status Updated - ${trackingId} [${newStatus}]`,
        text: plainText,
        html: generateEmailHTML(sender.name, 'sender')
      });
      console.log(`📧 Status update email sent to sender: ${sender.email}`);
    } catch (error) {
      console.error('❌ Error sending status update email to sender:', error);
    }
  }

  // Email to receiver for supported statuses
  if (receiver?.email && ['Shipped', 'In Transit', 'Delivered', 'Returned'].includes(newStatus)) {
    try {
      await sendEmail({
        to: receiver.email,
        subject: `📦 Incoming Shipment Status - ${trackingId} [${newStatus}]`,
        text: plainText,
        html: generateEmailHTML(receiver.name, 'receiver')
      });
      console.log(`📧 Status update email sent to receiver: ${receiver.email}`);
    } catch (error) {
      console.error('❌ Error sending status update email to receiver:', error);
    }
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  if (!password) {
    return res.status(400).json({ message: 'Password is required.' });
  }

  try {
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ email, role: 'admin' }, process.env.SECRET_KEY, {
        expiresIn: '1d',
      });

      return res.status(200).json({ token });
    }

    return res.status(401).json({ message: 'Invalid email or password.' });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

export const dashboard = async (req, res) => {
  try {
    const snapshot = await db.collection('shipments').get();
    const shipments = snapshot.docs.map(doc => doc.data());

    let totalRevenue = 0;
    const statusCounts = {
      'Pending': 0,
      'Shipped': 0,
      'Processing': 0,
      'In Transit': 0,
      'Delivered': 0
    };

    shipments.forEach(shipment => {
      const status = shipment.status;
      const amount = shipment.payment?.amount || 0; 
      totalRevenue += amount;

      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

    const userlist = await auth.listUsers();
    const totalUsers = userlist.users.length;

    return res.status(200).json({
      totalShipments: shipments.length,
      totalRevenue,
      statusCounts,
      totalUsers
    });
  } catch (err) {
    console.error('Dashboard Error:', err);
    return res.status(500).json({ message: 'Server error during dashboard.' });
  }
};

export const updateShipmentStatus = async (req, res) => {
  const shipmentId = req.params.id;
  const { status, description } = req.body;

  try {
    const docRef = db.collection("shipments").doc(shipmentId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    const shipment = docSnap.data();

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'In Transit', 'Delivered', 'Cancelled', 'Returned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status provided' });
    }

    const updatedStatusHistory = [
      ...(shipment.statusHistory || []),
      {
        status,
        timestamp: new Date(),
        description: description || `Status updated to ${status}`,
      },
    ];

    const updateData = {
      status,
      statusHistory: updatedStatusHistory,
      lastUpdated: new Date(),
    };

    if (status === 'Delivered') {
      updateData.deliveredAt = new Date();
    }

    await docRef.update(updateData);

    try {
      const updatedShipment = { ...shipment, ...updateData };
      await sendStatusUpdateEmail(updatedShipment, status, description);
    } catch (emailError) {
      console.error('Error sending status update emails:', emailError);
    }

    res.status(200).json({
      message: "Shipment status updated successfully",
      id: shipmentId,
      status,
      statusHistory: updatedStatusHistory,
      emailNotificationSent: true
    });
  } catch (error) {
    console.error("Error updating shipment status:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllShipments = async (req, res) => {
  try {
    const snapshot = await db
      .collection("shipments")
      .orderBy("createdAt", "desc")
      .get();

    const shipments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({ shipments });
  } catch (error) {
    console.error("Error fetching all shipments:", error);
    res.status(500).json({ error: "Failed to fetch shipments" });
  }
};


export const getAllUserwithShipments = async (req, res) => {
  try {
    const userSnapshot = await db.collection("users").get();
    const users = {};
    userSnapshot.forEach(doc => {
      const data = doc.data();
      users[data.uid] = {
        userId: data.uid,
        email: data.email || '',
        name: data.name || 'Unnamed',
        phone: data.phone || '',
        shipmentCount: 0,
      };
    });

    const shipmentSnapshot = await db.collection("shipments").get();
    shipmentSnapshot.forEach(doc => {
      const shipment = doc.data();
      const userId = shipment.createdBy;
      if (userId && users[userId]) {
        users[userId].shipmentCount += 1;
      }
    });

    const result = Object.values(users);

    res.status(200).json({ users: result });
  } catch (error) {
    console.error("❌ Error fetching users with shipments:", error);
    res.status(500).json({ error: "Failed to fetch user shipment data" });
  }
};

