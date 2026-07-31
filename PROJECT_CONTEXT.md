# Project Context

## Product

Chrome/Firefox browser extension that extracts generation metadata from AI images, copies the positive prompt to the clipboard from the image context menu, and exposes negative prompt and technical metadata in the popup.

## Canonical local project

The only Git checkout is this directory:

`/Users/vadimsokolovsky/Documents/Civitai Prompt Extractor/extension`

Remote:

`https://github.com/digitalego-one/ExcaliburAI-Civitai-Prompt-Extractor.git`

Baseline: `origin/v1.2`

Current branch: `codex/metadata-extractor`

## Workspace folders

- `extension/`: canonical extension source and Git history.
- `fixtures/images/`: mixed PNG, JPEG/JPG, WebP, and other sample files for metadata testing.
- `research/`: audit notes and format research.
- `archive/source-history/`: preserved historical source versions; do not edit as the primary implementation.

## Current implementation

- `background.js`: context-menu extraction, storage, clipboard copy, popup opening attempt.
- `metadata.js`: dependency-free container and infotext extraction helpers.
- `popup.js` / `popup.html`: normalized result display and toast-based copy feedback.
- `exif.js`: legacy EXIF reader retained as a dependency for JPEG metadata.
- `manifest.json`: Manifest V3 configuration.

## Normalized result

The extractor stores `positivePrompt`, `negativePrompt`, `metadataText`, `rawText`, `source`, `confidence`, and `status` in `chrome.storage.local`. The context-menu action copies only `positivePrompt`.

## Next engineering priorities

1. Add a local fixture runner with expected positive/negative boundaries.
2. Parse ComfyUI workflow JSON using node types and input provenance rather than a generic regex.
3. Add Forge stealth metadata support.
4. Add a carefully scoped Civitai page/API fallback with explicit privacy behavior.
5. Test Chrome and Firefox packaging separately before release.

## Git rules

- Work in feature branches prefixed `codex/`.
- Make small, descriptive commits.
- Update `CHANGELOG.md` and this file with every meaningful change.
- Never push without explicit user confirmation.
- Never force-push or rewrite `origin/v1.2`.
