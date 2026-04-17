console.log("✅Study mode is running...");


// ======================== Feature 1: Shorts Blocker ========================

// redirect to the home page if the user is on a shorts page
function blockShorts() {
    if(window.location.pathname.startsWith("/shorts")) {
        window.location.href = "/";
    }
}

// remove shorts video renderers from the page every second
function removeShortsRenderers() {
    const shortsRenderers = document.querySelectorAll("ytd-reel-video-renderer");
    shortsRenderers.forEach(renderer => renderer.remove());
}

// remove shorts button forom the sidebar
function removeShortsButton() {
    const shortsButton = document.querySelector("a[title='Shorts']");
    shortsButton.remove();
}

setInterval(() => {
    blockShorts();
    removeShortsRenderers();
    removeShortsButton();
}, 1000);

document.addEventListener("click", (e) => {    // This runs whenever the user clicks anywhere on the page
    const link = e.target.closest("a");
    
    if(!link) return;

    if(link.href && link.href.includes("/shorts/")) {
        e.preventDefault();
        alert("🚫 Shorts are blocked in Study Mode");
    }
})