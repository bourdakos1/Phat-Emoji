function htmlEncode(html) {
    return document.createElement('a').appendChild(document.createTextNode(html)).parentNode.innerHTML;
};

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

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutations, observer) {
    // We get all of this locally, it says other, but this will be our goods.
    var OTHER_IDENTITY_KEY = {pubKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode('BXTDt0PCjMKaYFN3w5fCv8KAwqJNw4LDncKBdw4swq5TGULDmcKaV8OlN0zDvG4T'), 'binary').toArrayBuffer(), privKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode('KAZpwpwxYsOYwq7ClsKVfMOrwqxbbsKOwoDDtsOKwrhzAEzDmSx4w7nCh8KMPDZc'), 'binary').toArrayBuffer()};
    var OTHER_REGISTRATION_ID = 9;

    var OTHER_PRE_KEY_ID = 1;
    var OTHER_PRE_KEY = {pubKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode('BXDDgcK1YTXClXsjw5NBw7/CjcOjKsONw7cdAcKrw4gnSRzDrMOoMHVdUHYafQ=='), 'binary').toArrayBuffer(), privKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode('AGnCkkHCsFhMQsKPBCkew4VWMsO7wrTCqkLDhMOOUXpkw6fDuTvCpxjDjkxC'), 'binary').toArrayBuffer()};

    var OTHER_SIGNED_PRE_KEY_ID = 1;
    var OTHER_SIGNED_PRE_KEY = {pubKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode('BQnDqgvDm2Nbw65eJMOIJ1QvRF7CrsKPwqXCksK7BCpMfX4ULkHDuRQ0Qg=='), 'binary').toArrayBuffer(), privKey: new dcodeIO.ByteBuffer.wrap(b64DecodeUnicode('aE7Ct8OSesOxX8K2w5VZH0E1JsK+FX/CjxHDhhHCp8KwaF5XUMObwogEw7pL'), 'binary').toArrayBuffer()};

    mutations.forEach(function (mutation) {
        if (mutation.addedNodes.length) {
            var emojis = $(mutation.addedNodes).find('._1o13');
            for (var i = 0, len = emojis.length; i < len; i++) {
                var node = emojis[i].parentNode.parentNode
                node.innerHTML = '<div aria-label="🤔" class="_2poz _ui9 _383m" tabindex="0"><img class="_19_s _1ift img" src="http://i.imgur.com/V5zsy2i.png" alt=""></div>'
            }

            var elements = $(mutation.addedNodes).find('._3oh-._58nk');

            var promises = [];
            var place = [];
            for (var i = 0, len = elements.length; i < len; i++) {
                var message = elements[i].innerText;
                console.log(message);
                if (message.split('::::::')[1] != null) {
                    message = message.split('::::::')[1]
                    console.log('decrypt: ' + message);
                    var otherStore = new SignalProtocolStore();

                    otherStore.put('identityKey', OTHER_IDENTITY_KEY)
                    otherStore.put('registrationId', OTHER_REGISTRATION_ID)

                    otherStore.storePreKey(OTHER_PRE_KEY_ID, OTHER_PRE_KEY);
                    otherStore.storeSignedPreKey(OTHER_SIGNED_PRE_KEY_ID, OTHER_SIGNED_PRE_KEY);

                    var RECIPIENT_ADDRESS = new libsignal.SignalProtocolAddress("shitstormmms", 0);

                    var otherSessionCipher = new libsignal.SessionCipher(otherStore, RECIPIENT_ADDRESS);
                    var promise = otherSessionCipher.decryptPreKeyWhisperMessage(b64DecodeUnicode(message), 'binary');
                    promises.push(promise);
                    place.push(i);
                }
            }

            if (!promises.length) {
                return
            }

            Promise.all(promises).then(function(results) {
                console.log('all promises returned');
                for (var i = 0; i < results.length; i++) {
                    var decrypted = new dcodeIO.ByteBuffer.wrap(results[i]).toString('binary')
                    console.log('decrypted: ' + decrypted);
                    elements[place[i]].innerHTML = '<div style="display: flex;"><div style="flex: 0; margin-right:10px"><img alt="🔑" class="_1ift _2560 img" src="https://static.xx.fbcdn.net/images/emoji.php/v9/z4c/2/16/1f511.png"></div><div style="word-wrap:break-word; min-width: 0;" class="decrypted_message" style="flex: 1"></div>';
                    elements[place[i]].getElementsByClassName("decrypted_message")[0].innerHTML = htmlEncode(decrypted).replace(/\*(\S(.*?\S)?)\*/gm, '<b>$1</b>').replace(/_(\S(.*?\S)?)_/gm, '<i>$1</i>').replace(/~(\S(.*?\S)?)~/gm, '<del>$1</del>')
                }
            });
        }
    });
});

observer.observe(document, {
  childList: true,
  subtree:true
});
