window.onload = initializePopup;
let pageText = [];
let playbackCursor = 0;
let audioPlayer;
const CHAR_REQUEST_LIMIT = 2048;

async function initializePopup() {
    // Event Handlers
    const readToMeButton = document.querySelector('#read_webpage_submit');
    readToMeButton.addEventListener('click', initializeReadPageContent);
    chrome.runtime.onMessage.addListener(receivePageText);
    const playNextButton = document.querySelector('#play_next');
    playNextButton.addEventListener('click', playNextChunk);

    // Set up audio
    audioPlayer = document.querySelector('#tts');


}

async function initializeReadPageContent() {
    // Retrieve the page's contents and send to OpenAI
    chrome.tabs.query({ active: true, currentWindow: true}, (tabs) => {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id },
            files: ['page_content_script.js'],
        });
    });

    // Display the media controls
    document.querySelector('#audio_player_wrapper').classList.remove('hidden');
    
}

function receivePageText(request, sender, _) {
    if (request.pageText) {
        // Store text for sending to openAI;
        pageText = splitStringIntoRequestChunks(request.pageText);
    }

    // Set up blob caching


    // Send request to openAI
    requestAudioForText(pageText[playbackCursor]);
}

async function requestAudioForText(text) {
    showSpinner();
    const headers = {
        ...await getAuthHeader(),
        'Content-Type': 'application/json'
    };
    console.log('Request headers:', headers);
    fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            model: 'tts-1',
            input: text,
            voice: 'nova',
            response_format: 'aac'
        }),
    }).then(async response => {
        if (response.status !== 200) {
            const errorResponse = await response.json();
            if (errorResponse.error) {
                window.alert(errorResponse.error.message);
            }
            console.error('Unsuccessful request to OpenAI:', errorResponse);
            throw new Error('Unsuccessful request to OpenAI');
        }
        playAudioResponse(response);
    })
    .catch(err => {
        console.error(err);
    });
}

async function playAudioResponse(response) {
    const blob = await response.blob();
    audioPlayer.src = URL.createObjectURL(blob);
    audioPlayer.load();
    hideSpinner();
    audioPlayer.play();
}

function playNextChunk() {
    playbackCursor += 1;
    requestAudioForText(pageText[playbackCursor]);
}

async function getAuthHeader() {
    const storedValue = await chrome.storage.local.get(OPENAI_KEY_STORAGE_KEY);
    return {
        Authorization: `Bearer ${storedValue[OPENAI_KEY_STORAGE_KEY]}`,
    };
}

function splitStringIntoRequestChunks(totalString) {
    const strArray = [];
    const sentences = totalString.split('. ');
    let cursor = 0;
    let chunk = '';
    while (cursor < sentences.length) {
        const sentenceLength = sentences[cursor].length;
        if (sentenceLength > CHAR_REQUEST_LIMIT) {
            throw new Error('Could not chunk text into reasonable sentence size. This shouldn\'t happen! Please contact the developer in this case and send them this example so they can resolve the issue.');
        }
        if ((chunk.length + sentenceLength) < CHAR_REQUEST_LIMIT) {
            chunk += sentences[cursor] + '. ';
            cursor += 1;
            if (cursor >= sentences.length) {
                strArray.push(chunk);
            }
        } else {
            strArray.push(chunk);
            chunk = '';
        }
    }
    return strArray;
}

function showSpinner() {
    document.querySelector('#spinner').classList.remove('hidden');
}

function hideSpinner() {
    document.querySelector('#spinner').classList.add('hidden');
}