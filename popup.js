document.getElementById("btn_read_note").addEventListener("click", function (e) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        var activeTab = tabs[0];
        chrome.runtime.sendMessage({
            "message": "btn_read_note",
            url: activeTab.url
        });
    });
})

document.getElementById("btn_read_content").addEventListener("click", function (e) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        var activeTab = tabs[0];
        chrome.runtime.sendMessage({
            "message": "btn_read_content",
            url: activeTab.url
        });
    });
})