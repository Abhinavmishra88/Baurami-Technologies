import {
    initializeApp,
    getApp,
    getApps
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// ==========================================
// FIREBASE PROJECT CONFIGURATION
// ==========================================

const firebaseConfig = {
    // Keep your existing Firebase configuration values here.
    apiKey: "AIzaSyBawt609vaQhEfBP_UPmubpU5OcEKZlzOg",
    authDomain: "baurami-technologies.firebaseapp.com",
    projectId: "baurami-technologies",
    storageBucket: "baurami-technologies.firebasestorage.app",
    messagingSenderId: "329249242129",
    appId: "1:329249242129:web:dfbea667cf28ed111a45b0",
    measurementId: "G-3WT64B4H7T"
};

// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app = getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);

// ==========================================
// INITIALIZE AUTHENTICATION
// ==========================================

const auth = getAuth(app);

// ==========================================
// EXPORT FIREBASE SERVICES
// ==========================================

export { app, auth };

console.log("Baurami Technologies Firebase initialized.");