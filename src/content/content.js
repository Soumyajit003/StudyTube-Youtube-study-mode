console.log("✅Study mode is running...");

(function () {
  let lastUrl = location.href;

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
      filterContent();
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

  // ======================== Feature 2: Filtering content ========================

  // ------------------ Core filtering logic -----------------
  const allowedKeywords = [
    // Programming & Web Dev
    "react",
    "javascript",
    "typescript",
    "node",
    "nodejs",
    "python",
    "java",
    "c++",
    "rust",
    "golang",
    "php",
    "ruby",
    "swift",
    "kotlin",
    "dart",
    "html",
    "css",
    "sass",
    "tailwind",
    "bootstrap",
    "nextjs",
    "vue",
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
    "sql",
    "compiler",
    "recursion",
    "big o",
    "complexity",

    // Tools & Platforms
    "git",
    "github",
    "docker",
    "kubernetes",
    "linux",
    "terminal",
    "bash",
    "aws",
    "azure",
    "gcp",
    "cloud",
    "ci/cd",
    "firebase",
    "supabase",

    // AI / ML
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "ai",
    "neural network",
    "llm",
    "nlp",
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
    "learn",
    "learning",
    "study",
    "education",
    "academic",
    "university",
    "exam",
    "quiz",
    "homework",
    "mathematics",
    "math",
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
    "job",
    "internship",
    "freelance",
    "productivity",
    "focus",
    "habit",
    "self improvement",
    "skill",
    "project management",
    "communication",
    "leadership",

    // Finance & Business
    "finance",
    "investing",
    "stock market",
    "trading",
    "startup",
    "business",
    "entrepreneur",
    "accounting",
    "tax",
  ];

  // core logic to check if a video is educational based on its title
  function isEducational(title) {
    const lower = title.toLowerCase();
    return allowedKeywords.some((keyword) => lower.includes(keyword));
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
})();
