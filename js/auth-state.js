import { auth } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// ==========================================
// 1. DOM ELEMENTS
// ==========================================

const loggedOutElements = document.querySelectorAll(
    '[data-auth="logged-out"]'
);

const loggedInElements = document.querySelectorAll(
    '[data-auth="logged-in"]'
);

const userNameElements = document.querySelectorAll(
    "[data-user-name]"
);

const logoutButtons = document.querySelectorAll(
    "[data-logout]"
);


// ==========================================
// 2. UPDATE AUTHENTICATION NAVIGATION
// ==========================================

function updateNavigation(isLoggedIn, user = null) {

    // Show or hide Sign In / Sign Up

    loggedOutElements.forEach(element => {

        element.style.display = isLoggedIn ? "none" : "";

        element.setAttribute(
            "aria-hidden",
            String(isLoggedIn)
        );

    });


    // Show or hide Dashboard

    loggedInElements.forEach(element => {

        element.style.display = isLoggedIn ? "flex" : "none";

        element.setAttribute(
            "aria-hidden",
            String(!isLoggedIn)
        );

    });


    // Update username only if the element exists

    const displayName = user
        ? user.displayName || user.email?.split("@")[0] || "User"
        : "";

    userNameElements.forEach(element => {

        element.textContent = displayName;

    });

}


// ==========================================
// 3. LOGOUT FUNCTION
// ==========================================

async function handleLogout(button) {

    if (!button || button.disabled) return;

    const originalHTML = button.innerHTML;

    try {

        button.disabled = true;

        button.setAttribute("aria-busy", "true");

        button.innerHTML = "Logging Out...";

        await signOut(auth);

        // Redirect after successful logout

        window.location.href = "index.html";

    } catch (error) {

        console.error("Logout failed:", error.code || error.message);

        alert("Unable to log out. Please try again.");

        button.disabled = false;

        button.removeAttribute("aria-busy");

        button.innerHTML = originalHTML;

    }

}


// ==========================================
// 4. LOGOUT BUTTON EVENTS
// ==========================================

logoutButtons.forEach(button => {

    button.addEventListener("click", event => {

        event.preventDefault();

        handleLogout(button);

    });

});


// ==========================================
// 5. FIREBASE AUTHENTICATION STATE
// ==========================================

onAuthStateChanged(auth, async user => {

    try {

        if (!user) {

            // Visitor is logged out

            updateNavigation(false);

            return;

        }


        // Refresh latest Firebase user information

        await user.reload();

        const currentUser = auth.currentUser;


        if (!currentUser) {

            updateNavigation(false);

            return;

        }


        // Check email verification

        if (currentUser.emailVerified) {

            // Verified user

            updateNavigation(true, currentUser);

        } else {

            // Unverified user

            updateNavigation(false);

            await signOut(auth);

        }

    } catch (error) {

        console.error(
            "Authentication state error:",
            error.code || error.message
        );

        updateNavigation(false);

    }

});


// ==========================================
// 6. AUTHENTICATION MODULE STATUS
// ==========================================

console.log(
    "%c BAURAMI TECHNOLOGIES ",
    "background:#0866f5;color:white;padding:8px;border-radius:5px;font-weight:bold;"
);

console.log(
    "Firebase authentication module loaded successfully."
);