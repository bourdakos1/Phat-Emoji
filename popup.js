var KeyHelper = libsignal.KeyHelper;

function stringToArrayBuffer(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function arrayBufferToString(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}

var MY_IDENTITY_KEY;
var MY_REGISTRATION_ID;

function generateMyIdentity() {
    console.log("My Identity");
    return Promise.all([
        KeyHelper.generateIdentityKeyPair(),
        KeyHelper.generateRegistrationId(),
    ]).then(function(result) {
        console.log(result[0]);
        console.log(result[1]);
        MY_IDENTITY_KEY = result[0];
        MY_REGISTRATION_ID = result[1];
    });
}

var OTHER_IDENTITY_KEY;
var OTHER_REGISTRATION_ID;

function generateRecepientIdentity() {
    console.log("Other Identity");
    return Promise.all([
        KeyHelper.generateIdentityKeyPair(),
        KeyHelper.generateRegistrationId(),
    ]).then(function(result) {
        console.log(result[0]);
        console.log(result[1]);
        OTHER_IDENTITY_KEY = result[0];
        OTHER_REGISTRATION_ID = result[1];
    });
}

function generatePreKeyBundle() {
    console.log("prekey shit to be uploaded to server")
    return Promise.all([
        KeyHelper.generatePreKey(762183),
        KeyHelper.generateSignedPreKey(MY_IDENTITY_KEY, 762183),
    ]).then(function(keys) {
        var preKey = keys[0]
        var signedPreKey = keys[1];

        console.log(preKey.keyId)
        console.log(preKey.keyPair)
        console.log(signedPreKey.keyId)
        console.log(signedPreKey.keyPair)

        store.storePreKey(preKeyId, preKey.keyPair);
        store.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair);

        return {
            identityKey: identity.pubKey,
            registrationId : registrationId,
            preKey:  {
                keyId     : preKeyId,
                publicKey : preKey.keyPair.pubKey
            },
            signedPreKey: {
                keyId     : signedPreKeyId,
                publicKey : signedPreKey.keyPair.pubKey,
                signature : signedPreKey.signature
            }
        };
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // We need the store to at least store our session.
    var store = new SignalProtocolStore();

    // the recipient id is the username or id for the recipient, device id can just be 0
    // If we want to support multiple devices.... then we need to figure things out...
    var address = new libsignal.SignalProtocolAddress("andrews_facebook_id", 0);

    Promise.all([
        generateMyIdentity(),
        generateRecepientIdentity()
    ]).then(function() {
        SessionBuilder sessionBuilder = new libsignal.SessionBuilder(store, address);

        var promise = sessionBuilder.processPreKey({
            registrationId: MY_REGISTRATION_ID,
            identityKey: MY_IDENTITY_KEY,
            signedPreKey: {
                keyId     : <Number>,
                publicKey : <ArrayBuffer>,
                signature : <ArrayBuffer>
            },
            preKey: {
                keyId     : <Number>,
                publicKey : <ArrayBuffer>
            }
        });

        promise.then(function onsuccess() {
            console.log('shitting it works');
        });
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

    chrome.tabs.query({currentWindow: true, active: true}, function(tabArray) {
        chrome.tabs.sendMessage(tabArray[0].id, { action: "sendMessage", message: messageText });
    });
}
