document.addEventListener('DOMContentLoaded', async () => {
  const result = await getStoredResult();
  render('prompt', result.positivePrompt, 'Positive prompt not found.');
  updateCount();
  updateSource(result.sourceSite);

  for (const [buttonId, fieldId, emptyText] of [['copyPromptButton', 'prompt', 'Positive prompt not found.']]) {
    document.getElementById(buttonId).addEventListener('click', async () => {
      const text = document.getElementById(fieldId).textContent;
      if (!text || text === emptyText) return showToast('Nothing to copy');
      try { await navigator.clipboard.writeText(text); showToast('Copied'); }
      catch (_) { showToast('Copy failed'); }
    });
  }

  document.getElementById('copyPromptIcon').addEventListener('click', () => document.getElementById('copyPromptButton').click());
  document.getElementById('optionsButton').addEventListener('click', () => chrome.runtime.openOptionsPage());
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (changes.lastResult || changes.lastCopiedPrompt)) window.location.reload();
  });
});

function getStoredResult() {
  return new Promise(resolve => chrome.storage.local.get(['lastResult', 'lastCopiedPrompt'], data => {
    const raw = data.lastResult || {};
    resolve({
      positivePrompt: raw.positivePrompt || raw.prompt || data.lastCopiedPrompt || '',
      sourceSite: raw.sourceSite || ''
    });
  }));
}

function render(id, value, fallback) {
  const text = value && typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value || '');
  document.getElementById(id).textContent = text || fallback;
}

function updateCount() {
  const value = document.getElementById('prompt').textContent;
  document.getElementById('count').textContent = `${value === 'Positive prompt not found.' ? 0 : value.length.toLocaleString()} chars`;
}

function updateSource(sourceSite) {
  const source = document.getElementById('source');
  const label = document.getElementById('sourceLabel');
  const available = sourceSite === 'civitai.com' || sourceSite === 'civitai.red';
  source.classList.toggle('is-available', available);
  source.classList.toggle('is-unavailable', !available);
  label.textContent = available ? 'CivitAI' : 'Unavailable';
  source.title = available ? `Source site: ${sourceSite}` : 'CivitAI is unavailable on this site';
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('visible'), 1800);
}
