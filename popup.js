document.addEventListener('DOMContentLoaded', async () => {
  const result = await getStoredResult();
  render('prompt', result.positivePrompt, 'Positive prompt not found.');
  render('negativePrompt', result.negativePrompt, 'Negative prompt not found.');
  render('otherMetadata', result.metadataText, 'Technical metadata not found.');
  document.getElementById('source').textContent = result.source ? `Source: ${result.source}` : 'No image processed yet';

  for (const [buttonId, fieldId, emptyText] of [
    ['copyPromptButton', 'prompt', 'Positive prompt not found.'],
    ['copyNegativePromptButton', 'negativePrompt', 'Negative prompt not found.'],
    ['copyMetadataButton', 'otherMetadata', 'Technical metadata not found.']
  ]) {
    document.getElementById(buttonId).addEventListener('click', async () => {
      const text = document.getElementById(fieldId).textContent;
      if (!text || text === emptyText) return showToast('Nothing to copy');
      try { await navigator.clipboard.writeText(text); showToast('Copied'); }
      catch (_) { showToast('Copy failed'); }
    });
  }
});

function getStoredResult() {
  return new Promise(resolve => chrome.storage.local.get(['lastResult', 'lastCopiedPrompt'], data => resolve(data.lastResult || {
    positivePrompt: data.lastCopiedPrompt || '', negativePrompt: '', metadataText: '', source: ''
  })));
}

function render(id, value, fallback) { document.getElementById(id).textContent = value || fallback; }

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('visible'), 1800);
}
