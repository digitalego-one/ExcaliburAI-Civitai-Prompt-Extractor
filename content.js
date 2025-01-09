// content.js

// Listen for messages from background script
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "processImage" && request.buffer) {
    try {
      console.log("Received image buffer");

      // Parse EXIF data
      const exifData = EXIF.readFromBinaryFile(request.buffer);
      const userComment = exifData.UserComment || exifData.userComment;

      console.log("Extracted userComment:", userComment);
      console.log("UserComment length:", userComment.length);
      console.log("UserComment content:", userComment);

      if (userComment && userComment.length > 0) {
        const decodedText = decodeUserComment(userComment);
        console.log("Decoded userComment:", decodedText);

        if (decodedText && decodedText.trim() !== "" && decodedText !== "UNICODE") {
          // Write to clipboard
          await copyToClipboard(decodedText);
          console.log("Copied to clipboard successfully");

          // Send notification
          chrome.runtime.sendMessage({ type: "notification", text: "Copied to clipboard" });
        } else if (decodedText === "UNICODE") {
          // Send notification: No prompts found
          chrome.runtime.sendMessage({ type: "notification", text: "No prompts found" });
        } else {
          // Send notification: Failed to decode
          chrome.runtime.sendMessage({ type: "notification", text: "Failed to decode the prompt" });
        }
      } else {
        // Send notification: No prompts found
        chrome.runtime.sendMessage({ type: "notification", text: "No prompts found" });
      }
    } catch (error) {
      console.error('Error processing image:', error);
      // Send notification: An error occurred
      chrome.runtime.sendMessage({ type: "notification", text: "An error occurred while processing the image." });
    }
  }
});

// Function to decode the userComment field
function decodeUserComment(userComment) {
  if (!userComment) return '';

  let decoded = '';

  if (typeof userComment === 'string') {
    // Define the prefix based on EXIF specification
    const unicodePrefix = 'UNICODE\0\0 ';
    const asciiPrefix = 'ASCII\0\0 ';

    if (userComment.startsWith(unicodePrefix)) {
      // Remove the 'UNICODE\0\0 ' prefix
      const unicodeStr = userComment.slice(unicodePrefix.length).trim();
      decoded = unicodeStr;
    } else if (userComment.startsWith(asciiPrefix)) {
      // Remove the 'ASCII\0\0 ' prefix
      const asciiStr = userComment.slice(asciiPrefix.length).trim();
      decoded = asciiStr;
    } else {
      // No prefix, return as is
      decoded = userComment.trim();
    }
  }

  return decoded;
}

// Function to copy text to the clipboard using a temporary textarea
async function copyToClipboard(text) {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary textarea element
      const textarea = document.createElement('textarea');
      textarea.value = text;

      // Make the textarea out of viewport
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);

      // Select the text
      textarea.focus();
      textarea.select();

      // Execute the copy command
      const successful = document.execCommand('copy');
      if (successful) {
        resolve();
      } else {
        reject(new Error('Copy command was unsuccessful'));
      }

      // Remove the textarea
      document.body.removeChild(textarea);
    } catch (err) {
      console.error('Failed to copy:', err);
      reject(err);
    }
  });
}
