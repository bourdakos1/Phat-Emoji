var KeyHelper = libsignal.KeyHelper;

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

function generateIdentity(store) {
    return Promise.all([
        KeyHelper.generateIdentityKeyPair(),
        KeyHelper.generateRegistrationId(),
    ]).then(function(result) {
        store.put('identityKey', result[0])
        store.put('registrationId', result[1])
    });
}

function generatePreKeyBundle(store) {
    return Promise.all([
        KeyHelper.generatePreKey(1),
        KeyHelper.generateSignedPreKey(store.get('identityKey'), 1),
    ]).then(function(keys) {
        var preKey = keys[0]
        var signedPreKey = keys[1];

        var registrationId = store.get('registrationId')
        var identityKey = store.get('identityKey')

        var key = {
            'registrationId': registrationId,
            'identityKey': {
                'public': b64EncodeUnicode(new dcodeIO.ByteBuffer.wrap(identityKey.pubKey).toString('binary')),
                'private': b64EncodeUnicode(new dcodeIO.ByteBuffer.wrap(identityKey.privKey).toString('binary'))
            },
            'preKey': {
                'id': preKey.keyId,
                'public': b64EncodeUnicode(new dcodeIO.ByteBuffer.wrap(preKey.keyPair.pubKey).toString('binary')),
                'private':b64EncodeUnicode(new dcodeIO.ByteBuffer.wrap( preKey.keyPair.privKey).toString('binary'))

            },
            'signedPreKey': {
                'id': signedPreKey.keyId,
                'public': b64EncodeUnicode(new dcodeIO.ByteBuffer.wrap(signedPreKey.keyPair.pubKey).toString('binary')),
                'private': b64EncodeUnicode(new dcodeIO.ByteBuffer.wrap(signedPreKey.keyPair.privKey).toString('binary')),
                'secret': b64EncodeUnicode(new dcodeIO.ByteBuffer.wrap(signedPreKey.signature).toString('binary'))
            }
        }

        var userId = document.getElementsByTagName("script")[4].innerText.match( /{"USER_ID":"(.*?)"/ )[1];

        console.log(userId)

        chrome.storage.local.set({'key': key}, function() {
            chrome.runtime.sendMessage(null, {
                action: 'uploadPublicKeys',
                userId: userId,
                key: key
            });
        })
    });
}

const script = document.createElement('script');
script.src = chrome.extension.getURL('hook.js');
script.id = 'encrypt-emoji-hook';

const bigNumber = document.createElement('script');
bigNumber.src = chrome.extension.getURL('big-number.js');

function injectKeyCreator() {
    console.log(document.getElementById('encrypt-emoji-hook'));
    if (document.getElementById('encrypt-emoji-hook') == null) {
        document.head.appendChild(script);
        document.head.appendChild(bigNumber);
    }

    chrome.storage.local.get(['key'], function(items) {
        if (items['key'] == null) {
            var store = new SignalProtocolStore();
            generateIdentity(store).then(function() {
                generatePreKeyBundle(store);
            });
        }
    });
}

// This script gets called when the page is opened, so DOMContentLoaded isn't
// guarenteed to be triggered.

// if head has been already instantianted then the page was just opened. so just
// add the scripts now. If not, add a listener to wait for the head to be ready.
if (document.head != null) {
    injectKeyCreator();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        injectKeyCreator();
    });
}

// Pass on any chrome runtime messages to the window.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    window.postMessage(message, '*');
});

window.addEventListener('message', event => {
    if (event.source !== window || event.data.action == null || event.data.action != 'sendId') {
        return;
    }

    chrome.runtime.sendMessage(null, {
        action: event.data.action,
        otherUser: event.data.otherUser,
        user: event.data.user
    });
}, false);

window.addEventListener('message', event => {
    if (event.source !== window || event.data.action == null || event.data.action != 'nonUser') {
        return;
    }

    chrome.runtime.sendMessage(null, {
        action: event.data.action,
        otherUser: event.data.otherUser
    });
}, false);
