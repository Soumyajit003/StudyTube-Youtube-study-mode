import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
function Popup() {
    const [studyMode, setStudyMode] = useState(false);
    const [shortsBlock, setShortsBlock] = useState(false);
    const [filtering, setFiltering] = useState(false);
    useEffect(() => {
        chrome.storage.sync.get(["studyMode", "shortsBlock", "filtering"], (data) => {
            setStudyMode(data.studyMode ?? false);
            setShortsBlock(data.shortsBlock ?? false);
            setFiltering(data.filtering ?? false);
        });
    }, []);
    const updateSettings = (key, value) => {
        chrome.storage.sync.set({ [key]: value });
        // send message to the content script
        // ---> finding the current tab user is working now
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]?.id)
                return;
            chrome.tabs.sendMessage(tabs[0].id, {
                type: "SETTINGS_UPDATED"
            });
        });
    };
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "w-72 bg-gray-900 text-white p-4 rounded-xl shadow-lg", children: [_jsx("h2", { className: "text-lg font-semibold mb-4 text-center", children: "\uD83D\uDCDA Study Mode" }), _jsx(Toggle, { label: "Enable Study Mode", value: studyMode, onChange: (val) => {
                        setStudyMode(val);
                        updateSettings("studyMode", val);
                    } }), _jsx(Toggle, { label: "Block Shorts", value: shortsBlock, onChange: (val) => {
                        setShortsBlock(val);
                        updateSettings("shortsBlock", val);
                    } }), _jsx(Toggle, { label: "Filter Content", value: filtering, onChange: (val) => {
                        setFiltering(val);
                        updateSettings("filtering", val);
                    } })] }) }));
    // Toggle handlers
    // function Toggle({ label, value, onChange }: any) {
    //   return (
    //     <>
    //       <div className="flex items-center justify-between py-2">
    //         <span className="text-sm">{label}</span>
    //         <input
    //           type="checkbox"
    //           checked={value}
    //           onChange={(e) => onChange(e.target.checked)}
    //         />
    //       </div>
    //     </>
    //   );
    // }
    function Toggle({ label, value, onChange }) {
        return (_jsxs("div", { className: "flex items-center justify-between py-2", children: [_jsx("span", { className: "text-sm", children: label }), _jsx("button", { onClick: () => onChange(!value), className: `w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${value ? "bg-green-500" : "bg-gray-600"}`, children: _jsx("div", { className: `bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${value ? "translate-x-6" : "translate-x-0"}` }) })] }));
    }
}
export default Popup;
