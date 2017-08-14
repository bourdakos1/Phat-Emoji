var SESSION_BUILDER;
var RECIPIENT_ADDRESS = new libsignal.SignalProtocolAddress("recipients_perminent_fb_id", 0);
var STORE = new SignalProtocolStore();

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
        var identityKey = {pubKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(items['key']['identityKey']['public']), 'binary').toArrayBuffer(), privKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(items['key']['identityKey']['private']), 'binary').toArrayBuffer()};

        // start up an encryption session
        STORE.put('identityKey', identityKey)
        STORE.put('registrationId', registrationId)
        SESSION_BUILDER = new libsignal.SessionBuilder(STORE, RECIPIENT_ADDRESS);
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
    var message = document.getElementById('message');
    var messageText = message.innerText
    if (messageText == '') {
        return;
    }
    message.innerText = '';
    message.focus();

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://vast-spire-29018.herokuapp.com/api/keys/1165317513', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var data = JSON.parse(xhr.responseText);

            // encrypt
            var promise = SESSION_BUILDER.processPreKey({
                registrationId: data['registration_id'],
                identityKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(data['identity_key_pub']), 'binary').toArrayBuffer(),
                signedPreKey: {
                    keyId     : data['signed_pre_key_id'],
                    publicKey : new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(data['signed_pre_key_pub']), 'binary').toArrayBuffer(),
                    signature : new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(data['signed_pre_key_sig']), 'binary').toArrayBuffer()
                },
                preKey: {
                    keyId     : data['pre_key_id'],
                    publicKey : new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(data['pre_key_pub']), 'binary').toArrayBuffer()
                }
            });

            promise.then(function onsuccess() {
                // encrypt messages
                var plaintext = new dcodeIO.ByteBuffer.wrap(b64EncodeUnicode(messageText), 'binary').toArrayBuffer()
                var sessionCipher = new libsignal.SessionCipher(STORE, RECIPIENT_ADDRESS);
                sessionCipher.encrypt(plaintext).then(function(ciphertext) {
                    // ciphertext -> { type: <Number>, body: <string> }
                    chrome.tabs.query({currentWindow: true, active: true}, function(tabArray) {
                        chrome.tabs.sendMessage(tabArray[0].id, { action: "sendMessage", message: '__:' + b64EncodeUnicode(ciphertext.body) + ':' + 'xxx' + ':__'});
                    });
                });
            });

            promise.catch(function onerror(error) {
                console.error(error);
            });
        }
    }
    xhr.send(null);
}
