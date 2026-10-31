document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. FOOTER YEAR
    // ==========================================

    const footerYear = document.getElementById("footerYear");

    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }


    // ==========================================
    // 2. MOBILE NAVIGATION
    // ==========================================

    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");

    function closeMenu() {

        if (!menuToggle || !navMenu) return;

        navMenu.classList.remove("active");

        menuToggle.setAttribute("aria-expanded", "false");

        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';

    }

    if (menuToggle && navMenu) {

        menuToggle.setAttribute("aria-expanded", "false");

        menuToggle.addEventListener("click", event => {

            event.stopPropagation();

            const isOpen = navMenu.classList.toggle("active");

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            menuToggle.innerHTML = isOpen
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';

        });


        // Close menu after clicking navigation links

        navMenu.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", closeMenu);

        });


        // Close menu when clicking outside

        document.addEventListener("click", event => {

            if (
                !navMenu.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {
                closeMenu();
            }

        });


        // Close menu when resizing to desktop

        window.addEventListener("resize", () => {

            if (window.innerWidth > 950) {
                closeMenu();
            }

        });

    }


    // ==========================================
    // 3. SMOOTH SCROLLING
    // ==========================================

    const prefersReducedMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", event => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({

                behavior: prefersReducedMotion ? "auto" : "smooth",

                block: "start"

            });

        });

    });


    // ==========================================
    // 4. ACTIVE NAVIGATION
    // ==========================================

    const sections = document.querySelectorAll("section[id]");

    const navLinks = document.querySelectorAll(
        ".nav-menu .nav-link"
    );

    function updateActiveNavigation() {

        let currentSection = "";

        const scrollPosition = window.scrollY + 160;

        sections.forEach(section => {

            if (scrollPosition >= section.offsetTop) {

                currentSection = section.id;

            }

        });

        navLinks.forEach(link => {

            const isActive =
                link.getAttribute("href") === `#${currentSection}`;

            link.classList.toggle("active", isActive);

        });

    }

    window.addEventListener("scroll", updateActiveNavigation, {
        passive: true
    });

    updateActiveNavigation();


    // ==========================================
    // 5. HEADER SCROLL EFFECT
    // ==========================================

    const header = document.querySelector(".header");

    function updateHeader() {

        if (!header) return;

        header.classList.toggle(
            "scrolled",
            window.scrollY > 50
        );

    }

    window.addEventListener("scroll", updateHeader, {
        passive: true
    });

    updateHeader();


    // ==========================================
    // 6. BACK TO TOP BUTTON
    // ==========================================

    const backToTop = document.getElementById("backToTop");

    if (backToTop) {

        window.addEventListener("scroll", () => {

            backToTop.classList.toggle(
                "visible",
                window.scrollY > 400
            );

        }, {
            passive: true
        });


        backToTop.addEventListener("click", () => {

            window.scrollTo({

                top: 0,

                behavior: prefersReducedMotion ? "auto" : "smooth"

            });

        });

    }


    // ==========================================
    // 7. CONTACT FORM
    // ==========================================

    const contactForm = document.getElementById("contactForm");

    const contactStatus =
        document.getElementById("contactFormMessage") ||
        document.getElementById("contactStatus");


    function showContactStatus(message, type) {

        if (!contactStatus) return;

        contactStatus.textContent = message;

        contactStatus.className = `form-message ${type}`;

        contactStatus.setAttribute("role", "status");

        contactStatus.setAttribute("aria-live", "polite");

    }


    if (contactForm) {

        contactForm.addEventListener("submit", event => {

            event.preventDefault();


            const name = document
                .getElementById("contactName")
                ?.value.trim();

            const email = document
                .getElementById("contactEmail")
                ?.value.trim();

            const subject = document
                .getElementById("contactSubject")
                ?.value.trim();

            const message = document
                .getElementById("contactMessage")
                ?.value.trim();


            // Required field validation

            if (!name || !email || !subject || !message) {

                showContactStatus(
                    "Please complete all fields.",
                    "error"
                );

                return;

            }


            // Email validation

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {

                showContactStatus(
                    "Please enter a valid email address.",
                    "error"
                );

                return;

            }


            // Message validation

            if (message.length < 10) {

                showContactStatus(
                    "Please write a message containing at least 10 characters.",
                    "error"
                );

                return;

            }


            // Frontend validation only.
            // No email is sent until a backend or email service is connected.

            showContactStatus(
                "Your details are valid! Email delivery has not been configured yet.",
                "success"
            );

            contactForm.reset();

        });

    }


    // ==========================================
    // 8. SCROLL REVEAL ANIMATION
    // ==========================================

    const revealElements = document.querySelectorAll(
        ".service-card, .project-card, .feature-card, .about-content"
    );


    if ("IntersectionObserver" in window) {

        const observer = new IntersectionObserver(

            (entries, observerInstance) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("visible");

                        observerInstance.unobserve(entry.target);

                    }

                });

            },

            {
                threshold: 0.12
            }

        );


        revealElements.forEach(element => {

            element.classList.add("reveal");

            observer.observe(element);

        });

    } else {

        revealElements.forEach(element => {

            element.classList.add("visible");

        });

    }


    // ==========================================
    // 9. CONSOLE MESSAGE
    // ==========================================

    console.log(
        "%c BAURAMI TECHNOLOGIES ",
        "background:#1769e8;color:white;padding:10px;border-radius:5px;font-weight:bold;"
    );

    console.log(
        "Website JavaScript loaded successfully."
    );

});