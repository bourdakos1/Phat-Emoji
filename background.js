var KeyHelper = libsignal.KeyHelper;

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

        chrome.storage.local.set({'key': key})
    });
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['key'], function(items) {
        if (items['key'] == null) {
            var store = new SignalProtocolStore();
            generateIdentity(store).then(function() {
                generatePreKeyBundle(store);
            });
        }
    });

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
                        js: ['inject.js']
                    })
                ]
            }
        ]);
    });
});
