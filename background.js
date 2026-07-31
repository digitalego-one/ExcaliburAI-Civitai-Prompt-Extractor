// background.js

importScripts('exif.js', 'metadata.js');

// In-memory cache for EXIF data
const metadataCache = new Map();

// Create the context menu when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  clearSession();
  chrome.contextMenus.create({
    id: "copyPrompt",
    title: "Copy prompt if any",
    contexts: ["image"]
  });
});

chrome.runtime.onStartup.addListener(clearSession);

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "copyPrompt" && info.srcUrl && tab.id) {
    try {
      await clearSession();
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
      if ((!result || !result.positivePrompt) && isCivitaiImageUrl(info.srcUrl)) {
        result = await fetchCivitaiMetadata(info.srcUrl);
      }
      if (!result || !result.positivePrompt) {
        await storeResult({ ...(result || {}), status: 'not-found', message: 'No readable positive prompt found.', sourceSite: classifySourceSite(tab.url) });
        return;
      }
      await storeResult({ ...result, status: 'found', sourceSite: classifySourceSite(tab.url) });
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

function clearSession() {
  return new Promise(resolve => chrome.storage.local.remove(['lastResult', 'lastCopiedPrompt'], resolve));
}

function isCivitaiImageUrl(url) {
  try { return new URL(url).hostname.endsWith('.civitai.com'); } catch (_) { return false; }
}

function classifySourceSite(pageUrl) {
  try {
    const hostname = new URL(pageUrl || '').hostname.toLowerCase();
    if (hostname === 'civitai.com' || hostname.endsWith('.civitai.com')) return 'civitai.com';
    if (hostname === 'civitai.red' || hostname.endsWith('.civitai.red')) return 'civitai.red';
  } catch (_) { /* Keep unavailable for local or malformed URLs. */ }
  return '';
}

async function fetchCivitaiMetadata(imageUrl) {
  const match = imageUrl.match(/\/([0-9a-f]{8}-[0-9a-f-]{27,})\//i);
  if (!match) return null;
  const response = await fetch(`https://civitai.com/api/v1/images/${match[1]}`);
  if (!response.ok) return null;
  const data = await response.json();
  const meta = data && data.meta;
  if (!meta) return null;
  return {
    positivePrompt: cleanPositiveSource(String(meta.prompt || '').trim()),
    negativePrompt: String(meta.negativePrompt || '').trim(),
    rawText: JSON.stringify(meta, null, 2),
    metadataText: Object.entries(meta).filter(([key]) => !/prompt/i.test(key)).map(([key, value]) => `${key}: ${value}`).join('\n'),
    source: 'civitai-api', confidence: 'high'
  };
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
