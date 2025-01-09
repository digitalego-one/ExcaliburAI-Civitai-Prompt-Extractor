// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const promptDiv = document.getElementById('prompt');
    const negativePromptDiv = document.getElementById('negativePrompt');
    const otherMetadataDiv = document.getElementById('otherMetadata');
    
    const copyPromptButton = document.getElementById('copyPromptButton');
    const copyNegativePromptButton = document.getElementById('copyNegativePromptButton');
    const copyMetadataButton = document.getElementById('copyMetadataButton');

    // Retrieve the last copied prompt from storage
    chrome.storage.local.get(['lastCopiedPrompt'], (result) => {
        if (result.lastCopiedPrompt) {
            const sanitizedText = sanitizeText(result.lastCopiedPrompt);
            const parsedData = parsePromptData(sanitizedText);
            
            // Display the parsed sections
            promptDiv.textContent = parsedData.prompt || 'No prompt found.';
            negativePromptDiv.textContent = parsedData.negativePrompt || 'No negative prompt found.';
            otherMetadataDiv.textContent = parsedData.otherMetadata || 'No metadata found.';
        } else {
            promptDiv.textContent = 'No prompt copied yet.';
            negativePromptDiv.textContent = 'No negative prompt copied yet.';
            otherMetadataDiv.textContent = 'No metadata copied yet.';
        }
    });

    // Event listeners for Copy buttons
    copyPromptButton.addEventListener('click', () => {
        const text = promptDiv.textContent;
        if (text && text !== 'No prompt found.') {
            copyTextToClipboard(text)
                .then(() => {
                    alert('Prompt copied to clipboard.');
                })
                .catch((err) => {
                    console.error('Failed to copy Prompt:', err);
                    alert('Failed to copy Prompt.');
                });
        } else {
            alert('No prompt to copy.');
        }
    });

    copyNegativePromptButton.addEventListener('click', () => {
        const text = negativePromptDiv.textContent;
        if (text && text !== 'No negative prompt found.') {
            copyTextToClipboard(text)
                .then(() => {
                    alert('Negative Prompt copied to clipboard.');
                })
                .catch((err) => {
                    console.error('Failed to copy Negative Prompt:', err);
                    alert('Failed to copy Negative Prompt.');
                });
        } else {
            alert('No negative prompt to copy.');
        }
    });

    copyMetadataButton.addEventListener('click', () => {
        const text = otherMetadataDiv.textContent;
        if (text && text !== 'No metadata found.') {
            copyTextToClipboard(text)
                .then(() => {
                    alert('Metadata copied to clipboard.');
                })
                .catch((err) => {
                    console.error('Failed to copy Metadata:', err);
                    alert('Failed to copy Metadata.');
                });
        } else {
            alert('No metadata to copy.');
        }
    });
});

// Function to sanitize text by removing or replacing non-printable and control characters
function sanitizeText(text) {
    // Replace zero-width spaces with regular spaces and remove other control characters
    return text
        .replace(/\u200B/g, ' ') // Replace zero-width space with space
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove other control characters
}

// Function to parse the prompt data into sections
function parsePromptData(text) {
    const result = {
        prompt: '',
        negativePrompt: '',
        otherMetadata: ''
    };

    // Use case-insensitive regex to find sections
    const unicodeRegex = /UNICODE\s*(.*?)\s*Negative prompt:/i;
    const negativePromptRegex = /Negative prompt:\s*(.*?)\s*Steps:/i;
    const otherMetadataRegex = /Steps:\s*(.*)/i;

    const unicodeMatch = text.match(unicodeRegex);
    if (unicodeMatch && unicodeMatch[1]) {
        result.prompt = unicodeMatch[1].trim();
    }

    const negativePromptMatch = text.match(negativePromptRegex);
    if (negativePromptMatch && negativePromptMatch[1]) {
        result.negativePrompt = negativePromptMatch[1].trim();
    }

    const otherMetadataMatch = text.match(otherMetadataRegex);
    if (otherMetadataMatch && otherMetadataMatch[1]) {
        result.otherMetadata = otherMetadataMatch[1].trim();
    }

    return result;
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
