function initializePopup() {
    const storedKey = chrome.storage.local.get('openai_key');
    if (storedKey) {
        showLoggedInUI();
    } else {
        showLoggedOutUI();
    }
}

async function saveOpenAIKey(value) {
    console.log('What is value?', value);
    const keyValue = "";
    // const keyValue = document.querySelector('')
    // Make an auth check to make sure the key works
    response = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: keyValue }});
    if (response.status !== 200) {
        window.alert('Provided API key was not recognized as valid.');
        return;
    }
    
    // Store OpenAI key in localStorage
    chrome.storage.local.set({ openai_key: keyValue});

    // Switch UI
    showLoggedInUI();

    return false;
}

function unsaveOpenAIKey() {
    chrome.storage.local.clear();
}

function showLoggedInUI() {
    document.querySelector('#not-logged-in').classList.add('hidden');
    document.querySelector('#logged-in').classList.remove('hidden');
    const storedKey = chrome.storage.local.get('openai_key');
    document.querySelector('#saved-openai-key').value = storedKey;
}

function showLoggedOutUI() {
    document.querySelector('#saved-openai-key').value = '';
    document.querySelector('#not-logged-in').classList.remove('hidden');
    document.querySelector('#logged-in').classList.add('hidden');
}