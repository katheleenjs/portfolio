/* =========================================================
   SHARED.JS: tema, idioma, menu, footer
   Carregado em todas as páginas, depois de i18n.js
========================================================= */
(function () {
    "use strict";

    var root = document.documentElement;
    var LANGS = ["pt", "en", "es"];
    var HTML_LANG = { pt: "pt-BR", en: "en", es: "es" };

    function read(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }
    function write(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* ignora */ }
    }

    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* ---------------------------------------------------------
       IDIOMA
       O texto-base das páginas é o português. Para os outros
       idiomas, cada texto é procurado em window.SITE_I18N.
    --------------------------------------------------------- */
    var dict = window.SITE_I18N || { en: {}, es: {} };
    var lang = "pt";

    var textOriginals = new WeakMap();
    var attrOriginals = new WeakMap();
    var ATTRS = ["alt", "aria-label", "title", "placeholder"];

    function norm(s) { return s.replace(/\s+/g, " ").trim(); }

    function t(pt) {
        if (lang === "pt" || !pt) return pt;
        var found = dict[lang] && dict[lang][norm(pt)];
        return found || pt;
    }

    function skipped(node) {
        var el = node.parentElement;
        if (!el) return true;
        var tag = el.tagName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return true;
        return !!el.closest("[data-i18n-skip]");
    }

    function translateTextNodes() {
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        var node;

        while ((node = walker.nextNode())) {
            if (skipped(node)) continue;

            var original = textOriginals.get(node);

            if (original === undefined) {
                if (!node.nodeValue.trim()) continue;
                original = node.nodeValue;
                textOriginals.set(node, original);
            }

            if (lang === "pt") {
                node.nodeValue = original;
                continue;
            }

            var translated = dict[lang] && dict[lang][norm(original)];
            if (translated) {
                var lead = original.match(/^\s*/)[0];
                var trail = original.match(/\s*$/)[0];
                node.nodeValue = lead + translated + trail;
            } else {
                node.nodeValue = original;
            }
        }
    }

    function translateAttributes() {
        var selector = ATTRS.map(function (a) { return "[" + a + "]"; }).join(",");

        document.body.querySelectorAll(selector).forEach(function (el) {
            if (el.closest("[data-i18n-skip]")) return;

            var saved = attrOriginals.get(el);
            if (!saved) { saved = {}; attrOriginals.set(el, saved); }

            ATTRS.forEach(function (attr) {
                if (!el.hasAttribute(attr)) return;
                if (saved[attr] === undefined) saved[attr] = el.getAttribute(attr);
                el.setAttribute(attr, lang === "pt" ? saved[attr] : t(saved[attr]));
            });
        });
    }

    var metaOriginals = {};

    function translateHead() {
        if (metaOriginals.title === undefined) metaOriginals.title = document.title;
        document.title = t(metaOriginals.title);

        document.querySelectorAll(
            'meta[name="description"], meta[property="og:title"], meta[property="og:description"]'
        ).forEach(function (meta, i) {
            var key = "meta" + i;
            if (metaOriginals[key] === undefined) metaOriginals[key] = meta.getAttribute("content");
            meta.setAttribute("content", t(metaOriginals[key]));
        });
    }

    function updateLangButtons() {
        document.querySelectorAll("[data-lang]").forEach(function (btn) {
            btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === lang));
        });
    }

    function setLang(next, persist) {
        if (LANGS.indexOf(next) === -1) next = "pt";
        lang = next;

        root.lang = HTML_LANG[lang];
        if (persist) write("lang", lang);

        translateTextNodes();
        translateAttributes();
        translateHead();
        updateLangButtons();
        updateThemeLabel();
        updateMenuLabel();

        document.dispatchEvent(new CustomEvent("sitelangchange", { detail: { lang: lang } }));
    }

    function detectLang() {
        var saved = read("lang");
        if (saved && LANGS.indexOf(saved) !== -1) return saved;

        var browser = (navigator.language || "pt").toLowerCase();
        if (browser.indexOf("en") === 0) return "en";
        if (browser.indexOf("es") === 0) return "es";
        return "pt";
    }

    /* ---------------------------------------------------------
       TEMA
    --------------------------------------------------------- */
    var themeBtn = document.querySelector("[data-sh-theme]");
    var systemQuery = window.matchMedia("(prefers-color-scheme: light)");

    function currentTheme() {
        return root.getAttribute("data-theme") === "light" ? "light" : "dark";
    }

    function updateThemeLabel() {
        if (!themeBtn) return;
        var isLight = currentTheme() === "light";
        themeBtn.setAttribute(
            "aria-label",
            t(isLight ? "Ativar modo noturno" : "Ativar modo claro")
        );
        themeBtn.setAttribute("aria-pressed", String(!isLight));
    }

    function setTheme(theme, persist) {
        root.setAttribute("data-theme", theme);
        if (persist) write("theme", theme);

        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", theme === "light" ? "#f7f7fa" : "#09090b");

        updateThemeLabel();
        document.dispatchEvent(new CustomEvent("sitethemechange", { detail: { theme: theme } }));
    }

    /* ---------------------------------------------------------
       MENU MOBILE, NAVBAR E LINK ATIVO
    --------------------------------------------------------- */
    var menu = document.getElementById("sh-menu");
    var menuBtn = document.querySelector("[data-sh-menu-toggle]");
    var nav = document.querySelector(".sh-nav");

    function updateMenuLabel() {
        if (!menuBtn || !menu) return;
        var open = menu.classList.contains("open");
        menuBtn.setAttribute("aria-label", t(open ? "Fechar menu" : "Abrir menu"));
    }

    function setMenu(open) {
        if (!menu || !menuBtn) return;
        menu.classList.toggle("open", open);
        menuBtn.setAttribute("aria-expanded", String(open));
        updateMenuLabel();
    }

    function initMenu() {
        if (!menu || !menuBtn) return;

        menuBtn.addEventListener("click", function () {
            setMenu(!menu.classList.contains("open"));
        });

        menu.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", function () { setMenu(false); });
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && menu.classList.contains("open")) {
                setMenu(false);
                menuBtn.focus();
            }
        });

        document.addEventListener("click", function (e) {
            if (menu.classList.contains("open") && !e.target.closest(".sh-nav")) setMenu(false);
        });
    }

    function initNavbarScroll() {
        if (!nav) return;
        function update() { nav.classList.toggle("scrolled", window.scrollY > 40); }
        window.addEventListener("scroll", update, { passive: true });
        update();
    }

    function initActiveLink() {
        var links = Array.prototype.slice.call(document.querySelectorAll(".sh-menu a"));
        if (!links.length) return;

        var isHome = document.body.hasAttribute("data-sh-home");

        if (!isHome) {
            // Páginas de case: "Projetos" fica destacado
            links.forEach(function (a) {
                if ((a.getAttribute("href") || "").indexOf("#projetos") !== -1) {
                    a.classList.add("active");
                    a.setAttribute("aria-current", "true");
                }
            });
            return;
        }

        var sections = links
            .map(function (a) {
                var id = (a.getAttribute("href") || "").replace("#", "");
                return id ? document.getElementById(id) : null;
            })
            .filter(Boolean);

        function update() {
            var current = "";
            sections.forEach(function (s) {
                if (window.scrollY >= s.offsetTop - 220) current = s.id;
            });
            links.forEach(function (a) {
                var on = a.getAttribute("href") === "#" + current;
                a.classList.toggle("active", on);
                if (on) a.setAttribute("aria-current", "true");
                else a.removeAttribute("aria-current");
            });
        }

        window.addEventListener("scroll", update, { passive: true });
        update();
    }

    function initBackToTop() {
        document.querySelectorAll("[data-sh-top]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
                var logo = document.querySelector(".sh-logo");
                if (logo) logo.focus({ preventScroll: true });
            });
        });
    }

    /* ---------------------------------------------------------
       INÍCIO
    --------------------------------------------------------- */
    window.siteI18n = {
        t: t,
        get lang() { return lang; }
    };

    function init() {
        var savedTheme = read("theme");
        setTheme(
            savedTheme === "light" || savedTheme === "dark"
                ? savedTheme
                : (systemQuery.matches ? "light" : "dark"),
            false
        );

        if (themeBtn) {
            themeBtn.addEventListener("click", function () {
                setTheme(currentTheme() === "light" ? "dark" : "light", true);
            });
        }

        systemQuery.addEventListener("change", function (e) {
            if (!read("theme")) setTheme(e.matches ? "light" : "dark", false);
        });

        document.querySelectorAll("[data-lang]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                setLang(btn.getAttribute("data-lang"), true);
            });
        });

        initMenu();
        initNavbarScroll();
        initActiveLink();
        initBackToTop();

        setLang(detectLang(), false);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

