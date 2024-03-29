window.onload = initializePopup;
const OPENAI_KEY_STORAGE_KEY = 'openai_key';

async function initializePopup() {
    const startSessionButton = document.querySelector('#start_session');
    startSessionButton.onclick = invokeContentScript;
    const form = document.querySelector('form');
    form.addEventListener('submit', saveOpenAIKey);
    const unsaveButton = document.querySelector('#unsave_key_btn');
    unsaveButton.addEventListener('click', unsaveOpenAIKey);

    // Retrieve key if previously stored
    const bytesStored = await chrome.storage.local.getBytesInUse(OPENAI_KEY_STORAGE_KEY);
    if (bytesStored === 0) {
        showLoggedOutUI();
    } else {
        showLoggedInUI();
    }
}

function invokeContentScript() {
    chrome.tabs.query({ active: true, currentWindow: true}, (tabs) => {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id },
            files: ['page_content_script.js'],
        });
    });
    window.close();
}

async function saveOpenAIKey(submitEvent) {
    submitEvent.preventDefault();
    let keyValue;
    const  input = submitEvent.target.querySelector('#openai-key-input');
    if (input) {
        keyValue = input.value;
    }
    // Make an auth check to make sure the key works
    response = await fetch('https://api.openai.com/v1/models', {
        headers: {
            Authorization: `Bearer ${keyValue}`,
        },
    });
    if (response.status !== 200) {
        window.alert('Provided API key was not recognized as valid.');
        return;
    }
    
    // Store OpenAI key in localStorage
    await chrome.storage.local.set({ [OPENAI_KEY_STORAGE_KEY]: keyValue});

    // Switch UI
    showLoggedInUI();
    return false;
}

async function unsaveOpenAIKey() {
    await chrome.storage.local.clear();
    showLoggedOutUI();
}

async function showLoggedInUI() {
    document.querySelector('#not-logged-in').classList.add('hidden');
    document.querySelector('#logged-in').classList.remove('hidden');
    const storedKey = await chrome.storage.local.get(OPENAI_KEY_STORAGE_KEY);
    document.querySelector('#saved-openai-key').value = storedKey;
}

function showLoggedOutUI() {
    document.querySelector('#saved-openai-key').value = '';
    document.querySelector('#not-logged-in').classList.remove('hidden');
    document.querySelector('#logged-in').classList.add('hidden');
}