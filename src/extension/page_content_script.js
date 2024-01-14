startSendTextToReader();

function startSendTextToReader() {
    // Find most appropriate text
    const main = document.querySelector('main');
    const content = document.querySelector('content');
    const article = document.querySelector('article');

    if (main) {
        sendTextToReader(main.innerText);
    } else if (content) {
        sendTextToReader(content.innerText);
    } else if (article) {
        sendTextToReader(article.innerText);
    } else {
        sendTextToReader(document.body.innerText);
    }
}

function sendTextToReader(text) {
    console.log('Sending text to reader');
    chrome.runtime.sendMessage({
        pageText: text,
    });
}
