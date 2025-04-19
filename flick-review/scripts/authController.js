const { initializeApp } = require("firebase/app");
const admin = require("../config/firebaseAdmin");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require("firebase/auth");

require("dotenv").config();

const firebaseConfig = {
  apiKey: process.env.PRIVATE_FIREBASE_API_KEY,
  authDomain: process.env.PRIVATE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.PRIVATE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.PRIVATE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.PRIVATE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.PRIVATE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Now get auth after initializing Firebase
const auth = getAuth(app);
 

const db = require("../config/db"); // Ensure db connection is imported


// Sign up user
const signupUser = async (firstName, lastName, dob, username, email, password) => {
    try {
        if (!firstName || !lastName || !dob || !username || !email || !password) {
            throw new Error("All fields are required");
        }

        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUid = userCredential.user.uid;

        console.log("User created in Firebase:", firebaseUid);

        if (!db) {
            throw new Error("Database connection is undefined");
        }

        // Insert user into MySQL
        return new Promise((resolve, reject) => {
            db.query(
                "INSERT INTO users (firstName, lastName, dob, username, firebase_uid) VALUES (?, ?, ?, ?, ?)",
                [firstName, lastName, dob, username, firebaseUid],
                (err, results) => {
                    if (err) {
                        console.error("MySQL Insert Error:", err);
                        reject(err);
                    } else {
                        console.log("User inserted into MySQL:", results);
                        resolve(results);
                    }
                }
            );
        });
    } catch (error) {
        console.error("Signup Error:", error);
        throw error;
    }
};
 



// Log in user 
const loginUser = async (email, password) => {
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUid = userCredential.user.uid;
  
      // Retrieve user data from MySQL
      const result = await new Promise((resolve, reject) => {
        db.query("SELECT * FROM users WHERE firebase_uid = ?", [firebaseUid], (err, result) => {
          if (err) {
            reject(err);
          }
          if (result.length === 0) {
            reject(new Error("User not found"));
          }
          resolve(result[0]); // Return user details
        });
      });
  
      return result; // Return user data
    } catch (error) {
      console.error("Error logging in user:", error);
      throw error; // Throw the error to be caught in server.js
    }
  };

function getUserProfile(firebaseUid, callback) {
  db.query("SELECT * FROM users WHERE firebase_uid = ?", [firebaseUid], (err, results) => {
    if (err) {
      console.error("Error retrieving user profile:", err);
      return callback(err);
    }

    if (results.length === 0) {
      return callback(new Error("User not found"));
    }

    const user = results[0];
    callback(null, user);
  });
}

module.exports = { signupUser, loginUser, getUserProfile, app };
