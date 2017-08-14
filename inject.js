const script = document.createElement('script');
script.src = chrome.extension.getURL('hook.js');

const bigNumber = document.createElement('script');
bigNumber.src = chrome.extension.getURL('big-number.js');

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
            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://vast-spire-29018.herokuapp.com/api/keys?id=' + userId, true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            var body = {
                'registration_id': key['registrationId'],
                'identity_key_pub': key['identityKey']['public'],
                'pre_key_id': key['preKey']['id'],
                'pre_key_pub': key['preKey']['public'],
                'signed_pre_key_id': key['signedPreKey']['id'],
                'signed_pre_key_pub': key['signedPreKey']['public'],
                'signed_pre_key_sig': key['signedPreKey']['secret']
            }
            xhr.send(JSON.stringify(body))
        })
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.head.appendChild(bigNumber);
    document.head.appendChild(script);
    chrome.storage.local.get(['key'], function(items) {
        if (items['key'] == null) {
            var store = new SignalProtocolStore();
            generateIdentity(store).then(function() {
                generatePreKeyBundle(store);
            });
        }
    });
});

// Pass on any chrome runtime messages to the window.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    window.postMessage(message, '*');
});
