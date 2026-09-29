const municipalities = new Set(['倉敷市', '吉備中央町', 'その他']);
const categories = new Set(['暮らし・政策', 'エネルギー・環境', 'AI・産業', 'その他']);
const json = (body, status) => Response.json(body, { status, headers: { 'cache-control': 'no-store' } });

export async function onRequestPost({ request, env }) {
  if (!env.DB || !env.TURNSTILE_SECRET) return json({ error: '受付準備中です。' }, 503);
  const type = request.headers.get('content-type') || '';
  if (!type.includes('application/json')) return json({ error: '送信形式が違います。' }, 415);
  const length = Number(request.headers.get('content-length') || 0);
  if (length > 12000) return json({ error: '入力が長すぎます。' }, 413);

  let body;
  try { body = await request.json(); } catch { return json({ error: '入力を読み取れません。' }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: '入力を確認してください。' }, 400);
  const { municipality, category, title, detail, token } = body;
  if (!municipalities.has(municipality) || !categories.has(category) || typeof title !== 'string' || typeof detail !== 'string' || typeof token !== 'string') {
    return json({ error: '入力を確認してください。' }, 400);
  }
  const cleanTitle = title.trim();
  const cleanDetail = detail.trim();
  if (cleanTitle.length < 5 || cleanTitle.length > 120 || cleanDetail.length < 20 || cleanDetail.length > 2000 || token.length < 1 || token.length > 2048) {
    return json({ error: '文字数を確認してください。' }, 400);
  }

  let verified = false;
  try {
    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token }),
      signal: AbortSignal.timeout(5000),
    });
    if (!verify.ok) return json({ error: '認証に失敗しました。' }, 503);
    const result = await verify.json();
    verified = result.success === true;
  } catch { return json({ error: '認証に失敗しました。' }, 503); }
  if (!verified) return json({ error: '認証をやり直してください。' }, 400);

  const id = crypto.randomUUID();
  try {
    await env.DB.prepare('INSERT INTO proposals (id, municipality, category, title, detail, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, municipality, category, cleanTitle, cleanDetail, 'pending', new Date().toISOString()).run();
  } catch { return json({ error: '保存できませんでした。しばらくしてからお試しください。' }, 503); }
  return json({ id, status: 'pending' }, 202);
}
