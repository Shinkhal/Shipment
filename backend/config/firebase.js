import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();



// Decode and parse the base64 string from environment variable
const firebaseKeyBase64 = process.env.FIREBASE_KEY_BASE64;
if (!firebaseKeyBase64) {
  throw new Error("FIREBASE_KEY_BASE64 is not set in environment");
}

const serviceAccount = JSON.parse(
  Buffer.from(firebaseKeyBase64, "base64").toString("utf-8")
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
