# ExcaliburAI - Civitai Prompt Extractor

![ExcaliburAI logo](./icons/icon128.png)

Release `v1.14.0` is a positive-prompt-first browser extension for Chrome and Firefox. Right-click an image, choose **Copy prompt if any**, and the extracted positive prompt is copied to the clipboard and shown in the popup.

## What It Does

- Extracts positive prompts from metadata embedded in AI-generated images.
- Copies the positive prompt with one context-menu action.
- Shows the current prompt in a compact, logo-inspired popup.
- Replaces stale popup results when a new image is processed.
- Starts with an empty popup after the browser starts.
- Supports a light options page for allowed image domains.
- Uses a CivitAI API fallback for eligible CivitAI image URLs when embedded metadata is unavailable.

## Supported Metadata

The parser is dependency-light and currently understands these sources when the metadata is actually present in the downloaded image:

- PNG `tEXt`, `iTXt`, and `zTXt` prompt/workflow chunks.
- ComfyUI API prompt maps and UI workflows, including `workflow.nodes`, CLIP text nodes, sampler links, and reroute links.
- JPEG APP1/EXIF `UserComment`, including UTF-16 `UNICODE` payloads and CivitAI/ComfyUI JSON.
- WebP EXIF and XMP metadata, including CivitAI preview variants and nested Krea/Swarm prompt parameters.
- A1111/Forge-style infotext when positive prompt boundaries are explicit.

The extension does not invent metadata. Images that have been recompressed, stripped of EXIF/XMP/PNG text chunks, or contain only pixels cannot yield a prompt locally. Preview and full-size images can both work; the deciding factor is whether the downloaded variant still contains readable metadata.

## Current Scope and Backlog

The popup intentionally shows only the positive prompt in this release. Negative prompt and technical metadata extraction/display were investigated across the fixture corpus but remain unreliable across the observed generator formats, so those sections were removed rather than presenting misleading output.

Backlog:

- Build a dedicated, format-by-format negative/technical metadata model with golden fixtures.
- Add broader provider-specific support for Krea, Forge, CivitAI transformations, and custom ComfyUI nodes.
- Add automated browser tests for Chrome and Firefox context-menu sessions.
- Improve privacy and permission scoping for non-CivitAI image hosts.

## Install From Source

### Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this `extension` directory.

### Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on**.
3. Select `manifest.json` from this directory.

## Usage

1. Open an AI-generated image.
2. Right-click the image.
3. Choose **Copy prompt if any**.
4. Paste the prompt wherever you need it, or open the extension popup to review it.

Each new context-menu extraction starts a new session. Reload the extension after installing a new local build.

## Packaging

The release package must contain the files inside this directory, with `manifest.json` at the ZIP root. Do not package the parent directory or `.git` folder.

```bash
cd extension
zip -r ../release/excaliburai-civitai-prompt-extractor-v1.14.0.zip . \
  -x '.git/*' '.DS_Store' 'screenshots/*'
```

Firefox can upload the same ZIP as an XPI-compatible package. See [RELEASE.md](./RELEASE.md) for the store submission checklist and reviewer notes.

## Development Notes

The canonical Git checkout is this directory. `metadata.js` is intentionally readable and has no build step. The fixture corpus used during parser work is kept outside the release package in the workspace `fixtures/` directory.

Run the lightweight checks from this directory:

```bash
node --check background.js
node --check metadata.js
node --check popup.js
node --check options.js
node -e "JSON.parse(require('fs').readFileSync('manifest.json'))"
```

## Links

- [GitHub repository](https://github.com/digitalego-one/ExcaliburAI-Civitai-Prompt-Extractor)
- [Chrome Web Store listing](https://chromewebstore.google.com/detail/excaliburai-civitai-promp/jdkgelpgnofafbgbbmlgngehmlkllaah)
- [Issues](https://github.com/digitalego-one/ExcaliburAI-Civitai-Prompt-Extractor/issues)
- [Digital Ego One](https://digitalego.one)

## License

See [LICENSE.txt](./LICENSE.txt).
