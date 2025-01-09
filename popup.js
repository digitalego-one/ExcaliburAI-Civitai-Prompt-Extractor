// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const promptDiv = document.getElementById('prompt');
    const copyButton = document.getElementById('copyButton');

    // Retrieve the last copied prompt from storage
    chrome.storage.local.get(['lastCopiedPrompt'], (result) => {
        if (result.lastCopiedPrompt) {
            const sanitizedText = sanitizeText(result.lastCopiedPrompt);
            promptDiv.textContent = sanitizedText;

            // Log character codes for debugging
            logCharacterCodes(sanitizedText);
        } else {
            promptDiv.textContent = 'No prompt copied yet.';
        }
    });

    // Copy the prompt again when the button is clicked
    copyButton.addEventListener('click', () => {
        chrome.storage.local.get(['lastCopiedPrompt'], (result) => {
            if (result.lastCopiedPrompt) {
                const sanitizedText = sanitizeText(result.lastCopiedPrompt);
                copyTextToClipboard(sanitizedText)
                    .then(() => {
                        alert('Prompt copied to clipboard.');
                    })
                    .catch((err) => {
                        console.error('Failed to copy:', err);
                        alert('Failed to copy prompt.');
                    });
            } else {
                alert('No prompt to copy.');
            }
        });
    });
});

// Function to sanitize text by removing or replacing non-printable and control characters
function sanitizeText(text) {
    // Replace zero-width spaces with regular spaces and remove other control characters
    return text
        .replace(/\u200B/g, ' ') // Replace zero-width space with space
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove other control characters
}

// Function to log character codes of the text
function logCharacterCodes(text) {
    const charCodes = [];
    for (let i = 0; i < text.length; i++) {
        charCodes.push(text.charCodeAt(i).toString(16).toUpperCase().padStart(4, '0'));
    }
    console.log('Character Codes:', charCodes.join(' '));
}

// Function to copy text to the clipboard using the Clipboard API
async function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        // Fallback method using a temporary textarea
        return new Promise((resolve, reject) => {
            try {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.top = '-9999px';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textarea);
                if (successful) {
                    resolve();
                } else {
                    reject(new Error('Copy command was unsuccessful'));
                }
            } catch (err) {
                reject(err);
            }
        });
    } else {
        return navigator.clipboard.writeText(text);
    }
}
