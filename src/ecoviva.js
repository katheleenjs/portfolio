document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".case-navbar");
    const navLinks = document.querySelectorAll(
        ".case-navigation a"
    );

    const sections = document.querySelectorAll(
        "main section[id]"
    );

    /* =====================================================
       NAVBAR AO ROLAR A PÁGINA
    ===================================================== */

    function handleNavbar() {
        if (window.scrollY > 40) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    }

    window.addEventListener("scroll", handleNavbar);

    handleNavbar();


    /* =====================================================
       LINK ATIVO NA NAVEGAÇÃO
    ===================================================== */

    function updateActiveLink() {
        let currentSection = "";

        sections.forEach((section) => {
            const sectionTop =
                section.offsetTop - 180;

            const sectionHeight =
                section.offsetHeight;

            if (
                window.scrollY >= sectionTop &&
                window.scrollY <
                sectionTop + sectionHeight
            ) {
                currentSection = section.id;
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("active");

            if (
                link.getAttribute("href") ===
                `#${currentSection}`
            ) {
                link.classList.add("active");
            }
        });
    }

    window.addEventListener(
        "scroll",
        updateActiveLink
    );

    updateActiveLink();


    /* =====================================================
       ANIMAÇÃO DE ENTRADA DAS SEÇÕES
    ===================================================== */

    const animatedElements = document.querySelectorAll(
        `
        .case-section,
        .eco30-section,
        .case-closing,
        .learning-grid article,
        .solution-features article,
        .eco30-card,
        .version-card,
        .process-step,
        .screen-preview
        `
    );

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(
                        "is-visible"
                    );

                    observer.unobserve(
                        entry.target
                    );
                }
            });
        },
        {
            threshold: 0.12
        }
    );

    animatedElements.forEach((element) => {
        element.classList.add("reveal");

        observer.observe(element);
    });


    /* =====================================================
       EFEITO NO VISUAL DO HERO
    ===================================================== */

    const heroVisual = document.querySelector(
        ".hero-visual"
    );

    if (heroVisual) {
        heroVisual.addEventListener(
            "mousemove",
            (event) => {
                const rect =
                    heroVisual.getBoundingClientRect();

                const x =
                    event.clientX -
                    rect.left;

                const y =
                    event.clientY -
                    rect.top;

                const moveX =
                    (x / rect.width - 0.5) * 12;

                const moveY =
                    (y / rect.height - 0.5) * 12;

                heroVisual.style.transform =
                    `translate(${moveX}px, ${moveY}px)`;
            }
        );

        heroVisual.addEventListener(
            "mouseleave",
            () => {
                heroVisual.style.transform =
                    "translate(0, 0)";
            }
        );
    }


    /* =====================================================
       RESPEITA PREFERÊNCIA DE MOVIMENTO REDUZIDO
    ===================================================== */

    const prefersReducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

    if (prefersReducedMotion.matches) {
        animatedElements.forEach((element) => {
            element.classList.add("is-visible");
        });
    }
});