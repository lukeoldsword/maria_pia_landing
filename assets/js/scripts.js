
// Hamburger
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");
hamburger.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", isOpen);
});
mobileMenu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
    });
});

// Smooth scroll
document.querySelectorAll("a[href^=\"#\"]").forEach(a => {
    a.addEventListener("click", e => {
        const href = a.getAttribute("href");
        if (href === "#") return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.pageYOffset - 76;
        window.scrollTo({top, behavior: "smooth"});
    });
});

// Date min
const dateInput = document.getElementById("b-date");
if (dateInput) dateInput.setAttribute("min", new Date().toISOString().split("T")[0]);

// ── Scroll Animations ──────────────────────────────────

// Hero load animation
const heroContent = document.getElementById("hero-content");
if (heroContent) {
    requestAnimationFrame(() => {
        setTimeout(() => heroContent.classList.add("loaded"), 60);
    });
}

// Nav scroll shadow
const siteHeader = document.querySelector(".site-header");
window.addEventListener("scroll", () => {
    siteHeader.classList.toggle("scrolled", window.scrollY > 20);
}, {passive: true});

// IntersectionObserver for .reveal and .reveal-stagger
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px"
});

document.querySelectorAll(".reveal, .reveal-stagger").forEach(el => {
    revealObserver.observe(el);
});

// Gallery brightness reveal via IntersectionObserver
const galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            galleryObserver.unobserve(entry.target);
        }
    });
}, {threshold: 0.2});

document.querySelectorAll(".gallery-main, .gallery-thumb").forEach(el => {
    galleryObserver.observe(el);
});

// Booking form
const bookingForm = document.getElementById("booking-form");
const bookingFeedback = document.getElementById("booking-feedback");

function showFeedback(msg, type) {
    bookingFeedback.textContent = msg;
    bookingFeedback.className = "form-feedback " + type;
    bookingFeedback.style.display = "block";
    setTimeout(() => {
        bookingFeedback.style.display = "none";
    }, 6000);
}

bookingForm.addEventListener("submit", e => {
    e.preventDefault();
    const nome = document.getElementById("b-name").value.trim();
    const cognome = document.getElementById("b-surname").value.trim();
    const phone = document.getElementById("b-phone").value.trim();
    // const email = document.getElementById("b-email").value.trim();
    // const service = document.getElementById("b-service").value;
    // const date = document.getElementById("b-date").value;
    // const time = document.getElementById("b-time").value;
    const note = document.getElementById("b-note").value.trim();

    if (!nome || !cognome || !phone) {
        showFeedback("Per favore, compila i campi obbligatori: Nome, Cognome, Telefono", "error");
        return;
    }

    const subject = `Richiesta appuntamento – ${nome} ${cognome}`;
    const body = [
        `Nome: ${nome} ${cognome}`,
        `Telefono: ${phone}`,
        // email ? `Email: ${email}` : "",
        // `Servizio richiesto: ${service}`,
        // date ? `Data preferita: ${date}` : "",
        // time ? `Orario preferito: ${time}` : "",
        note ? `\nNote:\n${note}` : ""
    ].filter(Boolean).join("\n");

    window.location.href = `mailto:mariapia.carrieri.logopedista@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showFeedback("Grazie! Si aprirà il tuo client di posta. Puoi anche scrivere direttamente su WhatsApp.", "success");
    bookingForm.reset();
});

// ── Lightbox ───────────────────────────────────────────────
(function () {
    const dialog = document.getElementById("lb-dialog");
    const frame = document.getElementById("lb-frame");
    const img = document.getElementById("lb-img");
    const btnClose = document.getElementById("lb-close");
    const btnPrev = document.getElementById("lb-prev");
    const btnNext = document.getElementById("lb-next");
    const dotsWrap = document.getElementById("lb-dots");

    // Collect all lightbox-tagged elements, preserving DOM order
    let items = [];
    let current = 0;

    function buildItems() {
        items = Array.from(document.querySelectorAll("[data-lightbox]")).map(el => ({
            src: el.dataset.lightboxSrc || el.querySelector("img")?.src || "",
            alt: el.dataset.lightboxAlt || el.querySelector("img")?.alt || ""
        }));
        // Build dots
        dotsWrap.innerHTML = "";
        items.forEach((_, i) => {
            const dot = document.createElement("span");
            dot.className = "lb-dot";
            dot.addEventListener("click", () => goTo(i));
            dotsWrap.appendChild(dot);
        });
    }

    function goTo(index) {
        current = (index + items.length) % items.length;
        img.src = items[current].src;
        img.alt = items[current].alt;
        // Update dots
        dotsWrap.querySelectorAll(".lb-dot").forEach((d, i) =>
            d.classList.toggle("active", i === current)
        );
        // Hide nav if only one image
        btnPrev.style.display = items.length < 2 ? "none" : "";
        btnNext.style.display = items.length < 2 ? "none" : "";
    }

    function openDialog(index) {
        console.log("Opening dialog for gallery item", index);
        buildItems();
        goTo(index);
        dialog.showModal();
        btnClose.focus();
    }

    function closeDialog() {
        dialog.close();
        img.src = "";
    }

    // Click on ::backdrop area (outside .lb-frame) closes the dialog
    dialog.addEventListener("click", e => {
        if (!frame.contains(e.target)) closeDialog();
    });

    // Attach click/keyboard to gallery items
    document.querySelectorAll("[data-lightbox]").forEach((el, i) => {
        console.log("Attaching event listeners to gallery item", i);
        el.addEventListener("click", () => openDialog(i));
        el.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openDialog(i);
            }
        });
    });

    btnClose.addEventListener("click", closeDialog);
    btnPrev.addEventListener("click", (e) => {
        e.stopPropagation();
        goTo(current - 1);
    });
    btnNext.addEventListener("click", (e) => {
        e.stopPropagation();
        goTo(current + 1);
    });

    // Keyboard nav (ArrowLeft/Right — Escape is handled natively by <dialog>)
    dialog.addEventListener("keydown", e => {
        if (e.key === "ArrowLeft") goTo(current - 1);
        if (e.key === "ArrowRight") goTo(current + 1);
    });

    // Swipe support
    let touchStartX = 0;
    frame.addEventListener("touchstart", e => {
        touchStartX = e.touches[0].clientX;
    }, {passive: true});
    frame.addEventListener("touchend", e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
    });
})();