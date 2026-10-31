import { auth } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// ==========================================
// 1. DOM ELEMENTS
// ==========================================

const logoutButton = document.getElementById("logoutButton");

const dashboardMessage = document.getElementById(
    "dashboardMessage"
);

const dashboardContainer = document.querySelector(
    ".dashboard-container"
);

const sections = document.querySelectorAll(
    ".dashboard-section"
);

const sidebarLinks = document.querySelectorAll(
    ".sidebar-link[data-section]"
);

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;


// ==========================================
// 2. MESSAGE HANDLER
// ==========================================

function showMessage(message, type = "info") {

    if (!dashboardMessage) return;

    dashboardMessage.textContent = message;

    dashboardMessage.className = `dashboard-message ${type}`;

    dashboardMessage.style.display = "block";

    dashboardMessage.setAttribute("role", "status");

    dashboardMessage.setAttribute("aria-live", "polite");

}


// ==========================================
// 3. DASHBOARD VISIBILITY
// ==========================================

function setDashboardVisibility(isVisible) {

    if (dashboardContainer) {

        dashboardContainer.style.visibility = isVisible
            ? "visible"
            : "hidden";

    }

}


// Hide dashboard until authentication is confirmed.

setDashboardVisibility(false);


// ==========================================
// 4. DASHBOARD NAVIGATION
// ==========================================

function showSection(sectionId) {

    const target = document.getElementById(sectionId);

    if (
        !target ||
        !target.classList.contains("dashboard-section")
    ) {
        return;
    }


    // Hide all dashboard sections

    sections.forEach(section => {

        section.classList.remove("active");

    });


    // Update sidebar active state

    sidebarLinks.forEach(link => {

        link.classList.toggle(
            "active",
            link.dataset.section === sectionId
        );

    });


    // Display selected section

    target.classList.add("active");


    // Update URL hash

    history.replaceState(
        null,
        "",
        `#${encodeURIComponent(sectionId)}`
    );


    // Scroll to top

    window.scrollTo({

        top: 0,

        behavior: prefersReducedMotion ? "auto" : "smooth"

    });

}


// ==========================================
// 5. SIDEBAR BUTTONS
// ==========================================

sidebarLinks.forEach(link => {

    link.addEventListener("click", event => {

        event.preventDefault();

        const sectionId = link.dataset.section;

        showSection(sectionId);

    });

});


// ==========================================
// 6. QUICK ACCESS BUTTONS
// ==========================================

document.querySelectorAll("[data-go]").forEach(button => {

    button.addEventListener("click", event => {

        event.preventDefault();

        const sectionId = button.dataset.go;

        showSection(sectionId);

    });

});


// ==========================================
// 7. USER INFORMATION
// ==========================================

function updateUserInformation(user) {

    const name =
        user.displayName ||
        user.email?.split("@")[0] ||
        "User";

    const email = user.email || "Not available";

    const avatarLetter = name.charAt(0).toUpperCase();


    const values = {

        navbarUserName: name,

        userName: name,

        profileName: name,

        profileEmail: email,

        accountName: name,

        accountEmail: email,

        verificationStatus: user.emailVerified
            ? "Verified"
            : "Not Verified",

        accountStatus: "Active",

        profileVerification: user.emailVerified
            ? "Email verified"
            : "Email not verified"

    };


    // Update user information

    Object.entries(values).forEach(([id, value]) => {

        const element = document.getElementById(id);

        if (element) {

            element.textContent = value;

        }

    });


    // Update avatar

    const avatar = document.getElementById("userAvatar");

    if (avatar) {

        avatar.textContent = avatarLetter;

    }


    // Update dashboard browser title

    document.title = `${name} | Baurami Dashboard`;

}


// ==========================================
// 8. FIREBASE AUTHENTICATION
// ==========================================

onAuthStateChanged(auth, async user => {

    if (!user) {

        setDashboardVisibility(false);

        window.location.replace("signin.html");

        return;

    }


    try {

        // Refresh Firebase user information

        await user.reload();

        const currentUser = auth.currentUser;


        // Check current user

        if (!currentUser) {

            setDashboardVisibility(false);

            window.location.replace("signin.html");

            return;

        }


        // Verify email

        if (!currentUser.emailVerified) {

            setDashboardVisibility(false);

            await signOut(auth);

            window.location.replace("signin.html");

            return;

        }


        // Update dashboard information

        updateUserInformation(currentUser);


        // Restore requested dashboard section

        let requestedSection = "";

        try {

            requestedSection = decodeURIComponent(
                window.location.hash.replace(/^#/, "")
            );

        } catch (error) {

            requestedSection = "";

        }


        const validSection = requestedSection
            ? document.getElementById(requestedSection)
            : null;


        if (
            validSection &&
            validSection.classList.contains("dashboard-section")
        ) {

            showSection(requestedSection);

        } else {

            showSection("homeSection");

        }


        // Show dashboard after authentication succeeds

        setDashboardVisibility(true);


    } catch (error) {

        console.error(
            "Dashboard authentication error:",
            error.code || error.message
        );


        setDashboardVisibility(false);

        showMessage(
            "Unable to verify your account. Please sign in again.",
            "error"
        );


        try {

            await signOut(auth);

        } catch (signOutError) {

            console.error(
                "Authentication cleanup failed:",
                signOutError.code || signOutError.message
            );

        }


        window.location.replace("signin.html");

    }

});


// ==========================================
// 9. LOGOUT
// ==========================================

if (logoutButton) {

    logoutButton.addEventListener("click", async event => {

        event.preventDefault();

        if (logoutButton.disabled) return;

        const originalHTML = logoutButton.innerHTML;


        try {

            logoutButton.disabled = true;

            logoutButton.setAttribute("aria-busy", "true");

            logoutButton.textContent = "Logging out...";


            await signOut(auth);


            // Redirect after successful logout

            window.location.replace("index.html");


        } catch (error) {

            console.error(
                "Logout failed:",
                error.code || error.message
            );


            showMessage(
                "Unable to log out. Please try again.",
                "error"
            );


            logoutButton.disabled = false;

            logoutButton.removeAttribute("aria-busy");

            logoutButton.innerHTML = originalHTML;

        }

    });

}


// ==========================================
// 10. DASHBOARD CONTACT FORM
// ==========================================

const contactForm = document.getElementById("contactForm");

if (contactForm) {

    contactForm.addEventListener("submit", event => {

        event.preventDefault();


        const messageElement = document.getElementById(
            "contactFormMessage"
        );


        if (messageElement) {

            messageElement.textContent =
                "Your details are valid. Email delivery has not been configured yet.";

            messageElement.className =
                "dashboard-message info";

            messageElement.style.display = "block";

            messageElement.setAttribute("role", "status");

        }


        contactForm.reset();

    });

}


// ==========================================
// 11. CURRENT YEAR
// ==========================================

const yearElement = document.getElementById("year");

if (yearElement) {

    yearElement.textContent = new Date().getFullYear();

}


// ==========================================
// 12. CONSOLE STATUS
// ==========================================

console.log(
    "%c BAURAMI TECHNOLOGIES DASHBOARD ",
    "background:#0866f5;color:white;padding:8px;border-radius:5px;font-weight:bold;"
);

console.log(
    "Dashboard module loaded successfully."
);