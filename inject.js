const script = document.createElement('script');
script.src = chrome.extension.getURL('hook.js');

document.addEventListener('DOMContentLoaded', () => {
    document.head.appendChild(script);
});

// Pass on any chrome runtime messages to the window.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    window.postMessage(message, '*');
});
