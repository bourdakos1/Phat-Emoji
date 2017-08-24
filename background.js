chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.onHighlighted.addListener(function() {
        chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
            if (tabs[0].url) {
                chrome.tabs.executeScript(null, {file: 'jquery.min.js'});
                chrome.tabs.executeScript(null, {file: 'decrypt.js'});

                chrome.tabs.executeScript(null, {file: 'libsignal-protocol.js'});
                chrome.tabs.executeScript(null, {file: 'InMemorySignalProtocolStore.js'});
                chrome.tabs.executeScript(null, {file: 'inject.js'});
            }
        });
    });
});
