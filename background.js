// background.js

importScripts('exif.js', 'metadata.js');

// In-memory cache for EXIF data
const metadataCache = new Map();

// Create the context menu when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "copyPrompt",
    title: "Copy prompt if any",
    contexts: ["image"]
  });
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "copyPrompt" && info.srcUrl && tab.id) {
    try {
      console.log("Attempting to fetch image:", info.srcUrl);

      // Retrieve settings
      const settings = await getSettings();
      const { allowedDomains, enableNotifications } = settings;

      // Check if the image's domain is allowed
      if (allowedDomains.length > 0) {
        const imageUrl = new URL(info.srcUrl);
        if (!allowedDomains.includes(imageUrl.hostname)) {
          await storeResult({ status: 'error', message: `Domain "${imageUrl.hostname}" is not allowed.` });
          return;
        }
      }

      let result;

      // Check if EXIF data is cached
      if (metadataCache.has(info.srcUrl)) {
        result = metadataCache.get(info.srcUrl);
      } else {
        // Fetch the image
        const response = await fetch(info.srcUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        console.log("ArrayBuffer fetched. Type:", Object.prototype.toString.call(arrayBuffer));

        // Ensure arrayBuffer is an ArrayBuffer
        if (!(arrayBuffer instanceof ArrayBuffer)) {
          throw new TypeError('First argument to DataView constructor must be an ArrayBuffer');
        }

        result = extractMetadata(arrayBuffer);
        metadataCache.set(info.srcUrl, result);
      }
      if (!result || !result.positivePrompt) {
        await storeResult({ status: 'not-found', message: 'No readable positive prompt found.' });
        return;
      }
      await storeResult({ ...result, status: 'found' });
      await injectCopyScript(tab.id, result.positivePrompt);
      chrome.action.setBadgeText({ text: 'OK' });
      chrome.action.setBadgeBackgroundColor({ color: '#2f8f67' });
      if (chrome.action.openPopup) chrome.action.openPopup().catch(() => {});
    } catch (error) {
      console.error('Error processing image:', error);
      await storeResult({ status: 'error', message: error.message || 'Unable to process image.' });
    }
  }
});

function storeResult(result) {
  return new Promise(resolve => chrome.storage.local.set({ lastResult: result, lastCopiedPrompt: result.positivePrompt || '' }, resolve));
}

// Function to inject a script that copies text to the clipboard
async function injectCopyScript(tabId, text) {
  await chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: copyTextToClipboard,
    args: [text],
  });
}

// Function that runs in the context of the page to copy text to clipboard
function copyTextToClipboard(text) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;

    // Make the textarea out of viewport
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.width = '2em';
    textarea.style.height = '2em';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    document.body.appendChild(textarea);

    // Select the text
    textarea.focus();
    textarea.select();

    // Execute the copy command
    const successful = document.execCommand('copy');
    if (successful) {
      console.log('Text copied to clipboard successfully.');
    } else {
      console.error('Failed to copy text to clipboard.');
    }

    // Remove the textarea
    document.body.removeChild(textarea);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

// Function to get user settings
function getSettings() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['enableNotifications', 'allowedDomains'], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve({
          enableNotifications: result.enableNotifications !== false, // Default to true
          allowedDomains: result.allowedDomains || []
        });
      }
    });
  });
}
