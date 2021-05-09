chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(document.URL)
    switch (request.message) {
        case "btn_read_note":
            chrome.runtime.sendMessage({ message: 'btn_read_note_b', url: document.URL });
            break;
        case "btn_read_content":
            chrome.runtime.sendMessage({ message: 'btn_read_content_b', url: document.URL });
            break;
        case "check_token":
            sendResponse(token === "")
            break;
        case "btn_copy_token":
            document.cookie.split(";").forEach(element => { if (element.includes("Token")) { copyTextToClipboard(element.split("=")[1], "Token ") } })
            break;
    }
})

// unshorten
function processElement(e) {
    if (e && e.tagName && e.tagName.toLowerCase() == "a" && isShortenedZeplinUrl(e.href)) {
        chrome.runtime.sendMessage({ message: 'check_url_unshorten', resolveUrl: e.href }, function () {
            chrome.runtime.sendMessage({ message: 'prepare_thumbinal_link', resolveUrl: e.href, token: token });
            e.addEventListener("mouseenter", mouseEnterHandler);
            e.addEventListener('mouseleave', mouseLeaveHandler);
        });
    }
}

function processTree(t) {
    processElement(t);
    if (t.getElementsByTagName) {
        var as = t.getElementsByTagName("a");
        for (var i = 0; i < as.length; ++i) {
            processElement(as[i]);
        }
    }
}

for (var i = 0; i < document.links.length; ++i) {
    processElement(document.links[i]);
}

var m = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; ++i) {
        var evt = mutations[i];
        if (evt.target) {
            processTree(evt.target);
        }
        if (evt.addedNodes) {
            for (var j = 0; j < evt.addedNodes.length; ++j) {
                processTree(evt.addedNodes[j]);
            }
        }
    }
});
m.observe(document, { "childList": true, "attributes": true, "subtree": true });

window.addEventListener('load', (event) => {
    initThumbinal();
});

window.onmousemove = function (e) {
    var x = e.clientX,
        y = e.clientY;

    $('#zeplin-thumbinal').css("top", y)
    $('#zeplin-thumbinal').css("left", x)
};

var hideTimeout;
var showTimeout;
var delay = 250;

function initThumbinal() {
    $('body').append('<div id="zeplin-thumbinal">a</div>');
    $('#zeplin-thumbinal').css({
        "position": "absolute",
        "border": "5px solid #ff5200",
        "transform": "translateX(50%) translate(-50%, -50%) scale(0.45)",
        "z-index": "20",
        "font-size": "40px",
        "background": "black",
        "min-width": "1px",
        "min-height": "10px",
        "color": "white"
    });
    $('#zeplin-thumbinal').hide();
}

function mouseEnterHandler(e) {
    var url = $(e.target).attr('href');
    if (isShortenedZeplinUrl(url)) {
        showTimeout = setTimeout(function () {
            showTimeout = null;
            try {
                chrome.runtime.sendMessage({ message: "get_thumbinal_link", resolveUrl: url }, function (response) {
                    if (response.includes("http")) {
                        $('#zeplin-thumbinal').css("transform", "translateX(50%) translate(-50%, -50%) scale(0.45)")
                        $('#zeplin-thumbinal').html('<img id="thumbinal_img" src="' + response + '" />')
                    } else {
                        $('#zeplin-thumbinal').css("transform", "none")
                        $('#zeplin-thumbinal').html(response);
                    }
                    $('#zeplin-thumbinal').show();
                });
            }
            catch (err) {
                alert("Please refresh tab")
            }
        }, delay);
    }
}

function mouseLeaveHandler() {
    if (showTimeout !== null) {
        clearTimeout(showTimeout);
        showTimeout = null;
    } else {
        hideTimeout = setTimeout(function () {
            hideTimeout = null;
            $('#zeplin-thumbinal').hide();
        }, delay);
    }
}