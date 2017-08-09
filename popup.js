var SESSION_BUILDER;
var RECIPIENT_ADDRESS = new libsignal.SignalProtocolAddress("recipients_perminent_fb_id", 0);
var STORE = new SignalProtocolStore();

// Your goods.
var MY_REGISTRATION_ID = 2797;
var MY_IDENTITY_KEY = {pubKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode('BWXClsO+Y8KPUF3DqMOvwovCoyfColPCqQNCw6XDjsONVsK/GDbCsMKzwotkwrN5WjI='), 'binary').toArrayBuffer(), privKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode('w5jCigRwwqQaQVVxw6bCgjbCjcKkUsKmJsO+w7onwowhfsOoUcOddgjDv8KqXmc='), 'binary').toArrayBuffer()};

// The recipients public keys that will be loaded from the server.
var OTHER_REGISTRATION_ID = 9;
var OTHER_IDENTITY_KEY_PUB = new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode('BXTDt0PCjMKaYFN3w5fCv8KAwqJNw4LDncKBdw4swq5TGULDmcKaV8OlN0zDvG4T'), 'binary').toArrayBuffer();

var OTHER_SIGNED_PRE_KEY_ID = 1;
var OTHER_SIGNED_PRE_KEY_PUB = new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode('BQnDqgvDm2Nbw65eJMOIJ1QvRF7CrsKPwqXCksK7BCpMfX4ULkHDuRQ0Qg=='), 'binary').toArrayBuffer();
var OTHER_SIGNED_PRE_KEY_SIG = new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode('dcOhFSjClcOvKyLDiFDCs8KMw6PCv8OeKsOZejXDm1lqwpHCnsK2wpjDrz8+w79ZfcOpWUPCrzTCkMKqUMKjw6Ydw5Yiw4B4w4Z4RVUJMgt2wpDDnynCvn8Uw4nDnsKJ'), 'binary').toArrayBuffer();

var OTHER_PRE_KEY_ID = 1;
var OTHER_PRE_KEY_PUB = new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode('BXDDgcK1YTXClXsjw5NBw7/CjcOjKsONw7cdAcKrw4gnSRzDrMOoMHVdUHYafQ=='), 'binary').toArrayBuffer();

function b64EncodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
}

function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
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
    document.getElementById('message').innerText = pastedData;
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('message').addEventListener('paste', handlePaste);

    // start up an encryption session
    STORE.put('identityKey', MY_IDENTITY_KEY)
    STORE.put('registrationId', MY_REGISTRATION_ID)
    SESSION_BUILDER = new libsignal.SessionBuilder(STORE, RECIPIENT_ADDRESS);

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

    // encrypt
    var promise = SESSION_BUILDER.processPreKey({
        registrationId: OTHER_REGISTRATION_ID,
        identityKey: OTHER_IDENTITY_KEY_PUB,
        signedPreKey: {
            keyId     : OTHER_SIGNED_PRE_KEY_ID,
            publicKey : OTHER_SIGNED_PRE_KEY_PUB,
            signature : OTHER_SIGNED_PRE_KEY_SIG
        },
        preKey: {
            keyId     : OTHER_PRE_KEY_ID,
            publicKey : OTHER_PRE_KEY_PUB
        }
    });

    promise.then(function onsuccess() {
        // encrypt messages
        var plaintext = new dcodeIO.ByteBuffer.wrap(b64EncodeUnicode(messageText), 'binary').toArrayBuffer()
        var sessionCipher = new libsignal.SessionCipher(STORE, RECIPIENT_ADDRESS);
        sessionCipher.encrypt(plaintext).then(function(ciphertext) {
            // ciphertext -> { type: <Number>, body: <string> }
            chrome.tabs.query({currentWindow: true, active: true}, function(tabArray) {
                chrome.tabs.sendMessage(tabArray[0].id, { action: "sendMessage", message: '::::::' + b64EncodeUnicode(ciphertext.body) });
            });
        });
    });

    promise.catch(function onerror(error) {
        console.error(error);
    });
}
