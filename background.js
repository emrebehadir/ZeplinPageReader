var thumbinalMap = new Map();
const options = {
    headers: {
        'content-Type': 'application/json',
        'zeplin-token': token,
        'connection': 'keep-alive',
        'Accept': '*/*',
    },
};
var isTokenAlertActive = false

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (token === "") {
            chrome.cookies.get({ url: "https://app.zeplin.io/", name: 'userToken' }, function (cookie) {
                token = cookie.value;
                options.headers["zeplin-token"] = cookie.value;
                if (token === "") {
                    if (!isTokenAlertActive) {
                        isTokenAlertActive = true
                        alert("Opps token not found!!")
                    }
                    return
                }
                applyMessage(request, sendResponse);
            });
        } else {
            applyMessage(request, sendResponse)
        }
        return true;
    });

function applyMessage(request, sendResponse) {
    switch (request.message) {
        case "check_url_unshorten":
            checkUrlUnshorten(request.url, sendResponse)
            break;
        case "prepare_thumbinal_link":
            if (thumbinalMap.get(request.resolveUrl) == undefined) {
                thumbinalMap.set(request.resolveUrl, "")
                getThumbinalUrl(request.resolveUrl)
            }
            break;
        case "get_thumbinal_link":
            getThumbinalLink(request.resolveUrl, sendResponse)
            break;
        case "btn_read_note_b":
            getNotesFromPage(request.url)
            break;
        case "btn_read_content_b":
            getPageTextContent(request.url)
            break;
    }
}

function checkUrlUnshorten(url, sendResponse) {
    var url = thumbinalMap.get(url)
    if (url == undefined) {
        sendResponse()
    }
}

function getThumbinalLink(url, sendResponse) {
    var url = thumbinalMap.get(url)
    if (url != undefined) {
        if (url === "") {
            url = "Url not prepared yet. Please try after a couple of second"
        }
        sendResponse(url)
    }
}

function getThumbinalUrl(url) {
    fetch(url).then(response => {
        getPageTumbinal(response.url, url)
    }).catch(function (error) {
        console.log(error);
    });
}

function getPageTumbinal(url, shortenedUrl) {
    const { projectID, pageID } = getPageRelatedIDs(url);
    fetch("https://api.zeplin.io/v2/projects/" + projectID + "/screens/" + pageID + "/versions", options)
        .then(response => response.json())
        .then(result => {
            if (result.versions == undefined) {
                thumbinalMap.set(shortenedUrl, result.title + " " + result.message)
            } else {
                thumbinalMap.set(shortenedUrl, result.versions[0].snapshot.url)
            }
        }).catch(function (error) {
            console.log(error);
        });
}

function getPageTextContent(url) {
    const { projectID, pageID } = getPageRelatedIDs(url);
    fetch("https://api.zeplin.io/v2/projects/" + projectID + "/screens/" + pageID + "/versions", options)
        .then(response => response.json())
        .then(result => {
            fetch(result.versions[0].fullSnapshotUrl)
                .then(response => response.json())
                .then(result => {
                    contentText = ""
                    result.layers.forEach(layer => {
                        contentText += readLayer(layer)
                    })
                    if (contentText != "") {
                        copyTextToClipboard(contentText, "Page text ")
                    }
                }).catch(function (error) {
                    console.log(error);
                });
        }).catch(function (error) {
            console.log(error);
        });
}

function readLayer(layer) {
    var contentText = ""

    if (layer.type == "text" && layer.name.trim() != "") {
        contentText += layer.name + "\n"
    }

    layer.layers?.forEach(layer => {
        contentText += readLayer(layer)
    })

    return contentText
}

function getNotesFromPage(url) {
    const { projectID, pageID } = getPageRelatedIDs(url);
    if (pageID == undefined) {
        return
    }
    fetch("https://api.zeplin.io/v2/projects/" + projectID + "/screens/" + pageID + "/dots", options).then(response => response.json())
        .then(result => {
            var androidStrings = ""
            result.dots.forEach(item => {
                if (item.status == "open") {
                    item.comments[0].note.split("\n").forEach(item => {
                        const stringConstants = item.trim().split(",")[0]
                        androidStrings += "<string name=\"" + stringConstants + "\"> </string>\n"
                    })
                }
            })

            if (androidStrings != "") {
                copyTextToClipboard(androidStrings, "Notes ")
            }
        }).catch(function (error) {
            console.log(error);
        });
}