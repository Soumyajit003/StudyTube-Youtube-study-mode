import { useEffect, useState } from "react";

const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-0.5-2.5z"></path><path d="M6.5 2H20v20H6.5a2.5 2.5 0 0 1-0.5-2.5z"></path></svg>
);

const ShortsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);

function Popup() {
  const [studyMode, setStudyMode] = useState(false);
  const [shortsBlock, setShortsBlock] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(
      ["studyMode", "shortsBlock", "filtering"],
      (data: any) => {
        setStudyMode(data.studyMode ?? false);
        setShortsBlock(data.shortsBlock ?? false);
        setFiltering(data.filtering ?? false);
        setIsLoaded(true);
      },
    );
  }, []);

  const updateSettings = (key: string, value: boolean) => {
    chrome.storage.sync.set({ [key]: value });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) return;
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "SETTINGS_UPDATED"
      });
    });
  };

  if (!isLoaded) return <div className="w-72 h-40 bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="w-80 premium-gradient p-1">
      <div className="glass-card rounded-xl p-5 overflow-hidden transition-all duration-500">
        <header className="flex items-center justify-center gap-3 mb-6">
          <div className="p-2 bg-primary/20 rounded-lg text-primary text-glow">
            <BookIcon />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            StudyTube
          </h1>
        </header>

        <div className="space-y-4">
          <ToggleItem
            label="Study Mode"
            description="The master switch for focus"
            icon={<BookIcon />}
            value={studyMode}
            onChange={(val: boolean) => {
              setStudyMode(val);
              updateSettings("studyMode", val);
            }}
            primary
          />

          {studyMode && (
            <div className="space-y-3 pt-2 border-t border-white/5 animate-slide-down">
              <ToggleItem
                label="Block Shorts"
                description="Remove distracting short videos"
                icon={<ShortsIcon />}
                value={shortsBlock}
                onChange={(val: boolean) => {
                  setShortsBlock(val);
                  updateSettings("shortsBlock", val);
                }}
              />

              <ToggleItem
                label="Filter Content"
                description="Show only educational videos"
                icon={<FilterIcon />}
                value={filtering}
                onChange={(val: boolean) => {
                  setFiltering(val);
                  updateSettings("filtering", val);
                }}
              />
            </div>
          )}
        </div>

        <footer className="mt-6 pt-4 border-t border-white/5 text-center">
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium">
            Stay Focused • Study Hard
          </p>
        </footer>
      </div>
    </div>
  );
}

function ToggleItem({ label, description, icon, value, onChange, primary = false }: any) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${primary ? 'bg-white/5 border border-white/5' : 'hover:bg-white/5'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${value ? (primary ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-accent/20 text-accent') : 'bg-white/5 text-white/40'}`}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className={`text-sm font-semibold ${value ? 'text-white' : 'text-white/60'}`}>{label}</span>
          <span className="text-[10px] text-white/30">{description}</span>
        </div>
      </div>

      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-all duration-500 ${
          value ? (primary ? 'bg-primary' : 'bg-accent') : 'bg-gray-700'
        }`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-lg transform transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${
            value ? 'translate-x-6 scale-110' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default Popup;
