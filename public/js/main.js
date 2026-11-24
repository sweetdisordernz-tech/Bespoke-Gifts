(function () {
  "use strict";

  // Each feature is isolated in its own try/catch so a failure in one
  // (e.g. a missing nav element) can never block the others, in
  // particular the scroll-reveal fallback below, which must always run
  // or content stays invisible.

  function initNav() {
    var menuToggle = document.getElementById("menuToggle");
    var mainNav = document.getElementById("mainNav");
    var backdrop = document.getElementById("drawerBackdrop");
    if (!menuToggle || !mainNav || !backdrop) return;

    function openDrawer() {
      mainNav.classList.add("is-open");
      menuToggle.setAttribute("aria-expanded", "true");
      backdrop.hidden = false;
      document.body.style.overflow = "hidden";
    }

    function closeDrawer() {
      mainNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      backdrop.hidden = true;
      document.body.style.overflow = "";
    }

    menuToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.contains("is-open");
      if (isOpen) closeDrawer(); else openDrawer();
    });

    backdrop.addEventListener("click", closeDrawer);

    // ---- Dropdown menus (By Occasion, By Recipient, Collections, More Gifts, About) ----
    var dropdownItems = Array.prototype.slice.call(document.querySelectorAll(".nav-item.has-dropdown"));

    function closeAllDropdowns(except) {
      dropdownItems.forEach(function (item) {
        if (item === except) return;
        item.classList.remove("open");
        var trigger = item.querySelector(".nav-caret, .nav-link--toggle");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeDrawer();
        closeAllDropdowns();
      }
    });

    dropdownItems.forEach(function (item) {
      var trigger = item.querySelector(".nav-caret, .nav-link--toggle");
      if (!trigger) return;

      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        var isOpen = item.classList.contains("open");
        closeAllDropdowns(item);
        item.classList.toggle("open", !isOpen);
        trigger.setAttribute("aria-expanded", String(!isOpen));
      });
    });

    document.addEventListener("click", function (e) {
      var withinDropdown = e.target.closest(".nav-item.has-dropdown");
      if (!withinDropdown) closeAllDropdowns();
    });

    // Close the mobile drawer whenever a real navigation link is followed.
    mainNav.querySelectorAll(".dropdown-panel a, .nav-item:not(.has-dropdown) .nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        closeDrawer();
      });
    });

    // Reset open dropdowns / drawer state when resizing across the mobile breakpoint.
    var mobileQuery = window.matchMedia("(max-width: 900px)");
    mobileQuery.addEventListener("change", function () {
      closeDrawer();
      closeAllDropdowns();
    });
  }

  function initHeaderShadow() {
    var siteHeader = document.querySelector(".site-header");
    if (!siteHeader) return;

    var ticking = false;
    function updateHeaderShadow() {
      siteHeader.classList.toggle("is-scrolled", window.scrollY > 4);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(updateHeaderShadow);
        ticking = true;
      }
    }, { passive: true });
    updateHeaderShadow();
  }

  function initScrollReveal() {
    var revealTargets = document.querySelectorAll(".reveal");
    if (!revealTargets.length) return;

    if (!("IntersectionObserver" in window)) {
      revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    revealTargets.forEach(function (el) { revealObserver.observe(el); });

    // Safety net: if anything about the observer misbehaves, never leave
    // content permanently invisible.
    window.setTimeout(function () {
      revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
    }, 4000);
  }

  // Same label colours the dashboard offers for a bespoke order (lib/
  // bespoke/labelColours.ts in sweetdisordernz-tech/dashboard) - kept in
  // step by hand, same as this page's other dashboard-sourced copy.
  var LABEL_COLOURS = [
    { name: "Yellow", hex: "#F2B705" },
    { name: "Gold", hex: "#C9A15B" },
    { name: "Orange", hex: "#F28C28" },
    { name: "Red", hex: "#D7263D" },
    { name: "Baby pink (coming soon mid-December)", hex: "#F4A6C1" },
    { name: "Hot pink", hex: "#E83E8C" },
    { name: "Purple", hex: "#7B3F75" },
    { name: "Navy", hex: "#1F3A68" },
    { name: "Blue", hex: "#2E86DE" },
    { name: "Green", hex: "#3BA55C" },
    { name: "Silver", hex: "#B0B7BD" },
    { name: "Concrete", hex: "#9C9C94" },
    { name: "Soft teal (coming soon mid-December)", hex: "#9FD4CE" }
  ];

  // Same sweet range already listed in the "Available Sweet Options"
  // section above on this page.
  var SWEET_TYPES = [
    "Giant Jelly Beans", "Jelly Beans", "Blue Bubblegum Jelly Beans", "Black Jelly Beans",
    "Kiwifruit Rock", "Strawberry Rock", "Assorted Fruit Rock", "Jersey Caramels",
    "Wine Gums", "Gummy Bears", "Gummy Strawberries", "Spearmint Leaves",
    "Sour Peach Hearts", "Sour Apple Rings", "Sour Peach Rings", "Gummy Cola Bottles",
    "Fizzy Cola Bottles", "Fruit Jubes", "Blacks Balls", "Granny Mints",
    "Aniseed Balls", "Barley Sugars", "Butterscotch", "Fruit Balls",
    "Humbugs", "Lemon Acid Drops", "Fruit Fizzies", "Wrapped Mint Candies"
  ];

  // Where the quote form actually submits to: the dashboard app
  // (sweetdisordernz-tech/dashboard), which is where every other order -
  // wholesale, online, bespoke - already lives. This static site has no
  // backend of its own, so this is a plain cross-origin POST straight
  // from the browser; the dashboard endpoint allows any origin since it
  // only ever creates a lead, nothing it returns is sensitive.
  var BESPOKE_ENQUIRY_ENDPOINT = "https://dashboard-nu-murex-70.vercel.app/api/public/bespoke-enquiry";

  function initColourReferenceList() {
    var list = document.getElementById("colourReferenceList");
    if (!list) return;
    LABEL_COLOURS.forEach(function (c) {
      var li = document.createElement("li");
      li.className = "swatch";
      var dot = document.createElement("span");
      dot.className = "swatch__dot";
      dot.style.background = c.hex;
      if (c.hex.toLowerCase() === "#ffffff") dot.style.border = "1px solid rgba(26,26,26,0.3)";
      li.appendChild(dot);
      li.appendChild(document.createTextNode(c.name));
      list.appendChild(li);
    });
  }

  function initQuoteForm() {
    var form = document.getElementById("quoteForm");
    var thanks = document.getElementById("quoteThanks");
    var status = document.getElementById("quoteStatus");
    var submitBtn = document.getElementById("quoteSubmit");
    var colourPicker = document.getElementById("colourPicker");
    var sweetSelect = document.getElementById("sweetType");
    var logoFileInput = document.getElementById("logoFile");
    if (!form || !thanks || !colourPicker || !sweetSelect || !logoFileInput) return;

    // Delivery date: today through end of 2027.
    var dateInput = document.getElementById("deliveryDate");
    if (dateInput) {
      var todayStr = new Date().toISOString().slice(0, 10);
      dateInput.min = todayStr;
    }

    LABEL_COLOURS.forEach(function (c, i) {
      var label = document.createElement("label");
      label.className = "quote__colour";
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "labelColourName";
      input.value = c.name;
      if (i === 0) input.checked = true;
      var dot = document.createElement("span");
      dot.className = "quote__colour__dot";
      dot.style.background = c.hex;
      label.appendChild(input);
      label.appendChild(dot);
      label.appendChild(document.createTextNode(c.name));
      colourPicker.appendChild(label);
    });

    SWEET_TYPES.forEach(function (name) {
      var option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      sweetSelect.appendChild(option);
    });

    // The file input only matters once a placement is actually chosen -
    // kept disabled (and cleared) otherwise, so "No logo" can never
    // accidentally submit a file picked earlier.
    form.querySelectorAll('input[name="logoPlacement"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        var wantsLogo = radio.value !== "none" && radio.checked;
        logoFileInput.disabled = !wantsLogo;
        if (!wantsLogo) logoFileInput.value = "";
      });
    });

    function setStatus(message, isError) {
      if (!status) return;
      status.textContent = message || "";
      status.classList.toggle("is-error", !!isError);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      submitBtn.disabled = true;
      setStatus("Sending...", false);

      var data = new FormData(form);

      fetch(BESPOKE_ENQUIRY_ENDPOINT, { method: "POST", body: data })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (body) {
            if (!res.ok) throw new Error(body.error || "Something went wrong sending that. Please try again, or email molly@sweetdisorder.co.nz directly.");
            return body;
          });
        })
        .then(function () {
          form.hidden = true;
          thanks.hidden = false;
          thanks.scrollIntoView({ behavior: "smooth", block: "center" });
        })
        .catch(function (err) {
          setStatus(err.message, true);
          submitBtn.disabled = false;
        });
    });
  }

  [initNav, initHeaderShadow, initScrollReveal, initColourReferenceList, initQuoteForm].forEach(function (init) {
    try { init(); } catch (err) { /* one feature failing must not block the others */ }
  });
})();
