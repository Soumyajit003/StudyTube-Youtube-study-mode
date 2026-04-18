console.log("✅Study mode is running...");

// ======================== Feature 1: Shorts Blocker ========================
(function () {
  let lastUrl = location.href;

  // ----------------- Shorts Blocking -----------------
  function blockShorts() {
    if (window.location.pathname.startsWith("/shorts")) {
      window.location.href = "/";
    }
  }

  // remove shorts video renderers from the page
  function removeShortsUI() {
    // remove shorts shelf (homepage)
    const shortsShelfs = document.querySelectorAll("ytd-shorts-shelf-renderer");
    shortsShelfs.forEach((shelf) => shelf.remove());

    // remove shorts video renderers
    const shortsRenderers = document.querySelectorAll(
      "ytd-reel-video-renderer"
    );
    shortsRenderers.forEach((renderer) => renderer.remove());

    // remove shorts button forom the sidebar
    const shortsButton = document.querySelector("a[title='Shorts']");
    if (shortsButton) shortsButton.style.display = "none";
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

  // ----------------- Runner -----------------
  function runShortsFeatures(){
    blockShorts();
    removeShortsUI();
  }

  runShortsFeatures();  // run immediately on page load

  // handle dynamic page changes (YouTube is a SPA, so we need to check for URL changes)
  setInterval(() => {
    if(lastUrl !== location.href) {
      lastUrl = location.href;
      console.log("[NAV] URL changed");
      runShortsFeatures();
    }
  }, 1000);

  // add click listener to block shorts clicks
    document.addEventListener("click", handleShortsClicks);

})();
