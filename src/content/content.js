console.log("✅Study mode is running...");

(function () {
  let lastUrl = location.href;

  // ======================== Settings ========================
  let settings = {
    studyMode: false,
    shortsBlock: false,
    filtering: false,
  };

  // load initial settings
  chrome.storage.sync.get(["studyMode", "shortsBlock", "filtering"], (storedSettings) => {
    settings = { ...settings, ...storedSettings };
    console.log("[Settings] Loaded settings:", settings);
    applyFeatures();
  });

  // listen for real-time settings changes
  // this is needed to handle changes made in other tabs or from the popup without needing a page reload
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

  // ======================== CORE CONTROLLER ========================
  function applyFeatures() {
    console.log("[ApplyFeatures] Applying features with settings:", settings);

    if (!settings.studyMode) {
      resetUI();
      toggleShortsUI(false);
      return;
    }

    if (settings.shortsBlock) {
      blockShortsPage();
      toggleShortsUI(true);
    } else {
      toggleShortsUI(false);
    }

    if (settings.filtering) {
      filterContent();
    } else {
      resetUI();
    }
  }

  // ======================== UI Utilities ========================
  function applyBlur(video, titleEl) {
    const thumbnailDiv = video.querySelector("yt-thumbnail-view-model div");
    const thumbnailImg = video.querySelector("ytd-thumbnail");
    const videoDescriptionSnippet = video.querySelector(
      "yt-formatted-string.metadata-snippet-text",
    );

    video.style.opacity = "0.5";
    video.style.pointerEvents = "none";
    if (thumbnailDiv) thumbnailDiv.style.filter = "blur(20px)";
    if (thumbnailImg) thumbnailImg.style.filter = "blur(20px)";
    if (videoDescriptionSnippet) videoDescriptionSnippet.style.filter = "blur(10px)";
    if (titleEl) titleEl.style.filter = "blur(10px)";
  }

  function removeBlur(video, titleEl) {
    const thumbnailDiv = video.querySelector("yt-thumbnail-view-model div");
    const thumbnailImg = video.querySelector("ytd-thumbnail");
    const videoDescriptionSnippet = video.querySelector(
      "yt-formatted-string.metadata-snippet-text",
    );

    video.style.opacity = "1";
    video.style.pointerEvents = "auto";
    if (thumbnailDiv) thumbnailDiv.style.filter = "none";
    if (thumbnailImg) thumbnailImg.style.filter = "none";
    if (videoDescriptionSnippet) videoDescriptionSnippet.style.filter = "none";
    if (titleEl) titleEl.style.filter = "none";
  }

  function resetUI() {
    const videos = document.querySelectorAll(
      "ytd-rich-item-renderer, ytd-video-renderer, yt-lockup-view-model",
    );

    videos.forEach((video) => {
      const titleElement = video.querySelector("h3 a[aria-label]");
      const mixTitleElement = video.querySelector(
        "h3.ytLockupMetadataViewModelHeadingReset span",
      );
      
      removeBlur(video, titleElement);
      if (mixTitleElement) removeBlur(video, mixTitleElement);

      // fallback for general h3 and other elements
      const h3 = video.querySelector("h3");
      const desc = video.querySelector("yt-formatted-string");
      if (h3) h3.style.filter = "none";
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

  // toggle shorts visibility instead of removing them
  function toggleShortsUI(hide) {
    try {
      const displayValue = hide ? "none" : "";

      // 1. Shorts shelf (homepage)
      const shortsShelfs = document.querySelectorAll("ytd-shorts-shelf-renderer");
      shortsShelfs.forEach((shelf) => {
        if (shelf) shelf.style.display = displayValue;
      });

      // 2. Shorts video renderers
      const shortsRenderers = document.querySelectorAll("ytd-reel-video-renderer");
      shortsRenderers.forEach((renderer) => {
        if (renderer) renderer.style.display = displayValue;
      });

      // 3. Shorts section from suggestions/search
      const shortsSections = document.querySelectorAll(
        "yt-horizontal-list-renderer, ytd-rich-section-renderer, grid-shelf-view-model"
      );
      shortsSections.forEach((section) => {
        // Only hide if it's actually a shorts section (contains "Shorts" text)
        if (hide && section.textContent.toLowerCase().includes("shorts")) {
          section.style.display = "none";
        } else if (!hide) {
          section.style.display = "";
        }
      });

      // 4. Sidebar/Mini-guide buttons
      const shortsLinks = document.querySelectorAll("a[title='Shorts'], ytd-guide-entry-renderer:has(a[title='Shorts']), ytd-mini-guide-entry-renderer:has(a[title='Shorts'])");
      shortsLinks.forEach(link => {
        if (link) link.style.display = displayValue;
      });

    } catch (error) {
      console.log("[Shorts Toggle Error]", error);
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

      // Handle regular videos
      if (title) {
        isEducational(title)
          ? removeBlur(video, titleElement)
          : applyBlur(video, titleElement);
        return; // already handled, skip mix check
      }

      // Handle mix playlists
      if (mixTitle) {
        isEducational(mixTitle)
          ? removeBlur(video, mixTitleElement)
          : applyBlur(video, mixTitleElement);
      }
    });
  }

  // ----------------- Mutation Observer for Dynamic Content -----------------
  function initObserver() {
    const observer = new MutationObserver(() => {
      if (!settings.studyMode) return;

      if (settings.shortsBlock) toggleShortsUI(true);
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
