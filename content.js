chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var token = ""
    document.cookie.split(";").forEach(element => { if (element.includes("Token")) { token = element.split("=")[1] } })
    switch (request.message) {
        case "btn_read_note":
            getNotesFromPage(token)
            break;
        case "btn_read_content":
            getPageTextContent(token)
            break;

    }
})

function getPageTextContent(token) {
    const { projectID, pageID } = getPageRelatedIDs();

    const options = {
        headers: {
            'content-Type': 'application/json',
            'zeplin-token': token,
            'connection': 'keep-alive',
            'Accept': '*/*',
        },
    };

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
                        copyTextToClipboard(contentText)
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

function getNotesFromPage(token) {
    const { projectID, pageID } = getPageRelatedIDs();

    const options = {
        headers: {
            'content-Type': 'application/json',
            'zeplin-token': token,
            'connection': 'keep-alive',
            'Accept': '*/*',
        },
    };

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
                copyTextToClipboard(androidStrings)
            }
        })
}

function getPageRelatedIDs() {
    var urlArray = document.URL.split("/")

    return {
        projectID: urlArray[4],
        pageID: urlArray[6]
    }
}

//https://stackoverflow.com/a/18455088/11956146
function copyTextToClipboard(text) {
    //Create a textbox field where we can insert text to. 
    var copyFrom = document.createElement("textarea");

    //Set the text content to be the text you wished to copy.
    copyFrom.textContent = text;

    //Append the textbox field into the body as a child. 
    //"execCommand()" only works when there exists selected text, and the text is inside 
    //document.body (meaning the text is part of a valid rendered HTML element).
    document.body.appendChild(copyFrom);

    //Select all the text!
    copyFrom.select();

    //Execute command
    document.execCommand('copy');

    //(Optional) De-select the text using blur(). 
    copyFrom.blur();

    //Remove the textbox field from the document.body, so no other JavaScript nor 
    //other elements can get access to this.
    document.body.removeChild(copyFrom);
    alert("Copied!")
}