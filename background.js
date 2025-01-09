// background.js

importScripts('exif.js');

// In-memory cache for EXIF data
const exifCache = new Map();

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
          if (enableNotifications) {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon48.png',
              title: 'Copy Prompt If Any',
              message: `Domain "${imageUrl.hostname}" is not allowed.`
            });
          }
          return;
        }
      }

      let exifData;

      // Check if EXIF data is cached
      if (exifCache.has(info.srcUrl)) {
        console.log("Using cached EXIF data for:", info.srcUrl);
        exifData = exifCache.get(info.srcUrl);
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

        // Read EXIF data from the image
        exifData = EXIF.readFromBinaryFile(arrayBuffer);
        console.log("EXIF data:", exifData);

        // Cache the EXIF data
        exifCache.set(info.srcUrl, exifData);
      }

      const userComment = exifData.UserComment || exifData.userComment;
      console.log("UserComment:", userComment);

      if (userComment && userComment.length > 0) {
        const decodedText = decodeUserComment(userComment);
        console.log("Decoded userComment:", decodedText);

        if (decodedText && decodedText.trim() !== "" && decodedText !== "UNICODE") {
          // Store the last copied prompt in storage
          chrome.storage.local.set({ lastCopiedPrompt: decodedText }, () => {
            console.log('Last copied prompt stored:', decodedText);
          });

          // Inject script to copy to clipboard
          await injectCopyScript(tab.id, decodedText);

          console.log("Injected copy script successfully.");

          // Show success notification if enabled
          if (enableNotifications) {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon48.png',
              title: 'Copy Prompt If Any',
              message: 'Copied to clipboard'
            });
          }
        } else if (decodedText === "UNICODE") {
          // Show notification: No prompts found
          if (enableNotifications) {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon48.png',
              title: 'Copy Prompt If Any',
              message: 'No prompts found'
            });
          }
        } else {
          // Show notification: Failed to decode
          if (enableNotifications) {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon48.png',
              title: 'Copy Prompt If Any',
              message: 'Failed to decode the prompt'
            });
          }
        }
      } else {
        // Show notification: No prompts found
        if (enableNotifications) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Copy Prompt If Any',
            message: 'No prompts found'
          });
        }
      }
    } catch (error) {
      console.error('Error processing image:', error);
      // Show error notification if enabled
      chrome.storage.local.get(['enableNotifications'], (result) => {
        if (result.enableNotifications !== false) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Copy Prompt If Any',
            message: 'An error occurred while processing the image.'
          });
        }
      });
    }
  }
});

// Function to decode the userComment field
function decodeUserComment(userComment) {
  let decoded = '';

  if (Array.isArray(userComment)) {
    // Convert to Uint8Array
    const uint8Array = new Uint8Array(userComment);

    // Decode the prefix (first 8 bytes)
    const prefix = new TextDecoder('ascii').decode(uint8Array.slice(0, 8));

    if (prefix === 'UNICODE') {
      // Decode the rest as UTF-16LE
      const contentBytes = uint8Array.slice(8);
      decoded = new TextDecoder('utf-16le').decode(contentBytes);
    } else if (prefix === 'ASCII\0\0\0') {
      // Decode the rest as ASCII
      const contentBytes = uint8Array.slice(8);
      decoded = new TextDecoder('ascii').decode(contentBytes);
    } else {
      // No known prefix, attempt to decode as UTF-8
      decoded = new TextDecoder('utf-8').decode(uint8Array);
    }
  } else if (typeof userComment === 'string') {
    // Handle string directly
    const unicodePrefix = 'UNICODE';
    const asciiPrefix = 'ASCII\0\0\0';

    if (userComment.startsWith(unicodePrefix)) {
      decoded = userComment.slice(unicodePrefix.length).trim();
    } else if (userComment.startsWith(asciiPrefix)) {
      decoded = userComment.slice(asciiPrefix.length).trim();
    } else {
      decoded = userComment.trim();
    }
  }

  return decoded;
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
