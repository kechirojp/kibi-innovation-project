(() => {
  const form = document.getElementById('proposal-form');
  const status = document.getElementById('form-status');
  const siteKey = document.getElementById('turnstile')?.dataset.sitekey;
  let widgetId = null;
  const setStatus = (message, error = false) => {
    status.textContent = message;
    status.classList.toggle('error', error);
  };
  if (!siteKey) {
    form.querySelector('button[type="submit"]').disabled = true;
    setStatus('投稿受付は公開準備中です。GitHubからの提案は先に受け付けています。');
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.async = true;
  script.onload = () => { widgetId = window.turnstile.render('#turnstile', { sitekey: siteKey }); };
  script.onerror = () => setStatus('認証の読み込みに失敗しました。ページを更新してください。', true);
  document.head.appendChild(script);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const token = widgetId !== null ? window.turnstile.getResponse(widgetId) : '';
    if (!token) { setStatus('送信前に認証を完了してください。', true); return; }
    const data = Object.fromEntries(new FormData(form));
    data.token = token;
    button.disabled = true;
    setStatus('送信しています…');
    try {
      const response = await fetch('/api/proposals', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error('submit failed');
      setStatus('提案を受け付けました。内容を確認してから公開します。ありがとうございました。');
      form.reset();
    } catch {
      setStatus('送信できませんでした。少し待ってからもう一度お試しください。', true);
    } finally {
      button.disabled = false;
      if (widgetId !== null) window.turnstile.reset(widgetId);
    }
  });
})();
