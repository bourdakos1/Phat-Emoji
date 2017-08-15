var SESSION_BUILDER;
var RECIPIENT_ADDRESS = new libsignal.SignalProtocolAddress("recipients_perminent_fb_id", 0);
var MY_ADDRESS = new libsignal.SignalProtocolAddress("my_perminent_fb_id", 0);
var STORE = new SignalProtocolStore();

function makeRequest (method, url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(JSON.parse(xhr.response));
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
}

function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

function handlePaste (e) {
    var clipboardData, pastedData;

    // Stop data actually being pasted into div
    e.stopPropagation();
    e.preventDefault();

    // Get pasted data via clipboard API
    clipboardData = e.clipboardData || window.clipboardData;
    pastedData = clipboardData.getData('Text');

    // Do whatever with pasteddata
    document.execCommand('inserttext', false, pastedData);
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('message').addEventListener('paste', handlePaste);

    // should be fine to do this, can't possibly take that long...
    chrome.storage.local.get('key', function(items) {
        console.log(items['key']['registrationId']);
        var registrationId = items['key']['registrationId'];
        var identityKey = {
            pubKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(items['key']['identityKey']['public']), 'binary').toArrayBuffer(),
            privKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(items['key']['identityKey']['private']), 'binary').toArrayBuffer()
        };

        // start up an encryption session
        STORE.put('identityKey', identityKey)
        STORE.put('registrationId', registrationId)
        SESSION_BUILDER = new libsignal.SessionBuilder(STORE, RECIPIENT_ADDRESS);
        MY_SESSION_BUILDER = new libsignal.SessionBuilder(STORE, MY_ADDRESS);
    });

    document.getElementById('message').addEventListener('keydown', function(e) {
        console.log(e.keyCode);
        if (e.keyCode == 13) {
            if (e.shiftKey) {
                console.log('youre a shifty motherfucker');
            } else {
                e.preventDefault();
                validate();
            }
        }
    });
    document.getElementById('send_emoji').addEventListener('click', function() {
        var message = document.getElementById('message');
        var messageText = message.innerText

        chrome.tabs.query({currentWindow: true, active: true}, function(tabArray) {
            chrome.tabs.sendMessage(tabArray[0].id, { action: "sendHotEmoji" });
        });
        message.focus();
    });
});

function validate() {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabArray) {
        chrome.tabs.sendMessage(tabArray[0].id, {
            action: 'getId'
        });
    });
}

chrome.runtime.onMessage.addListener((chromeMessage, sender, sendResponse) => {
    if (chromeMessage.action == 'sendId') {
        console.log(chromeMessage)
        var message = document.getElementById('message');
        var messageText = message.innerText
        if (messageText == '') {
            return;
        }
        message.innerText = '';
        message.focus();

        makeRequest('GET', 'https://vast-spire-29018.herokuapp.com/api/keys/' + chromeMessage.user).then(function (data) {
            return makeRequest('GET', 'https://vast-spire-29018.herokuapp.com/api/keys/' + chromeMessage.otherUser).then(function (data2) {
                return [data, data2]
            })
        }).then(function (results) {
            return MY_SESSION_BUILDER.processPreKey({
                registrationId: results[0]['registration_id'],
                identityKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(results[0]['identity_key_pub']), 'binary').toArrayBuffer(),
                signedPreKey: {
                    keyId     : results[0]['signed_pre_key_id'],
                    publicKey : new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(results[0]['signed_pre_key_pub']), 'binary').toArrayBuffer(),
                    signature : new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(results[0]['signed_pre_key_sig']), 'binary').toArrayBuffer()
                },
                preKey: {
                    keyId     : results[0]['pre_key_id'],
                    publicKey : new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(results[0]['pre_key_pub']), 'binary').toArrayBuffer()
                }
            }).then(function() {
                return results[1]
            })
        }).then(function(result) {
            var plaintext = new dcodeIO.ByteBuffer.wrap(b64EncodeUnicode(messageText), 'binary').toArrayBuffer()
            var sessionCipher = new libsignal.SessionCipher(STORE, MY_ADDRESS);
            return sessionCipher.encrypt(plaintext).then(function(ciphertext) {
                return [ciphertext, result]
            })
        }).then(function(results) {
            return SESSION_BUILDER.processPreKey({
                registrationId: results[1]['registration_id'],
                identityKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(results[1]['identity_key_pub']), 'binary').toArrayBuffer(),
                signedPreKey: {
                    keyId     : results[1]['signed_pre_key_id'],
                    publicKey : new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(results[1]['signed_pre_key_pub']), 'binary').toArrayBuffer(),
                    signature : new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(results[1]['signed_pre_key_sig']), 'binary').toArrayBuffer()
                },
                preKey: {
                    keyId     : results[1]['pre_key_id'],
                    publicKey : new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(results[1]['pre_key_pub']), 'binary').toArrayBuffer()
                }
            }).then(function() {
                return results[0]
            })
        }).then(function(ciphertext) {
            var plaintext = new dcodeIO.ByteBuffer.wrap(b64EncodeUnicode(messageText), 'binary').toArrayBuffer()
            var sessionCipher = new libsignal.SessionCipher(STORE, RECIPIENT_ADDRESS);
            return sessionCipher.encrypt(plaintext).then(function(ciphertext2) {
                return [ciphertext, ciphertext2]
            })
        }).then(function(results) {
            chrome.tabs.query({currentWindow: true, active: true}, function(tabArray) {
                chrome.tabs.sendMessage(tabArray[0].id, {
                    action: "sendMessage",
                    message: '<:' + b64EncodeUnicode(results[0].body) + ':' + b64EncodeUnicode(results[1].body) + ':>'
                });
            });
        }).catch(function(error) {
            console.error(error);
        });
    }
});
