document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.executeScript(null, {
        file: "getPagesSource.js"
    }, function() {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.runtime.lastError) {
            // tokenView.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
        }
    });
});
