import jwt from 'jsonwebtoken';
import { db, auth } from '../config/firebase.js';

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
      // ✅ FIX: `expiresIn: '1d'` must be in quotes
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
      'Delivered':0
    };

    shipments.forEach(shipment => {
      const status = shipment.status;
      const amount = shipment.payment?.amount || 0; // ✅ fixed here
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


// ✅ Update Shipment Status

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

    const updatedStatusHistory = [
      ...(shipment.statusHistory || []),
      {
        status,
        timestamp: new Date(),
        description: description || `Status updated to ${status}`,
      },
    ];

    await docRef.update({
      status,
      statusHistory: updatedStatusHistory,
    });

    res.status(200).json({
      message: "Shipment status updated",
      id: shipmentId,
      status,
      statusHistory: updatedStatusHistory,
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
