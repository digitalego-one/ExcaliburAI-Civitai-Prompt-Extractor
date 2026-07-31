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
    if (type === 'EXIF') {
      const exifBytes = bytes.slice(start, start + length);
      result.EXIF = readTiffText(exifBytes);
      const utf8 = decodeBytes(exifBytes, 'utf-8');
      const utf16 = decodeBytes(exifBytes, 'utf-16le');
      const unicodeMarker = exifBytes.indexOf(85); // Fast path for the standard EXIF UserComment prefix.
      const marker = unicodeMarker >= 0 && decodeBytes(exifBytes.slice(unicodeMarker, unicodeMarker + 7), 'ascii') === 'UNICODE' ? unicodeMarker : -1;
      if (marker >= 0) {
        let dataStart = marker + 7;
        while (dataStart < exifBytes.length && exifBytes[dataStart] === 0) dataStart++;
        result.EXIF_TEXT = decodeBytes(exifBytes.slice(dataStart), 'utf-16le').replace(/\0+$/, '');
      } else {
        result.EXIF_TEXT = /\b(?:prompt|negative prompt|steps|seed|sampler)\b/i.test(utf8) ? utf8 : '';
      }
    }
    offset = start + length + (length % 2);
  }
  return result;
}

function readTiffText(bytes) {
  let start = 0;
  if (decodeBytes(bytes.slice(0, 6), 'ascii') === 'Exif\0\0') start = 6;
  if (bytes.length < start + 8) return {};
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const little = decodeBytes(bytes.slice(start, start + 2), 'ascii') === 'II';
  const u16 = p => view.getUint16(start + p, !little);
  const u32 = p => view.getUint32(start + p, !little);
  if (u16(2) !== 42) return {};
  const values = {};
  const readIfd = (offset, depth) => {
    if (depth > 2 || offset + 2 > bytes.length) return;
    const count = u16(offset);
    for (let i = 0; i < count; i++) {
      const entry = offset + 2 + i * 12;
      if (entry + 12 > bytes.length) continue;
      const tag = u16(entry), type = u16(entry + 2), countValue = u32(entry + 4);
      const size = type === 1 || type === 2 || type === 7 ? 1 : type === 3 ? 2 : type === 4 ? 4 : 0;
      const total = size * countValue; const valueOffset = total > 4 ? u32(entry + 8) : entry + 8;
      if (!size || valueOffset + total > bytes.length) continue;
      if (tag === 0x8769 && type === 4) readIfd(u32(entry + 8), depth + 1);
      if (tag !== 0x9286 && tag !== 0x010e && tag !== 0x9c9c) continue;
      const raw = bytes.slice(start + valueOffset, start + valueOffset + total);
      values[tag === 0x9286 ? 'UserComment' : tag === 0x9c9c ? 'XPComment' : 'ImageDescription'] = raw;
    }
  };
  readIfd(u32(4), 0);
  // Some WebP writers omit a reliable IFD chain. Recover the text tags by scanning
  // aligned TIFF entries as a safe fallback before declaring the chunk empty.
  if (!Object.keys(values).length) {
    for (let entry = 0; entry + 12 <= bytes.length; entry += 2) {
      const tag = u16(entry);
      if (tag !== 0x9286 && tag !== 0x010e && tag !== 0x9c9c) continue;
      const type = u16(entry + 2), countValue = u32(entry + 4);
      const size = type === 1 || type === 2 || type === 7 ? 1 : type === 3 ? 2 : type === 4 ? 4 : 0;
      const total = size * countValue, valueOffset = total > 4 ? u32(entry + 8) : entry + 8;
      if (!size || valueOffset + total > bytes.length) continue;
      values[tag === 0x9286 ? 'UserComment' : tag === 0x9c9c ? 'XPComment' : 'ImageDescription'] = bytes.slice(start + valueOffset, start + valueOffset + total);
    }
  }
  return values;
}

