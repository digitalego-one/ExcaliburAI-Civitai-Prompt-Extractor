# Changelog

## 2026-07-31

- Created `extension/` as the canonical Git checkout from GitHub branch `v1.2`.
- Created working branch `codex/metadata-extractor`.
- Preserved historical local material in `../archive/source-history/`.
- Preserved metadata corpus in `../fixtures/images/`.
- Added `metadata.js` with PNG text, WebP XMP, JPEG EXIF, and infotext extraction.
- Updated the context-menu flow to copy only the positive prompt.
- Updated popup copy actions to use an auto-dismiss toast instead of alerts.
- Corrected Chrome manifest JSON and added Civitai subdomain permissions.
- Fixed ComfyUI workflow extraction to follow KSampler positive/negative links to `CLIPTextEncode` nodes.
- Added UTF-16 EXIF string handling to prevent mojibake in JPEG prompts.
- Added a Civitai image API fallback for thumbnails without embedded metadata.

## Working agreement

- Keep the Git remote only in `extension/`.
- Do not push or modify `origin/v1.2` directly.
- Record every code or structure change in this file.
- Update `PROJECT_CONTEXT.md` when architecture, workflow, or current status changes.
