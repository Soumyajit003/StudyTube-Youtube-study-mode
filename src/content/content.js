console.log("✅Study mode is running...");

// ======================== Feature 1: Shorts Blocker ========================
(function () {
  let lastUrl = location.href;

  // ----------------- Shorts Blocking -----------------
  function blockShortsPage() {
    if (window.location.pathname.startsWith("/shorts")) {
      console.log("[Shorts] Redirecting to homepage...");
      window.location.replace("https://www.youtube.com/");
    }
  }

  // remove shorts video renderers from the page
  function removeShortsUI() {
    try {
      // remove shorts shelf (homepage)
      const shortsShelfs = document.querySelectorAll(
        "ytd-shorts-shelf-renderer",
      );
      shortsShelfs.forEach((shelf) => shelf?.remove());

      // remove shorts video renderers
      const shortsRenderers = document.querySelectorAll(
        "ytd-reel-video-renderer",
      );
      shortsRenderers.forEach((renderer) => renderer?.remove());

      // remove shorts section from the homepage
      const shortsSectionHome = document.querySelectorAll(
        "ytd-rich-section-renderer",
      );
      shortsSectionHome.forEach((section) => section?.remove());

      // remove shorts button forom the sidebar
      const shortsButton = document.querySelector("a[title='Shorts']");
      if (shortsButton) shortsButton.style.display = "none";
    } catch (error) {
      console.log("[Shorts Error]", err);
    }
  }

  // ----------------- Shorts Click Blocking -----------------
  function handleShortsClicks(e) {
    // This runs whenever the user clicks anywhere on the page
    const link = e.target.closest("a");

    if (!link) return;

    if (link.href && link.href.includes("/shorts/")) {
      e.preventDefault();
      console.log("[Shorts] click Blocked!!!");
      alert("🚫 Shorts are blocked in Study Mode");
    }
  }

  // ----------------- Mutation Observer for Dynamic Content -----------------
  function initObserver() {
    const observer = new MutationObserver(() => {
      removeShortsUI();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    console.log("[Observer] MutationObserver initialized");
  }

  // ----------------- Runner -----------------
  // initial run on page load
  function init() {
    blockShortsPage();
    removeShortsUI();
    initObserver();
  }

  init();

  // handle dynamic page changes (YouTube is a SPA, so we need to check for URL changes)
  setInterval(() => {
    if (lastUrl !== location.href) {
      lastUrl = location.href;
      console.log("[NAV] URL changed");

      blockShortsPage();
    }
  }, 500);

  // add click listener to block shorts clicks
  document.addEventListener("click", handleShortsClicks);
})();
