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
            if (!isTokenAlertActive) {
                isTokenAlertActive = true
                alert("Opps token not defined!! Please read readme.md directive")
            }
            return
        }
        switch (request.message) {
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
        return true;
    });

function getThumbinalLink(url, sendResponse) {
    var url = thumbinalMap.get(url)
    if (url != undefined) {
        sendResponse(url)
    }
}

function getThumbinalUrl(url) {
    fetch(url).then(response => {
        getPageTumbinal(response.url, url)
    })
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
            console.log("error");
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
                })
        })
}

function readLayer(layer) {
    var contentText = ""

    if (layer.type == "text" && layer.name.trim() != "") {
        contentText += layer.name + "</string>\n"
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
        })
}