function parseInfotext(raw) {
  const text = cleanPositiveSource(String(raw || '').replace(/^UNICODE\s*/i, '').trim());
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
  if (typeof raw === 'string') {
    const text = raw.trim();
    if (/^[{[]/.test(text)) {
      try {
        const jsonText = text.replace(/\b(?:NaN|Infinity|-Infinity)\b/g, 'null');
        return normalizeMetadata(JSON.parse(jsonText), source);
      } catch (_) { /* Continue as infotext. */ }
    }
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    for (const key of ['prompt', 'parameters', 'workflow']) {
      if (typeof raw[key] !== 'string' || !/^[{[]/.test(raw[key].trim())) continue;
      const nestedJson = normalizeMetadata(raw[key], source);
      if (nestedJson && nestedJson.positivePrompt) return nestedJson;
    }
    if (raw.workflow) {
      const workflowResult = parseComfyWorkflow(raw.workflow);
      if (workflowResult && workflowResult.positivePrompt) return workflowResult;
    }
    const prompt = raw.positivePrompt || raw.prompt || raw.saved_prompt || raw.resolved_prompt || raw.source_prompt || raw.prompt_log_line;
    const negative = raw.negativePrompt || raw.negativeprompt || raw.negative_prompt;
    if (prompt || negative) return {
      positivePrompt: cleanPositiveSource(String(prompt || '').trim()),
      negativePrompt: cleanPositiveSource(String(negative || '').trim()), rawText: JSON.stringify(raw, null, 2),
      metadataText: Object.entries(raw).filter(([k]) => !/prompt/i.test(k)).map(([k, v]) => `${k}: ${v}`).join('\n'),
      source, confidence: 'high'
    };
    const directTextNode = Object.values(raw).find(node => node && node.inputs && typeof node.inputs.text === 'string');
    if (directTextNode) return {
      positivePrompt: cleanPositiveSource(directTextNode.inputs.text), negativePrompt: '',
      rawText: JSON.stringify(raw, null, 2), metadataText: '', source: 'comfy-workflow', confidence: 'medium'
    };
    const workflowResult = parseComfyWorkflow(raw);
    if (workflowResult && workflowResult.positivePrompt) return workflowResult;
    for (const [key, value] of Object.entries(raw)) {
      if (value && typeof value === 'object' && /prompt|parameter|params|meta|info/i.test(key) && !/workflow/i.test(key)) {
        const nested = normalizeMetadata(value, source);
        if (nested && nested.positivePrompt) return nested;
      }
    }
  }
  return parseInfotext(raw);
}

function extractMetadata(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const png = readPngText(arrayBuffer);
  if (Object.keys(png).length) {
    for (const key of ['parameters', 'prompt', 'workflow']) {
      if (!png[key]) continue;
      const result = normalizeMetadata(png[key], key === 'parameters' ? 'png-text' : 'comfy-workflow');
      if (result && result.positivePrompt) return result;
    }
  }
  if (decodeBytes(bytes.slice(0, 4), 'ascii') === 'RIFF') {
    const webp = readWebpMetadata(arrayBuffer); const result = normalizeMetadata(parseXmpText(webp.XMP), 'webp-xmp');
    if (result && result.positivePrompt) return result;
  }
  const rawJpegComment = readJpegRawComment(bytes);
  if (rawJpegComment) {
    const result = normalizeMetadata(rawJpegComment, 'jpeg-exif');
    if (result && result.positivePrompt) return result;
  }
  const exif = typeof EXIF !== 'undefined' ? EXIF.readFromBinaryFile(arrayBuffer) : {};
  const webp = decodeBytes(bytes.slice(0, 4), 'ascii') === 'RIFF' ? readWebpMetadata(arrayBuffer) : {};
  const comment = exif.UserComment || exif.userComment || exif.XPComment || exif.ImageDescription || webp.EXIF && (webp.EXIF.UserComment || webp.EXIF.XPComment || webp.EXIF.ImageDescription) || webp.EXIF_TEXT;
  return normalizeMetadata(decodeExifComment(comment), decodeBytes(bytes.slice(0, 4), 'ascii') === 'RIFF' ? 'webp-exif' : 'jpeg-exif');
}

function readJpegRawComment(bytes) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return '';
  let offset = 2;
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) { offset++; continue; }
    const marker = bytes[offset + 1];
    if (marker === 0xda || marker === 0xd9) break;
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    const end = offset + 2 + length;
    if (end > bytes.length) break;
    if (marker === 0xe1) {
      const segment = bytes.slice(offset + 4, end);
      const text = decodeExifPayloadText(segment);
      if (text) return text;
    }
    offset = end;
  }
  return '';
}

function decodeExifPayloadText(bytes) {
  for (let i = 0; i + 7 < bytes.length; i++) {
    const marker = decodeBytes(bytes.slice(i, i + 7), 'ascii');
    if (marker !== 'UNICODE' && marker !== 'ASCII\0') continue;
    let dataStart = i + 7;
    while (dataStart < bytes.length && bytes[dataStart] === 0) dataStart++;
    const encoding = marker === 'UNICODE' ? 'utf-16le' : 'ascii';
    const text = decodeBytes(bytes.slice(dataStart), encoding).replace(/\0+$/, '').trim();
    if (text && /(?:prompt|negative prompt|steps|seed|sampler|score[_-]\d)/i.test(text)) return text;
  }
  return '';
}

function decodeExifComment(value) {
  if (!value) return '';
  if (typeof value === 'string') {
    const cleaned = value.replace(/^ASCII\0*/, '').replace(/^UNICODE\0*/i, '');
    return decodeUtf16String(cleaned).trim();
  }
  const bytes = new Uint8Array(value); const prefix = decodeBytes(bytes.slice(0, 8), 'ascii');
  if (/^UNICODE/i.test(prefix)) return decodeBytes(bytes.slice(8), 'utf-16le').replace(/\0+$/, '').trim();
  return decodeBytes(bytes.slice(/^ASCII/.test(prefix) ? 8 : 0), /^ASCII/.test(prefix) ? 'ascii' : 'utf-8').replace(/\0+$/, '').trim();
}

function decodeUtf16String(value) {
  if (!value) return '';
  const hasAlternatingNulls = /(?:\0.|.\0){2,}/.test(value);
  if (hasAlternatingNulls) {
    const bytes = new Uint8Array(value.length * 2);
    for (let i = 0; i < value.length; i++) { bytes[i * 2] = value.charCodeAt(i) & 255; bytes[i * 2 + 1] = value.charCodeAt(i) >> 8; }
    return decodeBytes(bytes, 'utf-16le').replace(/\0+$/, '');
  }
  return value.replace(/\0+/g, '');
}

function parseComfyWorkflow(workflow) {
  const rawText = typeof workflow === 'string' ? workflow : JSON.stringify(workflow);
  let graph;
  try { graph = typeof workflow === 'string' ? JSON.parse(workflow) : workflow; } catch (_) { return { positivePrompt: '', negativePrompt: '', rawText, metadataText: '', source: 'comfy-workflow', confidence: 'low' }; }
  const nodes = Array.isArray(graph) ? Object.fromEntries(graph.map(node => [String(node.id), node])) : (graph && typeof graph === 'object' ? graph : {});
  const textNodes = {};
  const promptCandidates = [];
  const promptRefs = [];
  for (const [id, node] of Object.entries(nodes)) {
    if (!node) continue;
    const inputs = node.inputs || {};
    const text = inputs.text || (Array.isArray(node.widgets_values) && /(?:CLIPTextEncode|text|prompt)/i.test(`${node.type || ''} ${node.properties?.['Node name for S&R'] || ''}`) ? node.widgets_values[0] : '');
    if (typeof text === 'string') textNodes[id] = text.trim();
    for (const key of ['saved_prompt', 'resolved_prompt', 'source_prompt', 'prompt_log_line']) if (typeof inputs[key] === 'string') promptCandidates.push(inputs[key]);
    if (inputs.positive && Array.isArray(inputs.positive)) promptRefs.push({ type: 'positive', ref: inputs.positive[0] });
    if (inputs.negative && Array.isArray(inputs.negative)) promptRefs.push({ type: 'negative', ref: inputs.negative[0] });
  }
  const positives = promptRefs.filter(x => x.type === 'positive').map(x => textNodes[x.ref]).filter(Boolean);
  const negatives = promptRefs.filter(x => x.type === 'negative').map(x => textNodes[x.ref]).filter(Boolean);
  const allTexts = Object.values(textNodes);
  return {
    positivePrompt: cleanPositiveSource(positives[0] || promptCandidates[0] || allTexts[0] || ''),
    negativePrompt: negatives[0] || '', rawText, metadataText: '', source: 'comfy-workflow',
    confidence: positives.length ? 'high' : (allTexts.length ? 'medium' : 'low')
  };
}

function cleanPositiveSource(value) {
  let text = String(value || '').replace(/^\s*(?:positive\s*)?prompt\s*:\s*/i, '').trim();
  if (!text || /^[{[]/.test(text) || /^<\?xml|^<x:xmpmeta|^<rdf:RDF/i.test(text)) return '';
  const boundary = text.search(/(?:\n|\r|,)\s*(?:negative prompt|steps|sampler|scheduler|cfg(?: scale)?|seed|size|model(?: hash)?|enable|no seed)\s*:/i);
  if (boundary >= 0) text = text.slice(0, boundary);
  return text.replace(/\s+$/g, '').trim();
}

function parseXmpText(xmp) {
  if (!xmp) return '';
  const matches = [...String(xmp).matchAll(/<(?:dc:description|xmp:Description|exif:UserComment)[^>]*>([\s\S]*?)<\//gi)]
    .map(match => match[1].replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim())
    .filter(Boolean);
  return matches.join('\n');
}
