console.log("✅Study mode is running...");

(function () {
  let lastUrl = location.href;

  // ======================== Settings ========================
  let settings = {
    studyMode: true,
    shortsBlock: true,
    filtering: true,
  };

  // load initial settings
  chrome.storage.sync.get(["studyMode", "shortsBlock", "filtering"], (storedSettings) => {
    settings = { ...settings, ...storedSettings };
    console.log("[Settings] Loaded settings:", settings);
    applyFeatures();
  });

  // listen for real-time settings changes
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;

    for (let key in changes) {
      settings[key] = changes[key].newValue;
    }
    console.log("[Settings] Updated settings:", settings);
    applyFeatures();
  });

  // listen for popup message (instant trigger)
  chrome.runtime.onMessage.addListener((msg) => {
    if(msg.type === "SETTINGS_UPDATED"){
      console.log("Message received from popup...");

      chrome.storage.sync.get(["studyMode", "shortsBlock", "filtering"], (storedSettings) => {
        settings = { ...settings, ...storedSettings };
        applyFeatures();
      })
    }
  })

  // ======================== Core CONTROLLER ========================
  function applyFeatures() {
    console.log("[ApplyFeatrues] Applying features with settings:", settings);

    resetUI();

    if (!settings.studyMode) return;

    if (settings.shortsBlock) {
      blockShortsPage();
      removeShortsUI();
    }

    if (settings.filtering) {
      filterContent();
    }
  }

  // ======================== Reset UI ========================
  function resetUI() {
    const videos = document.querySelectorAll(
      "ytd-rich-item-renderer, ytd-video-renderer, yt-lockup-view-model",
    );

    videos.forEach((video) => {
      video.style.opacity = "1";
      video.style.pointerEvents = "auto";

      const thumbnailDiv = video.querySelector("yt-thumbnail-view-model div");
      const thumbnailImg = video.querySelector("ytd-thumbnail");
      const title = video.querySelector("h3");
      const desc = video.querySelector("yt-formatted-string");

      if (thumbnailDiv) thumbnailDiv.style.filter = "none";
      if (thumbnailImg) thumbnailImg.style.filter = "none";
      if (title) title.style.filter = "none";
      if (desc) desc.style.filter = "none";
    });
  }

  // ======================== Feature 1: Shorts Blocker ========================

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

      // remove shorts section from the suggestions page
      const shortsSectionSuggestions = document.querySelectorAll(
        "yt-horizontal-list-renderer",
      );
      shortsSectionSuggestions.forEach((section) => section?.remove());

      // remove shorts section from the homepage
      const shortsSectionHome = document.querySelectorAll(
        "ytd-rich-section-renderer",
      );
      shortsSectionHome.forEach((section) => section?.remove());

      // remove shorts section from the search results page
      const shortsSectionSearch = document.querySelectorAll(
        "grid-shelf-view-model",
      );
      shortsSectionSearch.forEach((section) => section?.remove());

      // remove shorts button from the sidebar
      const shortsButton = document.querySelector("a[title='Shorts']");
      if (shortsButton) shortsButton.style.display = "none";
    } catch (error) {
      console.log("[Shorts Error]", error);
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
  // add click listener to block shorts clicks
  document.addEventListener("click", handleShortsClicks);

  // ======================== Feature 2: Filtering content ========================

  // ------------------ Core filtering logic -----------------
  const allowedKeywords = [
    // Programming & Web Dev
    "react",
    "javascript",
    "typescript",
    "nodejs",
    "python",
    "java",
    "rust",
    "golang",
    "php",
    "ruby",
    "swift",
    "kotlin",
    "dart",
    "html",
    "sass",
    "tailwind",
    "bootstrap",
    "nextjs",
    "vuejs",
    "angular",
    "svelte",
    "express",
    "fastapi",
    "django",
    "coding",
    "tutorial",
    "course",
    "programming",
    "development",
    "roadmap",
    "developer",
    "devops",
    "backend",
    "frontend",
    "fullstack",

    // CS Fundamentals
    "algorithm",
    "data structure",
    "leetcode",
    "system design",
    "design pattern",
    "operating system",
    "computer science",
    "networking",
    "database",
    "compiler",
    "recursion",

    // Tools & Platforms
    "git",
    "github",
    "docker",
    "kubernetes",
    "linux",
    "terminal",
    "bash",
    "firebase",
    "supabase",
    "deployment",

    // AI / ML
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "neural network",
    "natural language processing",
    "computer vision",
    "tensorflow",
    "pytorch",
    "data science",
    "pandas",
    "numpy",
    "kaggle",

    // General Education
    "lecture",
    "explained",
    "explanation",
    "learning",
    "study",
    "education",
    "academic",
    "university",
    "exam",
    "mathematics",
    "calculus",
    "algebra",
    "statistics",
    "physics",
    "chemistry",
    "biology",
    "science",
    "history",
    "geography",
    "economics",
    "psychology",
    "philosophy",
    "engineering",

    // Career & Productivity
    "interview",
    "resume",
    "career",
    "internship",
    "freelance",
    "productivity",
    "self improvement",
    "project management",

    // Finance & Business
    "finance",
    "investing",
    "stock market",
    "startup",
    "business",
    "entrepreneur",
    "accounting",
  ];

  // Risky short keywords handled separately with strict word boundary
  const exactKeywords = ["css", "sql", "aws", "gcp", "llm", "nlp", "git"];

  function isEducational(title) {
    const lower = title.toLowerCase();

    // Always block mixes
    if (lower.startsWith("mix -")) return false;

    // Block entertainment
    const blockedPatterns = [
      /\btrailer\b/,
      /\bofficial video\b/,
      /\bmusic video\b/,
      /\bmv\b/,
      /\blyrics\b/,
      /\baudio\b/,
      /\bsong\b/,
      /\bfull movie\b/,
      /\bclip\b/,
      /\bhighlights\b/,
      /\bprank\b/,
      /\bvlog\b/,
      /\bchallenge\b/,
      /\bmeme\b/,
    ];
    if (blockedPatterns.some((pattern) => pattern.test(lower))) return false;

    // Check exact/short keywords with word boundary
    if (exactKeywords.some((kw) => new RegExp(`\\b${kw}\\b`, "i").test(lower)))
      return true;

    // Check regular keywords (phrases are safe from false positives)
    return allowedKeywords.some((kw) => lower.includes(kw));
  }

  // main function to filter content on the page
  function filterContent() {
    const videos = document.querySelectorAll(
      "ytd-rich-item-renderer, ytd-video-renderer, yt-lockup-view-model",
    );

    videos.forEach((video) => {
      const titleElement = video.querySelector("h3 a[aria-label]");
      const title = titleElement?.getAttribute("aria-label")?.trim() ?? "";

      const mixTitleElement = video.querySelector(
        "h3.ytLockupMetadataViewModelHeadingReset span",
      );
      const mixTitle = mixTitleElement?.textContent?.trim() ?? "";

      const thumbnailDiv = video.querySelector("yt-thumbnail-view-model div");
      const thumbnailImg = video.querySelector("ytd-thumbnail");
      const videoDescriptionSnippet = video.querySelector(
        "yt-formatted-string.metadata-snippet-text",
      );

      const applyBlur = (titleEl) => {
        video.style.opacity = "0.5";
        video.style.pointerEvents = "none";
        if (thumbnailDiv) thumbnailDiv.style.filter = "blur(20px)";
        if (thumbnailImg) thumbnailImg.style.filter = "blur(20px)";
        if (videoDescriptionSnippet)
          videoDescriptionSnippet.style.filter = "blur(10px)";
        if (titleEl) titleEl.style.filter = "blur(10px)";
      };

      const removeBlur = (titleEl) => {
        video.style.opacity = "1";
        video.style.pointerEvents = "auto";
        if (thumbnailDiv) thumbnailDiv.style.filter = "none";
        if (thumbnailImg) thumbnailImg.style.filter = "none";
        if (videoDescriptionSnippet)
          videoDescriptionSnippet.style.filter = "none";
        if (titleEl) titleEl.style.filter = "none";
      };

      // Handle regular videos
      if (title) {
        isEducational(title)
          ? removeBlur(titleElement)
          : applyBlur(titleElement);
        return; // already handled, skip mix check
      }

      // Handle mix playlists
      if (mixTitle) {
        isEducational(mixTitle)
          ? removeBlur(mixTitleElement)
          : applyBlur(mixTitleElement);
      }
    });
  }

  // ----------------- Mutation Observer for Dynamic Content -----------------
  function initObserver() {
    const observer = new MutationObserver(() => {
      if (!settings.studyMode) return;

      if (settings.shortsBlock) removeShortsUI();
      if (settings.filtering) filterContent();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    console.log("[Observer] MutationObserver initialized");
  }

  // ======================== Initialization & URL Change Handling ========================
  // initial run on page load
  initObserver();

  // handle dynamic page changes (YouTube is a SPA, so we need to check for URL changes)
  setInterval(() => {
    if (lastUrl !== location.href) {
      lastUrl = location.href;
      console.log("[NAV] URL changed");

      applyFeatures();
    }
  }, 500);
})();
