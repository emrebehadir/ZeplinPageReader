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

document.getElementById("btn_copy_token").addEventListener("click", function (e) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { "message": "btn_copy_token" });
    });
})

window.onload = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { "message": "check_token" }, function (isTokenNotExist) {
            if (isTokenNotExist) {
                document.getElementById("div_token").style.display = "flex";
            }
        });
    });
};
