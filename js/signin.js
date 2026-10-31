
import { auth } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    signOut,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// DOM Elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberMe = document.getElementById("rememberMe");
const loginMessage = document.getElementById("loginMessage");
const togglePassword = document.getElementById("togglePassword");
const yearElement = document.getElementById("year");

// Current year
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

// Show / Hide Password
if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
        const isPassword = passwordInput.type === "password";

        passwordInput.type = isPassword ? "text" : "password";
        togglePassword.textContent = isPassword ? "Hide" : "Show";

        togglePassword.setAttribute(
            "aria-label",
            isPassword ? "Hide password" : "Show password"
        );
    });
}

// Display Messages
function showMessage(message, type = "error") {
    if (!loginMessage) return;

    loginMessage.textContent = message;
    loginMessage.className = `form-message ${type}`;
}

// Loading State
function setLoading(isLoading) {
    const submitButton = loginForm?.querySelector(
        'button[type="submit"]'
    );

    if (!submitButton) return;

    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading
        ? "Signing In..."
        : "Sign In";
}

// Firebase Error Messages
function getErrorMessage(error) {
    switch (error.code) {
        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
            return "Incorrect email or password.";

        case "auth/user-disabled":
            return "This account has been disabled.";

        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Network error. Check your internet connection.";

        case "auth/operation-not-allowed":
            return "Email and password login is not enabled in Firebase.";

        case "auth/invalid-api-key":
            return "Firebase API key is invalid. Check firebase-config.js.";

        default:
            return "Login failed. Please try again.";
    }
}

// Login Form
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput?.value.trim() || "";
        const password = passwordInput?.value || "";
        const shouldRemember = rememberMe?.checked ?? false;

        // Validation
        if (!email || !password) {
            showMessage(
                "Please enter your email and password.",
                "error"
            );
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            showMessage(
                "Please enter a valid email address.",
                "error"
            );
            return;
        }

        setLoading(true);
        showMessage("Checking your account...", "info");

        try {
            // Remember login or use session-only login
            await setPersistence(
                auth,
                shouldRemember
                    ? browserLocalPersistence
                    : browserSessionPersistence
            );

            // Firebase Login
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;

            // Check Email Verification
            if (!user.emailVerified) {
                await signOut(auth);

                showMessage(
                    "Your email is not verified yet. Please check your inbox and spam folder, verify your email, and try again.",
                    "error"
                );

                setLoading(false);
                return;
            }

            // Successful Login
            showMessage(
                "Login successful! Redirecting to your dashboard...",
                "success"
            );

            // Redirect to Dashboard
            window.location.href = "dashboard.html";

        } catch (error) {
            console.error("Login error:", error);

            showMessage(
                getErrorMessage(error),
                "error"
            );

            setLoading(false);
        }
    });
}

// Clear message when typing
[emailInput, passwordInput].forEach((element) => {
    if (element) {
        element.addEventListener("input", () => {
            if (loginMessage) {
                loginMessage.textContent = "";
                loginMessage.className = "form-message";
            }
        });
    }
});

console.log("Baurami Technologies: Sign In module loaded.");
