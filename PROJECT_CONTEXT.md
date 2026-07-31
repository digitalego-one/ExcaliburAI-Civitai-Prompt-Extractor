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

Stable extraction baseline is tagged locally as `v1.3.0-stable`.

Popup design version `1.4.0` is based on `design/prompt-extractor-modern.html`; it keeps the existing extraction pipeline and displays `CivitAI` in the header source badge.

Popup version `1.5.0` uses the extension icon as the brand mark, credits `Digital Ego One`, and stores the active page domain to drive the CivitAI/Unavailable status badge.

Popup version `1.6.0` keeps `v1.5.0` available as a rollback point, removes the logo tile, enlarges the icon, and uses a light blue palette.

Popup version `1.7.0` uses a white application background, removes the bottom copy/status row, and keeps copy controls text-only.

Popup version `1.8.0` preserves negative prompts and technical metadata in partial results, including ComfyUI workflow sampler fields; rollback backup is `v1.7.0-stable`.

Parser version `1.9.0` resolves ComfyUI UI workflows under `workflow.nodes`, follows reroute links, and prioritizes complete workflow metadata over incomplete prompt maps.

Parser version `1.10.0` also reads negative CLIP text from semantic node titles when a ComfyUI graph has no usable negative sampler link; the fixture corpus audit result is 88 positive results, 19 with negative prompt, and 11 with technical metadata.

ComfyUI workflow links are resolved before direct text-node fallback so both positive and negative CLIP text nodes remain available to the popup.

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
3. Add Forge stealth metadata support.
4. Add a carefully scoped Civitai page/API fallback with explicit privacy behavior.
5. Test Chrome and Firefox packaging separately before release.

## Recent bug fixes

- ComfyUI workflows now resolve `KSampler.inputs.positive` and `.negative` node references to text-bearing nodes instead of returning the complete workflow JSON.
- EXIF strings are checked for UTF-16 byte patterns before being exposed to the infotext parser.
- Civitai CDN image URLs can fall back to `/api/v1/images/{uuid}` when the downloaded thumbnail has no readable metadata.
- WebP previews may store metadata in RIFF `EXIF` and `XMP ` chunks; both are checked before the Civitai API fallback.
- Positive prompt output is deliberately strict: XML, JSON/workflow, and known technical sections are never copied as the positive prompt.
- WebP EXIF UserComment may contain extra NUL bytes after `UNICODE`; the decoder skips that padding before UTF-16LE decoding.
- JPEG prompt text is first decoded from raw APP1 bytes, bypassing `exif.js` string conversion that can produce CJK mojibake.
- ComfyUI exports may be API prompt maps, UI `nodes[]`, or JSON with `NaN`; all are normalized before infotext parsing.
- ComfyUI node references such as `['34', 0]` are links, never prompt text; recursive fallback is limited to prompt/parameter/info-shaped fields.
- Krea/Swarm WebP metadata may wrap the prompt under `sui_image_params`; that nested `params` object is supported.

## Git rules

- Work in feature branches prefixed `codex/`.
- Make small, descriptive commits.
- Update `CHANGELOG.md` and this file with every meaningful change.
- Never push without explicit user confirmation.
- Never force-push or rewrite `origin/v1.2`.
