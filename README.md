# 🚚 ShipNest - Shipment Delivery Application

[![Live Deployment](https://img.shields.io/badge/Live%20App-shipnest.vercel.app-brightgreen?style=for-the-badge)](https://shipnest.vercel.app/)
[![Tech Stack](https://img.shields.io/badge/Stack-React%2C%20Node.js%2C%20Firebase-blueviolet?style=for-the-badge)](#tech-stack)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#license)
[![Made with ❤️](https://img.shields.io/badge/Made%20with-%E2%9D%A4-red?style=for-the-badge)](#created-by)

**Live Link:** [https://shipnest.vercel.app/](https://shipnest.vercel.app/)

ShipNest is a comprehensive shipment delivery and tracking platform built for both users and admins. It offers seamless shipment creation, real-time tracking, admin-level analytics, and automated email notifications — all wrapped in a modern and responsive UI.

---

## 📌 Features

### 👤 User Side
- 🚀 **Create Shipment:** Input sender/receiver details, item info, and delivery preferences.
- 📍 **Track Shipments:** Public tracking without login.
- 🧾 **Download Invoices & Shipment PDFs**
- 📤 **Share Shipment Info:** Share via WhatsApp and other platforms.
- 📚 **Shipment History:** Full history with filters and export to CSV.
- 🔔 **Email Updates:** Shipment created, updated, or cancelled — emails sent to both sender and receiver.
- 🗺️ **State-City Dynamic Dropdowns:** Cities dynamically fetched based on selected state.
- 💸 **Dynamic Pricing Engine:** Total cost is calculated based on package weight, date, delivery type, and item category.

### 🔐 Admin Side
- 📊 **Dashboard:** Visual insights like total shipments, users, revenue, and shipment status graphs.
- 📝 **Manage Shipments:** Update status (Pending, Shipped, Delivered, Cancelled, etc.)
- 📈 **Analytics:** Pie charts and bar graphs for status distribution and performance.
- 📝 **Manage Users:** Admin can add, edit, or delete users.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Authentication:** Firebase Auth
- **Payments:** Razorpay API
- **Email Services:** Nodemailer
- **Database:** Firebase Firestore

---

## 🧭 Pages & Routes

### 👥 User Routes
```

/                   → Home
/auth               → Sign Up / Login
/forgot-password    → Reset Password
/profile            → Profile Page
/new-shipment       → Create Shipment
/confirm            → Confirm Shipment
/success            → Success Page
/my-shipments       → Active Shipments
/history            → Shipment History
/details            → Shipment Details
/track              → Track Shipment
/cancellation-success → Cancellation Success
/contact, /about, /terms, /privacy → Info Pages

```

### 🛠️ Admin Routes
```

/admin              → Admin Landing Page
/admin/login        → Admin Login
/admin/dashboard    → Admin Dashboard with analytics
/admin/shipments    → View all shipments
/admin/shipments/\:id/update → Update shipment status
/admin/users       → Manage Users

````

---

## 📸 Screenshots

| Dashboard | All Shipments | User Homepage | Active Shipments |
|----------|---------------|---------------|---------|
| <img width="1918" height="969" alt="image" src="https://github.com/user-attachments/assets/1f48a18c-86d4-4155-92f6-1e11e7db387d" /> | <img width="1919" height="970" alt="image" src="https://github.com/user-attachments/assets/46462d24-5662-4a0d-9421-e5d0d6ef0f97" />| <img width="1918" height="965" alt="image" src="https://github.com/user-attachments/assets/b4fef785-1c39-4123-90fa-c0f6baac441a" /> | <img width="1871" height="970" alt="image" src="https://github.com/user-attachments/assets/279cc7f2-6c61-4fbd-a2bb-64dd86f7f37a" />
 |

---

## ⚙️ Installation (for local setup)

```bash
git clone https://github.com/Shinkhal/Shipment.git
cd Shipment

# For frontend
cd client
npm install
npm run dev

# For backend
cd ../server
npm install
npm run dev
````

> Make sure to set up `.env` files for Firebase, Razorpay, and Mail configuration.

---

## 🔐 Environment Variables

You’ll need the following environment variables in your `.env` file:

### Firebase

```
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
...
```

### Razorpay

```
RAZORPAY_KEY_ID=
RAZORPAY_SECRET=
```

### Mail

```
EMAIL_USER=
EMAIL_PASS=
```

---

## 🧑‍💻 Created By

**Created with ❤️ by [Shinkhal Sinha](https://shinkhal-sinha.online)**
Full Stack Developer | UI/UX Designer

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — feel free to fork, clone, and use it for educational purposes.


