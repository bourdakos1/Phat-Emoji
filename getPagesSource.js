MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutations, observer) {
    // fired when a mutation occurs
    var errors = document.getElementsByClassName("_1o13");
    for (var i = 0; i < errors.length; i++) {
        var node = errors[i].parentNode.parentNode
        node.innerHTML = '<div aria-label="🤔" class="_2poz _ui9 _383m" tabindex="0"><img class="_19_s _1ift img" src="http://i.imgur.com/V5zsy2i.png" alt=""></div>'
    }

    var encrypt = document.getElementsByClassName("_3oh- _58nk");
    for (var i = 0; i < encrypt.length; i++) {
        var encrypts = encrypt[i].innerText.match( /<encrypted>(.*?)<\/encrypted>/ );
        console.log(encrypts);
        if (encrypts != null) {
            for (var y = 0; y < encrypts.length; y++) {
                encrypt[i].innerText = "poop"
            }
        }
    }
});

// define what element should be observed by the observer
// and what types of mutations trigger the callback
observer.observe(document, {
  subtree: true,
  attributes: true
});
