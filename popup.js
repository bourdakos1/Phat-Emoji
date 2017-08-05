document.addEventListener('DOMContentLoaded', function() {
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
        validate();
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

    console.log(messageText)
    chrome.tabs.executeScript(null, {
        code: 'sendMessage("' + messageText.replace(/(?:\r\n|\r|\n)/g, '<br/>') + '")'
    }, function() {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.runtime.lastError) {
            // tokenView.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
        }
    });
}
