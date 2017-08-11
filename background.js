chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {
                            hostContains: 'facebook'
                        }
                    }),
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {
                            hostContains: 'messenger'
                        }
                    })
                ],
                actions: [
                    new chrome.declarativeContent.RequestContentScript({
                        js: ['libsignal-protocol.js', 'InMemorySignalProtocolStore.js', 'inject.js']
                    })
                ]
            }
        ]);
    });
});
