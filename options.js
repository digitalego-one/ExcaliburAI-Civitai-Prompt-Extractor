// options.js

document.addEventListener('DOMContentLoaded', () => {
    const enableNotificationsCheckbox = document.getElementById('enableNotifications');
    const allowedDomainsInput = document.getElementById('allowedDomains');
    const saveButton = document.getElementById('saveButton');

    // Load existing settings
    chrome.storage.local.get(['enableNotifications', 'allowedDomains'], (result) => {
        enableNotificationsCheckbox.checked = result.enableNotifications !== false; // Default to true
        if (result.allowedDomains && result.allowedDomains.length > 0) {
            allowedDomainsInput.value = result.allowedDomains.join(', ');
        }
    });

    // Save settings when the save button is clicked
    saveButton.addEventListener('click', () => {
        const enableNotifications = enableNotificationsCheckbox.checked;
        const allowedDomains = allowedDomainsInput.value.split(',').map(domain => domain.trim()).filter(domain => domain !== '');

        chrome.storage.local.set({ enableNotifications, allowedDomains }, () => {
            alert('Settings saved successfully!');
        });
    });
});
