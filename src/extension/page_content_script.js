injectUIIntoPage();

function injectUIIntoPage() {
    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL("injected_ui.html");
    iframe.style.width = '100%';
    document.body.insertBefore(iframe, document.body.firstChild);
}

// function startSendTextToReader() {
//     // Find most appropriate text
//     const main = document.querySelector('main');
//     const content = document.querySelector('content');
//     const article = document.querySelector('article');

//     if (main) {
//         sendTextToReader(main.innerText);
//     } else if (content) {
//         sendTextToReader(content.innerText);
//     } else if (article) {
//         sendTextToReader(article.innerText);
//     } else {
//         sendTextToReader(document.body.innerText);
//     }
// }

// function sendTextToReader(text) {
//     console.log('Sending text to reader');
//     chrome.runtime.sendMessage({
//         pageText: text,
//     });
// }
