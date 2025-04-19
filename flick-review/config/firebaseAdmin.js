require('dotenv').config();
const admin = require("firebase-admin");

// Ensure the path to your JSON file is provided
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH) {
  throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable.");
}

// Load the service account key JSON file
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log("Firebase initialized successfully.");

module.exports = admin;