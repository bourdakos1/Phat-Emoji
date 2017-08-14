function htmlEncode(html) {
    return document.createElement('a').appendChild(document.createTextNode(html)).parentNode.innerHTML;
};

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

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutations, observer) {
    // We get all of this locally, it says other, but this will be our goods
    mutations.forEach(function (mutation) {
        if (mutation.addedNodes.length) {
            var emojis = $(mutation.addedNodes).find('._1o13');
            for (var i = 0, len = emojis.length; i < len; i++) {
                var node = emojis[i].parentNode.parentNode
                node.innerHTML = '<div aria-label="🤔" class="_2poz _ui9 _383m" tabindex="0"><img class="_19_s _1ift img" src="http://i.imgur.com/V5zsy2i.png" alt=""></div>'
            }

            var elements = $(mutation.addedNodes).find('._3oh-._58nk');

            chrome.storage.local.get('key', function(items) {
                var OTHER_REGISTRATION_ID = items['key']['registrationId'];
                var OTHER_IDENTITY_KEY = {pubKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(items['key']['identityKey']['public']), 'binary').toArrayBuffer(), privKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(items['key']['identityKey']['private']), 'binary').toArrayBuffer()};

                var OTHER_PRE_KEY_ID = items['key']['preKey']['id'];
                var OTHER_PRE_KEY = {pubKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(items['key']['preKey']['public']), 'binary').toArrayBuffer(), privKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(items['key']['preKey']['private']), 'binary').toArrayBuffer()};

                var OTHER_SIGNED_PRE_KEY_ID = items['key']['signedPreKey']['id'];
                var OTHER_SIGNED_PRE_KEY = {pubKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(items['key']['signedPreKey']['public']), 'binary').toArrayBuffer(), privKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode(items['key']['signedPreKey']['private']), 'binary').toArrayBuffer()};

                // var promises = [];
                // var place = [];
                for (var i = 0, len = elements.length; i < len; i++) {
                    var message = elements[i].innerText;
                    console.log(message);
                    if (message.split('__:')[1] != null) {
                        message = message.split('__:')[1]
                        var message1 = message.split(':')[0]
                        var message2 = message.split(':')[1].split(':__')[0]
                        console.log('decrypt: ' + message1);
                        console.log('decrypt: ' + message2);
                        var otherStore = new SignalProtocolStore();

                        otherStore.put('identityKey', OTHER_IDENTITY_KEY)
                        otherStore.put('registrationId', OTHER_REGISTRATION_ID)

                        otherStore.storePreKey(OTHER_PRE_KEY_ID, OTHER_PRE_KEY);
                        otherStore.storeSignedPreKey(OTHER_SIGNED_PRE_KEY_ID, OTHER_SIGNED_PRE_KEY);

                        var RECIPIENT_ADDRESS = new libsignal.SignalProtocolAddress("shitstormmms", 0);

                        var otherSessionCipher = new libsignal.SessionCipher(otherStore, RECIPIENT_ADDRESS);
                        let p = i;

                        try {
                            var decodedMes1 = b64DecodeUnicode(message1);

                            otherSessionCipher.decryptPreKeyWhisperMessage(decodedMes1, 'binary').then(function(result) {
                                return {
                                    place: p,
                                    result: result
                                };
                            }).then(function(result) {
                                try {
                                    var decrypted = b64DecodeUnicode(new dcodeIO.ByteBuffer.wrap(result.result).toString('binary'))
                                } catch (e) {
                                    var decrypted = ''
                                }

                                console.log('decrypted: ' + decrypted);
                                console.log('decrypted: ' + result.place);

                                elements[result.place].innerHTML = '<div style="display: flex;"><div style="flex: 0; margin-right:10px"><img alt="🔑" class="_1ift _2560 img" src="https://static.xx.fbcdn.net/images/emoji.php/v9/z4c/2/16/1f511.png"></div><div style="word-wrap:break-word; min-width: 0;" class="decrypted_message" style="flex: 1"></div>';
                                elements[result.place].getElementsByClassName("decrypted_message")[0].innerHTML = htmlEncode(decrypted).replace(/\*(\S(.*?\S)?)\*/gm, '<b>$1</b>').replace(/_(\S(.*?\S)?)_/gm, '<i>$1</i>').replace(/~(\S(.*?\S)?)~/gm, '<del>$1</del>')
                            }).catch(function(err) {
                                console.error('1: ' + err)
                            });
                        } catch (e) {

                        }

                        try {
                            var decodedMes2 = b64DecodeUnicode(message2);

                            otherSessionCipher.decryptPreKeyWhisperMessage(decodedMes2, 'binary').then(function(result) {
                                return {
                                    place: p,
                                    result: result
                                };
                            }).then(function(result) {
                                try {
                                    var decrypted = b64DecodeUnicode(new dcodeIO.ByteBuffer.wrap(result.result).toString('binary'))
                                } catch (e) {
                                    var decrypted = ''
                                }

                                console.log('decrypted: ' + decrypted);
                                console.log('decrypted: ' + result.place);

                                elements[result.place].innerHTML = '<div style="display: flex;"><div style="flex: 0; margin-right:10px"><img alt="🔑" class="_1ift _2560 img" src="https://static.xx.fbcdn.net/images/emoji.php/v9/z4c/2/16/1f511.png"></div><div style="word-wrap:break-word; min-width: 0;" class="decrypted_message" style="flex: 1"></div>';
                                elements[result.place].getElementsByClassName("decrypted_message")[0].innerHTML = htmlEncode(decrypted).replace(/\*(\S(.*?\S)?)\*/gm, '<b>$1</b>').replace(/_(\S(.*?\S)?)_/gm, '<i>$1</i>').replace(/~(\S(.*?\S)?)~/gm, '<del>$1</del>')
                            }).catch(function(err) {
                                console.error('2: ' + err)
                            });
                        } catch (e) {

                        }
                    }
                }
            });
        }
    });
});

observer.observe(document, {
  childList: true,
  subtree:true
});
