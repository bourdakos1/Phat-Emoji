var SESSION_BUILDER;
var RECIPIENT_ADDRESS = new libsignal.SignalProtocolAddress("recipients_perminent_fb_id", 0);
var STORE = new SignalProtocolStore();

// Your goods.
var MY_REGISTRATION_ID = 4962;
var MY_IDENTITY_KEY = {pubKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode('BVHDpMOXwpJyw5XCpcK3wqLDtsO2a8K5w4vDu1DCqlAME1MrLGfDn8OtJmE9w4nDjEI='), 'binary').toArrayBuffer(), privKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode('WCQ0HHzDsMOYO8O4TDR1BMOsdF7DvW3CjRwiKlPCn37DiC4Gdmw2bw=='), 'binary').toArrayBuffer()};

// The recipients public keys that will be loaded from the server.
var OTHER_REGISTRATION_ID = 1831;
var OTHER_IDENTITY_KEY_PUB = new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode('BcKMwoDDkVoEGm13w48QPMO9Jy1iw5kxw5l4w63DrnTDhEjDicOXwovDiMOiZMOqNw=='), 'binary').toArrayBuffer();

var OTHER_SIGNED_PRE_KEY_ID = 1;
var OTHER_SIGNED_PRE_KEY_PUB = new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode('BTLCnsOBw5XCnUrCjnvDkFnDpMOzwrt7w5RgdsKAKjs2FcOTw55ew7HCtcKYw6w9fSw='), 'binary').toArrayBuffer();
var OTHER_SIGNED_PRE_KEY_SIG = new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode('L8KHw7fCmTbDg8K3OilKJjzCv8KPw4bDtUjCsiBeXsOJJ0nCrRbDk8Orw4bCkcKOwr/ClFbCiDtRIR3CjcOBw4HDmD7CrgLCqMKEw5fDisKrw51xw6nDsADCsVvDisOJV8K4wrkA'), 'binary').toArrayBuffer();

var OTHER_PRE_KEY_ID = 1;
var OTHER_PRE_KEY_PUB = new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode('BcKoRlPCj8KLOE4FwrNSDRvDs8OFDV/CkQTDpHAhw6fCl8O1w6bDpMO3UnrDjFYD'), 'binary').toArrayBuffer();

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

document.addEventListener('DOMContentLoaded', function() {

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
        var plaintext = new dcodeIO.ByteBuffer.wrap(messageText, 'binary').toArrayBuffer()
        var sessionCipher = new libsignal.SessionCipher(STORE, RECIPIENT_ADDRESS);
        sessionCipher.encrypt(plaintext).then(function(ciphertext) {
            // ciphertext -> { type: <Number>, body: <string> }
            chrome.tabs.query({currentWindow: true, active: true}, function(tabArray) {
                chrome.tabs.sendMessage(tabArray[0].id, { action: "sendMessage", message: b64EncodeUnicode(ciphertext.body) });
            });
        });
    });

    promise.catch(function onerror(error) {
        console.error(error);
    });
}
