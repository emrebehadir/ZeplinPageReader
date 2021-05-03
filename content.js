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

$(document).ready(function () {
    initThumbinal();

    $("a").each(function () {
        if (isShortenedZeplinUrl(this.href)) {
            chrome.runtime.sendMessage({ message: 'prepare_thumbinal_link', resolveUrl: this.href });
        }
    })

    $('a').on('mouseenter', mouseEnterHandler);
    $('a').on('mouseleave', mouseLeaveHandler);
});

var hideTimeout;
var showTimeout;
var delay = 250;

function initThumbinal() {
    $('body').append('<div id="zeplin-thumbinal">a</div>');
    $('#zeplin-thumbinal').css({
        "position": "absolute",
        "border": "5px solid #ff5200",
        "transform": "translateX(50%) translate(-50%, -50%) scale(0.45)",
        "z-index": "1", "font-size": "40px",
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
                    var element = $('#zeplin-thumbinal').detach();
                    $(e.target).append(element);
                    if (response.includes("http")) {
                        $('#zeplin-thumbinal').html('<img id="thumbinal_img" src="' + response + '" />')
                    } else {
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