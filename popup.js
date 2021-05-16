document.getElementById("btn_read_note").addEventListener("click", function (e) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { "message": "btn_read_note" });
    });
})

document.getElementById("btn_read_content").addEventListener("click", function (e) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { "message": "btn_read_content" });
    });
})