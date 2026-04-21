import { useEffect, useState } from "react";

function Popup() {
  const [studyMode, setStudyMode] = useState(false);
  const [shortsBlock, setShortsBlock] = useState(false);
  const [filtering, setFiltering] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(
      ["studyMode", "shortsBlock", "filtering"],
      (data: any) => {
        setStudyMode(data.studyMode ?? false);
        setShortsBlock(data.shortsBlock ?? false);
        setFiltering(data.filtering ?? false);
      },
    );
  }, []);

  const updateSettings = (key: string, value: boolean) => {
    chrome.storage.sync.set({ [key]: value });
  };

  return (
    <>
      <div className="container">
        <h2>📚 Study Mode</h2>

        <Toggle
          label="Enable Study Mode"
          value={studyMode}
          onChange={(val: boolean) => {
            setStudyMode(val);
            updateSettings("studyMode", val);
          }}
        />

        <Toggle
          label="Block Shorts"
          value={shortsBlock}
          onChange={(val: boolean) => {
            setShortsBlock(val);
            updateSettings("shortsBlock", val);
          }}
        />

        <Toggle
          label="Filter Comments"
          value={filtering}
          onChange={(val: boolean) => {
            setFiltering(val);
            updateSettings("filtering", val);
          }}
        />
      </div>
    </>
  );

  // Toggle handlers
  function Toggle({ label, value, onChange }: any) {
    return (
      <>
        <div className="toggle">
          <span>{label}</span>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
          />
        </div>
      </>
    );
  }
}

export default Popup;
