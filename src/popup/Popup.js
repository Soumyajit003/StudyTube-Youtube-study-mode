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
    };
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "container", children: [_jsx("h2", { children: "\uD83D\uDCDA Study Mode" }), _jsx(Toggle, { label: "Enable Study Mode", value: studyMode, onChange: (val) => {
                        setStudyMode(val);
                        updateSettings("studyMode", val);
                    } }), _jsx(Toggle, { label: "Block Shorts", value: shortsBlock, onChange: (val) => {
                        setShortsBlock(val);
                        updateSettings("shortsBlock", val);
                    } }), _jsx(Toggle, { label: "Filter Comments", value: filtering, onChange: (val) => {
                        setFiltering(val);
                        updateSettings("filtering", val);
                    } })] }) }));
    // Toggle handlers
    function Toggle({ label, value, onChange }) {
        return (_jsx(_Fragment, { children: _jsxs("div", { className: "toggle", children: [_jsx("span", { children: label }), _jsx("input", { type: "checkbox", checked: value, onChange: (e) => onChange(e.target.checked) })] }) }));
    }
}
export default Popup;
