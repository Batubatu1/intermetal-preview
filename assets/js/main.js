/* Intermetal — main.js
   Nav, mobiel menu, scroll-reveals, contactformulier. */
(function () {
  "use strict";

  /* ---------- nav: scrolled-state ---------- */
  var nav = document.querySelector(".nav");
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle("scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- mobiel menu ---------- */
  var burger = document.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".menu-overlay a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        document.body.classList.remove("menu-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- scroll-reveals ---------- */
  var revealEls = document.querySelectorAll(".rv, [data-stagger]");
  if (/allin/.test(location.search)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- contactformulier → e-mail ---------- */
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var g = function (n) { return (form.querySelector('[name="' + n + '"]') || {}).value || ""; };
      var subject = encodeURIComponent("[Website] " + g("onderwerp"));
      var body = encodeURIComponent(
        "Naam: " + g("naam") + " " + g("achternaam") + "\n" +
        "Telefoon: " + g("telefoon") + "\n" +
        "E-mail: " + g("email") + "\n\n" +
        g("bericht")
      );
      window.location.href = "mailto:info@intermetal.nl?subject=" + subject + "&body=" + body;
    });
  }
})();
