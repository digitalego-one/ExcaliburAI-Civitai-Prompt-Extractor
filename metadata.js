/* Metadata extraction helpers. Kept dependency-free so they can run in a MV3 worker. */

function decodeBytes(bytes, encoding) {
  try { return new TextDecoder(encoding).decode(bytes); } catch (_) { return new TextDecoder().decode(bytes); }
}

function readPngText(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const view = new DataView(arrayBuffer);
  const chunks = {};
  if (bytes.length < 24 || decodeBytes(bytes.slice(1, 4), 'ascii') !== 'PNG') return chunks;
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset);
    const type = decodeBytes(bytes.slice(offset + 4, offset + 8), 'ascii');
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > bytes.length) break;
    const data = bytes.slice(dataStart, dataEnd);
    if (type === 'tEXt') {
      const split = data.indexOf(0);
      if (split > 0) chunks[decodeBytes(data.slice(0, split), 'latin1')] = decodeBytes(data.slice(split + 1), 'latin1');
    } else if (type === 'zTXt') {
      const split = data.indexOf(0);
      if (split > 0) chunks[decodeBytes(data.slice(0, split), 'latin1')] = '[compressed PNG text]';
    } else if (type === 'iTXt') {
      let p = 0; const keyEnd = data.indexOf(0, p); if (keyEnd < 0) break;
      const key = decodeBytes(data.slice(p, keyEnd), 'utf-8'); p = keyEnd + 1;
      const compressionFlag = data[p++]; p++; const langEnd = data.indexOf(0, p); if (langEnd < 0) break; p = langEnd + 1;
      const translatedEnd = data.indexOf(0, p); if (translatedEnd < 0) break; p = translatedEnd + 1;
      chunks[key] = compressionFlag ? '[compressed PNG text]' : decodeBytes(data.slice(p), 'utf-8');
    }
    offset = dataEnd + 4;
    if (type === 'IEND') break;
  }
  return chunks;
}

function readWebpMetadata(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer), view = new DataView(arrayBuffer), result = {};
  if (decodeBytes(bytes.slice(0, 4), 'ascii') !== 'RIFF' || decodeBytes(bytes.slice(8, 12), 'ascii') !== 'WEBP') return result;
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const type = decodeBytes(bytes.slice(offset, offset + 4), 'ascii');
    const length = view.getUint32(offset + 4, true); const start = offset + 8;
    if (start + length > bytes.length) break;
    if (type === 'XMP ') result.XMP = decodeBytes(bytes.slice(start, start + length), 'utf-8');
    offset = start + length + (length % 2);
  }
  return result;
}

function parseInfotext(raw) {
  const text = String(raw || '').replace(/^UNICODE\s*/i, '').trim();
  if (!text) return null;
  const negativeMatch = text.match(/(?:^|\n)\s*Negative prompt\s*:\s*/i);
  const metadataMatch = text.match(/(?:^|\n)\s*(?:Steps|Seed|Sampler|Size|Model hash)\s*:/i);
  const positiveEnd = negativeMatch ? negativeMatch.index : (metadataMatch ? metadataMatch.index : text.length);
  const negativeStart = negativeMatch ? negativeMatch.index + negativeMatch[0].length : -1;
  const negativeEnd = negativeStart >= 0 && metadataMatch ? metadataMatch.index : text.length;
  return {
    positivePrompt: text.slice(0, positiveEnd).trim(),
    negativePrompt: negativeStart >= 0 ? text.slice(negativeStart, negativeEnd).trim() : '',
    rawText: text,
    metadataText: metadataMatch ? text.slice(metadataMatch.index).trim() : '',
    source: 'infotext',
    confidence: negativeMatch || metadataMatch ? 'high' : 'medium'
  };
}

function normalizeMetadata(raw, source) {
  if (!raw) return null;
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    if (raw.prompt || raw.positivePrompt || raw.negativePrompt) return {
      positivePrompt: String(raw.positivePrompt || raw.prompt || '').trim(),
      negativePrompt: String(raw.negativePrompt || '').trim(), rawText: JSON.stringify(raw, null, 2),
      metadataText: Object.entries(raw).filter(([k]) => !/prompt/i.test(k)).map(([k, v]) => `${k}: ${v}`).join('\n'),
      source, confidence: 'high'
    };
    if (raw.workflow) {
      const workflow = typeof raw.workflow === 'string' ? raw.workflow : JSON.stringify(raw.workflow);
      const prompts = [...workflow.matchAll(/(?:text|prompt|positive|negative)["']?\s*[:=]\s*["']([^"']+)/gi)].map(m => m[1]);
      return { positivePrompt: prompts[0] || '', negativePrompt: prompts[1] || '', rawText: workflow, metadataText: '', source: 'comfy-workflow', confidence: prompts.length ? 'medium' : 'low' };
    }
  }
  return parseInfotext(raw);
}

function extractMetadata(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const png = readPngText(arrayBuffer);
  if (Object.keys(png).length) {
    const candidate = png.parameters || png.prompt || png.workflow;
    const result = normalizeMetadata(candidate ? (png.workflow ? { workflow: candidate, prompt: png.prompt } : candidate) : null, png.workflow ? 'comfy-workflow' : 'png-text');
    if (result && result.positivePrompt) return result;
  }
  if (decodeBytes(bytes.slice(0, 4), 'ascii') === 'RIFF') {
    const webp = readWebpMetadata(arrayBuffer); const result = normalizeMetadata(webp.XMP, 'webp-xmp');
    if (result && result.positivePrompt) return result;
  }
  const exif = typeof EXIF !== 'undefined' ? EXIF.readFromBinaryFile(arrayBuffer) : {};
  const comment = exif.UserComment || exif.userComment || exif.XPComment || exif.ImageDescription;
  return normalizeMetadata(decodeExifComment(comment), 'jpeg-exif');
}

function decodeExifComment(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.replace(/^ASCII\0*|^UNICODE/i, '').trim();
  const bytes = new Uint8Array(value); const prefix = decodeBytes(bytes.slice(0, 8), 'ascii');
  if (/^UNICODE/i.test(prefix)) return decodeBytes(bytes.slice(8), 'utf-16le').replace(/\0+$/, '').trim();
  return decodeBytes(bytes.slice(8), /^ASCII/.test(prefix) ? 'ascii' : 'utf-8').replace(/\0+$/, '').trim();
}
