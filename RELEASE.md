# Release v1.14.0

## Release Summary

This is the stable Chrome/Firefox release after the popup redesign. It focuses on reliable positive-prompt extraction, one-click clipboard copy, clean session replacement, and a compact positive-only interface.

## Added

- Logo-inspired blue action buttons.
- Positive-only popup with character count in the footer.
- New-session behavior for every context-menu extraction.
- Empty popup state after browser startup.
- Popup refresh when a newly processed image replaces the stored result.
- Firefox manifest identity and minimum Firefox version metadata.
- Redesigned Options page with allowed-domain configuration.

## Changed

- Updated popup from the historic green interface to the current white/blue design.
- Replaced the old source label with CivitAI availability status.
- Updated branding to use the extension icon and `Made by Digital Ego One`.
- Reworked positive prompt parsing for PNG ComfyUI workflows, JPEG EXIF JSON, WebP EXIF/XMP, and CivitAI preview variants.

## Removed

- Negative Prompt and Technical Metadata popup sections.
- Enable notifications option.
- Copy all action and stale popup status row.
- Ambiguous copy glyphs that rendered as square characters.

## Known Limitations / Backlog

- Negative prompt and technical metadata are not considered release-ready. They remain documented backlog items because formats differ substantially and current extraction is not reliable enough.
- Metadata-stripped or recompressed images cannot be recovered from pixels alone.
- CivitAI API fallback depends on a recognizable CivitAI image URL and available metadata.
- Store reviewer testing should cover both direct full-size images and CivitAI preview images.

## File Coverage

Readable when metadata is embedded: PNG text chunks, ComfyUI PNG workflows, JPEG EXIF/UserComment, WebP EXIF/XMP, and A1111/Forge infotext. Not readable locally: images with removed metadata, flattened screenshots, and image variants where the CDN has stripped metadata. Preview versus full-size is not itself the deciding factor.

## Validation

```bash
node --check background.js
node --check metadata.js
node --check popup.js
node --check options.js
node -e "JSON.parse(require('fs').readFileSync('manifest.json'))"
```

## Chrome Web Store Checklist

1. Zip the extension contents with `manifest.json` at the archive root.
2. Upload the ZIP in the Chrome Developer Dashboard.
3. Confirm store name, description, icon, screenshots, privacy practices, and support URL.
4. Explain context-menu image access and CivitAI API fallback in the privacy fields.
5. Submit for review.

## Firefox Add-ons Checklist

1. Upload the same ZIP/XPI in the Firefox Add-ons Developer Hub.
2. Complete the validator and address warnings.
3. Provide reviewer notes explaining context-menu extraction and the readable source.
4. Confirm data collection declarations and requested permissions.
5. Submit for review and signing.
