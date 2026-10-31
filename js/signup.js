import { auth } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// =====================================
// DOM ELEMENTS
// =====================================

const signupForm = document.getElementById("signupForm");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const termsInput = document.getElementById("terms");

const signupMessage = document.getElementById("signupMessage");

const signupButton = signupForm?.querySelector(
    'button[type="submit"]'
);

// =====================================
// MESSAGE HANDLER
// =====================================

function showMessage(message, type = "info") {
    if (!signupMessage) return;

    signupMessage.textContent = message;
    signupMessage.className = `form-message ${type}`;
    signupMessage.style.display = "block";

    signupMessage.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}

// =====================================
// LOADING STATE
// =====================================

function setLoading(isLoading) {
    if (!signupButton) return;

    signupButton.disabled = isLoading;

    signupButton.textContent = isLoading
        ? "Creating Account..."
        : "Create Account";
}

// =====================================
// PASSWORD SHOW / HIDE
// =====================================

document.querySelectorAll(".toggle-password").forEach(button => {
    button.addEventListener("click", () => {
        const targetId = button.dataset.target;
        const passwordField = document.getElementById(targetId);

        if (!passwordField) return;

        const isPassword = passwordField.type === "password";

        passwordField.type = isPassword ? "text" : "password";

        button.textContent = isPassword ? "Hide" : "Show";

        button.setAttribute(
            "aria-label",
            isPassword ? "Hide password" : "Show password"
        );
    });
});

// =====================================
// FIREBASE ERROR HANDLER
// =====================================

function getSignupErrorMessage(error) {
    switch (error.code) {
        case "auth/email-already-in-use":
            return "This email is already registered. Please sign in.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/weak-password":
            return "Please choose a stronger password.";

        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Network error. Please check your internet connection.";

        case "auth/quota-exceeded":
            return "Email sending limit reached. Please try again later.";

        case "auth/operation-not-allowed":
            return "Email and Password authentication is not enabled in Firebase.";

        case "auth/unauthorized-continue-uri":
            return "Firebase rejected the verification link domain. Check Authorized Domains in Firebase.";

        case "auth/invalid-api-key":
            return "Firebase API key is invalid. Check firebase-config.js.";

        default:
            return "Unable to create your account. Please try again.";
    }
}

// =====================================
// SIGNUP FORM
// =====================================

if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!fullNameInput || !emailInput ||
            !passwordInput || !confirmPasswordInput ||
            !termsInput) {
            showMessage(
                "Signup form configuration is incomplete. Please check the HTML element IDs.",
                "error"
            );
            return;
        }

        const fullName = fullNameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // =================================
        // VALIDATION
        // =================================

        if (!fullName || !email || !password || !confirmPassword) {
            showMessage(
                "Please complete all required fields.",
                "error"
            );
            return;
        }

        if (fullName.length < 2) {
            showMessage(
                "Please enter a valid full name.",
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

        if (password.length < 8) {
            showMessage(
                "Password must contain at least 8 characters.",
                "error"
            );
            return;
        }

        if (password !== confirmPassword) {
            showMessage(
                "Passwords do not match.",
                "error"
            );
            return;
        }

        if (!termsInput.checked) {
            showMessage(
                "Please accept the Terms and Conditions.",
                "error"
            );
            return;
        }

        // =================================
        // CREATE ACCOUNT
        // =================================

        setLoading(true);

        showMessage(
            "Creating your account. Please wait...",
            "info"
        );

        let userCredential = null;

        try {
            userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;

            // Save display name
            await updateProfile(user, {
                displayName: fullName
            });

            // Send verification email
            try {
                await sendEmailVerification(user);
            } catch (verificationError) {
                console.error(
                    "Verification email error:",
                    verificationError
                );

                // Sign out even if verification email fails
                await signOut(auth);

                signupForm.reset();

                showMessage(
                    "Your account was created, but Firebase could not send the verification email. Please try the resend verification option on the Sign In page.",
                    "error"
                );

                setLoading(false);
                return;
            }

            // Sign out until email is verified
            await signOut(auth);

            // Clear form
            signupForm.reset();

            showMessage(
                `Account created successfully! A verification email has been sent to ${email}. Please check your inbox and Spam folder, click the verification link, and then sign in.`,
                "success"
            );

            if (signupButton) {
                signupButton.textContent = "Verification Email Sent";
                signupButton.disabled = true;
            }

        } catch (error) {
            console.error("Signup error:", error);

            // If an account was created before a later error,
            // make sure it is not left signed in.
            if (userCredential) {
                try {
                    await signOut(auth);
                } catch (signOutError) {
                    console.error("Sign out error:", signOutError);
                }
            }

            showMessage(
                getSignupErrorMessage(error),
                "error"
            );

            setLoading(false);
        }
    });
}

// =====================================
// CLEAR ERROR WHEN USER TYPES
// =====================================

[
    fullNameInput,
    emailInput,
    passwordInput,
    confirmPasswordInput
].forEach(input => {
    if (input) {
        input.addEventListener("input", () => {
            if (signupMessage) {
                signupMessage.textContent = "";
                signupMessage.className = "form-message";
            }
        });
    }
});

// =====================================
// CURRENT YEAR
// =====================================

const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

console.log("Baurami Technologies: Signup module loaded.");