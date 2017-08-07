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

function generateIdentity(store) {
    return Promise.all([
        KeyHelper.generateIdentityKeyPair(),
        KeyHelper.generateRegistrationId(),
    ]).then(function(result) {
        console.log(result[0])
        console.log(result[1])
        store.put('identityKey', result[0]);
        store.put('registrationId', result[1]);
    });
}

function generatePreKeyBundle(store, preKeyId, signedPreKeyId) {
    return Promise.all([
        store.getIdentityKeyPair(),
        store.getLocalRegistrationId()
    ]).then(function(result) {
        var identity = result[0];
        var registrationId = result[1];

        return Promise.all([
            KeyHelper.generatePreKey(preKeyId),
            KeyHelper.generateSignedPreKey(identity, signedPreKeyId),
        ]).then(function(keys) {
            var preKey = keys[0]
            var signedPreKey = keys[1];

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
    });
}

document.addEventListener('DOMContentLoaded', function() {
    var MY_ADDRESS = new libsignal.SignalProtocolAddress("nickib", 1);
    var RECIPIENT_ADDRESS   = new libsignal.SignalProtocolAddress("drewdizzle", 1);

    var myStore = new SignalProtocolStore();

    var recipientStore = new SignalProtocolStore();
    var recipientPreKeyId = 1337;
    var recipientSignedKeyId = 1;

    Promise.all([
        generateIdentity(myStore),
        generateIdentity(recipientStore),
    ]).then(function() {
        return generatePreKeyBundle(recipientStore, recipientPreKeyId, recipientSignedKeyId);
    }).then(function(preKeyBundle) {
        var builder = new libsignal.SessionBuilder(myStore, RECIPIENT_ADDRESS);
        return builder.processPreKey(preKeyBundle).then(function() {

            var originalMessage = stringToArrayBuffer("I hate you");
            var mySessionCipher = new libsignal.SessionCipher(myStore, RECIPIENT_ADDRESS);
            var recipientSessionCipher = new libsignal.SessionCipher(recipientStore, MY_ADDRESS);

            mySessionCipher.encrypt(originalMessage).then(function(ciphertext) {

                console.log(ciphertext.body);

                // check for ciphertext.type to be 3 which includes the PREKEY_BUNDLE
                return recipientSessionCipher.decryptPreKeyWhisperMessage(ciphertext.body, 'binary');

            }).then(function(plaintext) {

                console.log(arrayBufferToString(plaintext));

            });
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
