// options.js

document.addEventListener('DOMContentLoaded', () => {
    const allowedDomainsInput = document.getElementById('allowedDomains');
    const saveButton = document.getElementById('saveButton');
    const status = document.getElementById('status');

    // Load existing settings
    chrome.storage.local.get(['allowedDomains'], (result) => {
        if (result.allowedDomains && result.allowedDomains.length > 0) {
            allowedDomainsInput.value = result.allowedDomains.join(', ');
        }
    });

    // Save settings when the save button is clicked
    saveButton.addEventListener('click', () => {
        const allowedDomains = allowedDomainsInput.value.split(',').map(domain => domain.trim()).filter(domain => domain !== '');

        chrome.storage.local.set({ allowedDomains }, () => {
            status.textContent = 'Settings saved';
        });
    });
});
