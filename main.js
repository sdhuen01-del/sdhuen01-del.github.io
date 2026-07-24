// ===================================================================
// 김도철 포트폴리오 — 공통 스크립트
// ===================================================================
(function () {
  "use strict";

  var PAGES = [
    { id: "home", href: "index.html", label: "Home" },
    { id: "story", href: "story.html", label: "Story" },
    { id: "skills", href: "skills.html", label: "Skills" },
    { id: "work", href: "work.html", label: "Work" },
    { id: "troubleshooting", href: "troubleshooting.html", label: "Troubleshooting" },
    { id: "goals", href: "goals.html", label: "Goals" },
    { id: "contact", href: "contact.html", label: "Contact" }
  ];

  function currentPage() {
    return document.body.getAttribute("data-page") || "home";
  }

  /* ---------- Rail active state + progress fill ---------- */
  function initRail() {
    var current = currentPage();
    var idx = PAGES.findIndex(function (p) { return p.id === current; });
    var items = document.querySelectorAll(".rail-item, .drawer-item");
    items.forEach(function (el) {
      if (el.getAttribute("data-page") === current) el.classList.add("active");
    });
    var fill = document.querySelector(".rail-line-fill");
    if (fill && idx >= 0) {
      var journeyCount = PAGES.length - 1; // Home 제외 6단계
      var journeyIdx = Math.max(idx - 1, 0);
      var pct = current === "home" ? 4 : ((journeyIdx + 1) / journeyCount) * 100;
      requestAnimationFrame(function () {
        fill.style.height = pct + "%";
      });
    }
  }

  /* ---------- Mobile drawer ---------- */
  function initDrawer() {
    var burger = document.querySelector(".burger");
    var rail = document.querySelector(".rail");
    var scrim = document.querySelector(".scrim");
    if (!burger || !rail || !scrim) return;
    function close() {
      burger.classList.remove("open");
      rail.classList.remove("drawer-open");
      scrim.classList.remove("show");
    }
    burger.addEventListener("click", function () {
      var isOpen = rail.classList.toggle("drawer-open");
      burger.classList.toggle("open", isOpen);
      scrim.classList.toggle("show", isOpen);
    });
    scrim.addEventListener("click", close);
    document.querySelectorAll(".rail-item").forEach(function (a) {
      a.addEventListener("click", close);
    });
  }

  /* ---------- Mobile scroll progress ---------- */
  function initTopProgress() {
    var bar = document.querySelector(".topbar-progress");
    if (!bar) return;
    function update() {
      var h = document.documentElement;
      var scrolled = h.scrollTop;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (scrolled / max) * 100 : 0;
      bar.style.width = pct + "%";
    }
    document.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal, .reveal-scale, .journey-svg");
    if (!("IntersectionObserver" in window) || els.length === 0) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach(function (el) { io.observe(el); });
  }

  /* stagger children automatically via data-stagger wrapper */
  function initStagger() {
    document.querySelectorAll("[data-stagger]").forEach(function (group) {
      var step = parseFloat(group.getAttribute("data-stagger")) || 0.08;
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.classList.add("reveal");
        child.style.setProperty("--d", i * step + "s");
      });
    });
  }

  /* ---------- Skill bars ---------- */
  function initSkillBars() {
    var bars = document.querySelectorAll(".skillbar-fill");
    if (bars.length === 0) return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var level = el.getAttribute("data-level") || "0";
            requestAnimationFrame(function () {
              el.style.width = level + "%";
            });
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    bars.forEach(function (b) { io.observe(b); });
  }

  /* ---------- Count up numbers ---------- */
  function initCountUp() {
    var nums = document.querySelectorAll("[data-count]");
    if (nums.length === 0) return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var target = parseFloat(el.getAttribute("data-count"));
          var suffix = el.getAttribute("data-suffix") || "";
          var dur = 1200;
          var start = null;
          function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            var val = target < 10 && target % 1 !== 0 ? (target * eased).toFixed(1) : Math.floor(target * eased);
            el.textContent = val + suffix;
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target + suffix;
          }
          requestAnimationFrame(step);
          io.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---------- Page transition fade ---------- */
  function initPageTransitions() {
    requestAnimationFrame(function () {
      document.body.classList.add("page-loaded");
    });
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) {
        document.body.classList.remove("page-exit");
        document.body.classList.add("page-loaded");
      }
    });

    document.querySelectorAll('a[href$=".html"]').forEach(function (link) {
      if (link.target === "_blank") return;
      if (link.hostname && link.hostname !== window.location.hostname) return;
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href");
        if (!href || href.charAt(0) === "#") return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        document.body.classList.remove("page-loaded");
        document.body.classList.add("page-exit");
        setTimeout(function () {
          window.location.href = href;
        }, 300);
      });
    });
  }

  /* ---------- Journey marker (scroll-linked) ---------- */
  function initJourneyMarker() {
    var svg = document.querySelector(".journey-svg");
    if (!svg) return;
    var path = svg.querySelector("path.route");
    var marker = svg.querySelector(".journey-marker");
    if (!path || !marker) return;
    var len = path.getTotalLength();

    function update() {
      var rect = svg.getBoundingClientRect();
      var vh = window.innerHeight;
      var start = vh * 0.85;
      var end = vh * 0.2;
      var total = rect.height + (start - end);
      var traveled = start - rect.top;
      var progress = total > 0 ? traveled / total : 0;
      progress = Math.max(0, Math.min(1, progress));
      var pt = path.getPointAtLength(progress * len);
      marker.setAttribute("cx", pt.x);
      marker.setAttribute("cy", pt.y);
    }
    document.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initRail();
    initDrawer();
    initTopProgress();
    initStagger();
    initReveal();
    initSkillBars();
    initCountUp();
    initPageTransitions();
    initJourneyMarker();
  });
})();
