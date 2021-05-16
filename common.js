function isShortenedZeplinUrl(url) {
    if (url == undefined || url == null) {
        return false
    }
    var arr = url.split("/");
    if (arr.length >= 2) {
        return arr[2] === "zpl.io"
    }
    return false
}

function getPageRelatedIDs(url) {
    var urlArray = ""
    if (url != undefined) {
        urlArray = url.split("/")
    } else {
        urlArray = document.URL.split("/")
    }

    return {
        projectID: urlArray[4],
        pageID: urlArray[6]
    }
}

//https://stackoverflow.com/a/18455088/11956146
function copyTextToClipboard(text, content) {
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
    alert(content + "copied!")
}