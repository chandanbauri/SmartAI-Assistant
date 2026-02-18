chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EMAIL_DATA_FETCHED') {
        // This could be used to pass data from content script to sidepanel if needed
        // But sidepanel can also query the tab directly.
    }
});
