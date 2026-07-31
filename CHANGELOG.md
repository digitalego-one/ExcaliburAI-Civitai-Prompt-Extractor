# Changelog

## 1.13.0 - 2026-07-31

- Recorded as unresolved: negative prompt and technical metadata extraction/display are not reliable and were removed from the popup design.
- Restored a positive-only popup; the character count now appears in the prompt footer.
- Added session reset on browser startup and every context-menu extraction, plus popup refresh when a new result is stored.
- Fixed positive prompt extraction from JPEG EXIF ComfyUI JSON with trailing binary payloads.
- Confirmed batch 4 PNG `675a...` has no metadata chunks and cannot yield a prompt from the local file alone.

## 1.11.0 - 2026-07-31

- Rendered negative prompt and technical metadata as full popup fields with scrolling and copy actions.
- Normalized alternate stored result keys so metadata is not lost at the popup boundary.
- Connected the popup Options button to the options page.
- Removed the Enable notifications setting and redesigned the remaining domain setting.

## 1.10.0 - 2026-07-31

- Audited 163 fixture files across PNG, JPEG, WebP, preview, and errored batches.
- Added title-based negative-node fallback for ComfyUI nodes labeled `Negative prompt`, `negative_prompt`, `负面`, or `负向` when no sampler link is present.
- Corpus verification now returns 19 negative prompts and 11 technical metadata blocks from 88 positive-prompt results; files without a positive prompt remain excluded.

## 1.9.0 - 2026-07-31

- Inspected PNG ComfyUI `prompt` and `workflow` metadata across the fixture corpus.
- Resolved UI workflow nodes stored under `workflow.nodes` and followed reroute links to negative CLIP text nodes.
- Prefer the complete workflow over incomplete prompt maps so a negative-only prompt node is not misclassified as positive.

## 1.8.0 - 2026-07-31

- Preserved `v1.7.0` as `v1.7.0-stable` before changing extraction behavior.
- Preserved negative prompts and technical metadata when a positive prompt is incomplete or absent.
- Added technical metadata extraction for ComfyUI workflow sampler and model fields.
- Improved infotext technical-section detection when fields follow a comma instead of a newline.
- Fixed ComfyUI workflow parsing so linked negative prompt nodes are not bypassed by direct text-node fallback.

## 1.7.0 - 2026-07-31

- Restored a white application background.
- Removed `Copy all`, `Ready to extract`, and the bottom divider.
- Removed ambiguous square glyphs from copy controls.

## 1.6.0 - 2026-07-31

- Preserved the previous design as local rollback tag `v1.5.0`.
- Removed the green logo tile and enlarged the extension icon by approximately 20%.
- Applied a light blue visual palette to the popup and design prototype.

## 1.5.0 - 2026-07-31

- Replaced the text brand mark with the extension icon.
- Changed the subtitle to `Made by Digital Ego One`.
- Added a site availability badge: CivitAI domains are green; other sites show yellow `Unavailable`.

## 1.4.0 - 2026-07-31

- Applied the new popup design from `design/prompt-extractor-modern.html`.
- Replaced the source badge label `infote` with `CivitAI`.
- Preserved prompt, negative prompt, metadata, copy, and toast behavior while adapting it to the redesigned layout.

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
- Added WebP RIFF `EXIF` chunk support and XMP text extraction for Civitai preview files.
- Prevented XML, JSON, and technical metadata strings from being returned as positive prompt.
- Avoided treating generic XMP creator/history values such as `ai` as a prompt.
- Added robust WebP EXIF `UNICODE` marker handling, including extra NUL padding found in Civitai previews.
- Added direct JPEG APP1/UserComment byte decoding to avoid mojibake introduced by legacy EXIF parsing.
- Added JSON metadata parsing for ComfyUI/API workflows, `negativeprompt`, nested parameter objects, `saved_prompt`, and `resolved_prompt`.
- Added tolerant parsing for ComfyUI JSON containing non-standard `NaN` values.
- Fixed ComfyUI node-link values such as `34,0` and `13,0` being mistaken for prompt text.
- Added direct extraction of text-bearing ComfyUI nodes when sampler links are absent or custom.
- Ignored workflow-only PNGs that contain no prompt instead of returning `is_changed` hashes.
- Added nested `sui_image_params.prompt` extraction for Krea/Swarm WebP EXIF JSON.

## Working agreement

- Keep the Git remote only in `extension/`.
- Do not push or modify `origin/v1.2` directly.
- Record every code or structure change in this file.
- Update `PROJECT_CONTEXT.md` when architecture, workflow, or current status changes.
