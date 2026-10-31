import { auth } from "./firebase-config.js";

import {
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// ==========================================
// DOM ELEMENTS
// ==========================================

const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

const emailInput =
    document.getElementById("email");

const resetMessage =
    document.getElementById("resetMessage");

const yearElement =
    document.getElementById("year");

const submitButton =
    forgotPasswordForm?.querySelector('button[type="submit"]');

// ==========================================
// CURRENT YEAR
// ==========================================

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

// ==========================================
// DISPLAY MESSAGE
// ==========================================

function showMessage(message, type = "error") {
    if (!resetMessage) return;

    resetMessage.textContent = message;
    resetMessage.className = `form-message ${type}`;
    resetMessage.style.display = "block";
}

// ==========================================
// BUTTON LOADING STATE
// ==========================================

function setLoading(isLoading) {
    if (!submitButton) return;

    submitButton.disabled = isLoading;

    submitButton.textContent = isLoading
        ? "Sending Reset Link..."
        : "Send Reset Link";
}

// ==========================================
// EMAIL VALIDATION
// ==========================================

function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// ==========================================
// FIREBASE ERROR HANDLING
// ==========================================

function getErrorMessage(error) {
    switch (error.code) {
        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/too-many-requests":
            return "Too many requests. Please try again later.";

        case "auth/network-request-failed":
            return "Network error. Please check your internet connection.";

        case "auth/operation-not-allowed":
            return "Password reset is not enabled in Firebase Authentication.";

        case "auth/invalid-api-key":
            return "Firebase API key is invalid. Check firebase-config.js.";

        case "auth/unauthorized-continue-uri":
            return "Firebase rejected the reset link domain. Check Authorized Domains.";

        default:
            return "Unable to send the reset link. Please try again.";
    }
}

// ==========================================
// PASSWORD RESET FORM
// ==========================================

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput?.value.trim() || "";

        // Validate email
        if (!email) {
            showMessage(
                "Please enter your registered email address.",
                "error"
            );

            emailInput?.focus();
            return;
        }

        if (!isValidEmail(email)) {
            showMessage(
                "Please enter a valid email address.",
                "error"
            );

            emailInput?.focus();
            return;
        }

        setLoading(true);

        showMessage(
            "Sending password reset link...",
            "info"
        );

        try {
            // Send Firebase password reset email
            await sendPasswordResetEmail(auth, email);

            showMessage(
                "If an account exists for this email, a password reset link has been sent. Please check your inbox and spam folder.",
                "success"
            );

            forgotPasswordForm.reset();

        } catch (error) {
            console.error("Password reset error:", error);

            // Do not reveal whether an account exists
            if (error.code === "auth/user-not-found") {
                showMessage(
                    "If an account exists for this email, a password reset link has been sent.",
                    "success"
                );
            } else {
                showMessage(
                    getErrorMessage(error),
                    "error"
                );
            }

        } finally {
            setLoading(false);
        }
    });
}

// ==========================================
// CLEAR MESSAGE WHEN USER TYPES
// ==========================================

if (emailInput) {
    emailInput.addEventListener("input", () => {
        if (resetMessage) {
            resetMessage.textContent = "";
            resetMessage.className = "form-message";
        }
    });
}

console.log(
    "Baurami Technologies: Forgot Password module loaded."
);