window.onload = initializePopup;

async function initializePopup() {
    // Event Handlers
    const form = document.querySelector('form');
    form.addEventListener('submit', saveOpenAIKey);
    const unsaveButton = document.querySelector('#unsave_key_btn');
    unsaveButton.addEventListener('click', unsaveOpenAIKey);

    const bytesStored = await chrome.storage.local.getBytesInUse('openai_key');
    if (bytesStored === 0) {
        showLoggedOutUI();
    } else {
        showLoggedInUI();
    }
}

async function saveOpenAIKey(submitEvent) {
    submitEvent.preventDefault();
    let keyValue;
    const  input = submitEvent.target.querySelector('#openai-key-input');
    if (input) {
        keyValue = input.value;
    }
    // Make an auth check to make sure the key works
    response = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${keyValue}` }});
    if (response.status !== 200) {
        window.alert('Provided API key was not recognized as valid.');
        return;
    }
    
    // Store OpenAI key in localStorage
    await chrome.storage.local.set({ openai_key: keyValue});

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
    const storedKey = await chrome.storage.local.get('openai_key');
    document.querySelector('#saved-openai-key').value = storedKey;
}

function showLoggedOutUI() {
    document.querySelector('#saved-openai-key').value = '';
    document.querySelector('#not-logged-in').classList.remove('hidden');
    document.querySelector('#logged-in').classList.add('hidden');
}