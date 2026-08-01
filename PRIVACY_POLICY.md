# Privacy Policy for ExcaliburAI - Civitai Prompt Extractor

**Effective date:** August 1, 2026  
**Version:** 2.0

ExcaliburAI - Civitai Prompt Extractor is developed by Digital Ego One. This Privacy Policy explains what information the extension processes when you use it in Chrome or Mozilla Firefox.

## 1. Summary

- The extension is designed to process image metadata locally in your browser.
- It does not include analytics, advertising, tracking pixels, or telemetry.
- It does not sell, rent, or share personal information for advertising.
- Prompt results and extension settings are stored in the browser's local extension storage.
- A CivitAI API request may be made only as a fallback for recognizable CivitAI image URLs when embedded metadata cannot be read.

## 2. Information the Extension Processes

When you choose **Copy Prompt If Any** from an image context menu, the extension may process:

- The image URL you selected.
- Metadata embedded in the image, such as PNG text chunks, JPEG EXIF/UserComment, WebP EXIF/XMP, or generator infotext.
- The positive prompt extracted from that metadata.
- The active page domain, used only to show the CivitAI availability status in the popup.
- Your allowed-domain setting, if you configure one.

The extension does not intentionally collect names, email addresses, passwords, browsing history, page content, or account credentials.

## 3. Local Storage

The latest prompt result and the configured allowed-domain list are stored using the browser extension's local storage API. This data remains on the local browser profile and is not sent to Digital Ego One.

Each new image extraction replaces the previous prompt session. The stored prompt session is cleared when the extension starts with the browser and when a new context-menu extraction begins.

## 4. Network Requests

The extension normally reads metadata from the image selected by the user. If the selected image is a recognizable CivitAI image URL and embedded metadata does not contain a positive prompt, the extension may request the corresponding image metadata from the CivitAI API at `https://civitai.com/api/v1/images/{id}`.

This fallback is used to recover metadata that CivitAI exposes for an image when a CDN preview has lost its embedded metadata. The extension does not send prompt data to Digital Ego One or to an analytics service.

## 5. Clipboard Access

The extension writes the extracted positive prompt to the clipboard only after the user selects the context-menu action or presses a copy button in the popup. It does not read unrelated clipboard content.

## 6. Permissions

- `contextMenus`: creates the **Copy Prompt If Any** image context-menu action.
- `scripting`: copies the selected positive prompt into the page clipboard after the user action.
- `clipboardWrite`: supports copying the prompt from the popup.
- `storage`: stores the latest local prompt session and allowed-domain setting.
- CivitAI host access: supports CivitAI metadata fallback requests and CivitAI image handling.

## 7. Data Retention and Deletion

The latest local result is replaced by the next extraction and is cleared when a new browser session starts. You can remove all locally stored extension data by removing the extension from the browser or clearing its site/extension storage in browser settings.

## 8. Children

The extension is not directed at children under 13 and does not knowingly collect personal information from children.

## 9. Changes to This Policy

If the extension's data practices change, this document will be updated in the public GitHub repository with a new effective date and release reference.

## 10. Contact

For privacy questions or requests, contact Digital Ego One:

- **Email:** [hello@digitalego.one](mailto:hello@digitalego.one)
- **Website:** [digitalego.one](https://digitalego.one/)
- **Project repository:** [github.com/digitalego-one/ExcaliburAI-Civitai-Prompt-Extractor](https://github.com/digitalego-one/ExcaliburAI-Civitai-Prompt-Extractor)

This document describes the extension's current technical behavior. It is not legal advice.
