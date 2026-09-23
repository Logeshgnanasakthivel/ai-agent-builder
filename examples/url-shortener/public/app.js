// integration-guardian: this is the only place that knows the wire format.
// If the backend contract changes, this function is what absorbs it.
async function shortenUrl(url) {
  const res = await fetch('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong.');
  }
  return data;
}

const form = document.getElementById('shorten-form');
const input = document.getElementById('url-input');
const result = document.getElementById('result');
const resultLink = document.getElementById('result-link');
const copyBtn = document.getElementById('copy-btn');
const errorEl = document.getElementById('error');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorEl.classList.add('hidden');
  result.classList.add('hidden');

  try {
    const { shortUrl } = await shortenUrl(input.value.trim());
    resultLink.href = shortUrl;
    resultLink.textContent = shortUrl;
    result.classList.remove('hidden');
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
});

copyBtn.addEventListener('click', async () => {
  await navigator.clipboard.writeText(resultLink.href);
  copyBtn.textContent = 'Copied!';
  setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
});
