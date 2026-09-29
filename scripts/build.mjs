import { readFile, mkdir, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const path = (name) => new URL(name, root);
const pages = [
  { slug: 'vision', file: 'docs/overview.md', title: '全体構想', short: '地域の課題を研究・実証・事業化につなぐ' },
  { slug: 'life', file: 'docs/family-and-civic.md', title: '暮らしと政策', short: '近居支援とプッシュ型行政' },
  { slug: 'energy', file: 'docs/mizushima-energy.md', title: '水島の資源循環', short: '燃料・水素・水を使う技術実証' },
  { slug: 'compute', file: 'docs/kibi-ai.md', title: '吉備中央町のAI基盤', short: '用地・電力・通信を一緒に計画' },
  { slug: 'robots', file: 'docs/physical-ai-and-startups.md', title: 'フィジカルAIと起業', short: '大学の研究を工場の実需へつなぐ' },
  { slug: 'roadmap', file: 'ROADMAP.md', title: '進め方', short: '調査から実証、公開、横展開まで' },
  { slug: 'participate', file: 'CONTRIBUTING.md', title: '参加方法', short: '市民も研究者も自治体も参加できる' },
  { slug: 'privacy', file: 'docs/privacy.md', title: '投稿と個人情報', short: '投稿の保存と公開までの扱い' },
];

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const urlForDoc = (href) => {
  const clean = href.replace(/^\.\.\//, '').replace(/^\.\//, '');
  const page = pages.find((item) => item.file === clean || item.file.endsWith('/' + clean));
  return page ? `/${page.slug}/` : href;
};
const inline = (raw) => {
  let value = escapeHtml(raw);
  value = value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const url = urlForDoc(href);
    if (!/^(https?:\/\/|\/|[a-zA-Z0-9._/-]+$)/.test(url)) return label;
    const external = /^https?:\/\//.test(url);
    return `<a href="${escapeHtml(url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`;
  });
  return value.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
};
const renderMarkdown = (source) => {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let list = null;
  let paragraph = [];
  const flushParagraph = () => { if (paragraph.length) { out.push(`<p>${inline(paragraph.join(' '))}</p>`); paragraph = []; } };
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) { flushParagraph(); closeList(); continue; }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) { flushParagraph(); closeList(); const level = heading[1].length; out.push(`<h${level}>${inline(heading[2])}</h${level}>`); continue; }
    if (line.startsWith('|') && i + 1 < lines.length && /^\|?\s*:?-+:?/.test(lines[i + 1].trim())) {
      flushParagraph(); closeList();
      const cells = (s) => s.trim().replace(/^\||\|$/g, '').split('|').map((x) => x.trim());
      out.push('<div class="table-scroll"><table><thead><tr>' + cells(line).map((x) => `<th>${inline(x)}</th>`).join('') + '</tr></thead><tbody>');
      i++;
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) {
        i++; out.push('<tr>' + cells(lines[i]).map((x) => `<td>${inline(x)}</td>`).join('') + '</tr>');
      }
      out.push('</tbody></table></div>');
      continue;
    }
    const bullet = /^[-*]\s+(.+)$/.exec(line);
    const ordered = /^\d+\.\s+(.+)$/.exec(line);
    if (bullet || ordered) {
      flushParagraph(); const wanted = bullet ? 'ul' : 'ol';
      if (list !== wanted) { closeList(); out.push(`<${wanted}>`); list = wanted; }
      out.push(`<li>${inline((bullet || ordered)[1])}</li>`);
      continue;
    }
    closeList(); paragraph.push(line);
  }
  flushParagraph(); closeList();
  return out.join('\n');
};

const css = await readFile(path('site/styles.css'), 'utf8');
const formScript = await readFile(path('site/form.js'), 'utf8');
const nav = pages.map((p) => `<a href="/${p.slug}/">${p.title}</a>`).join('');
const shell = (title, description, body, { home = false } = {}) => `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><meta name="description" content="${escapeHtml(description)}"><title>${escapeHtml(title)} | 倉敷・吉備中央 オープン政策プロジェクト</title><style>${css}</style></head>
<body><a class="skip" href="#content">本文へ移動</a><header class="topbar"><div class="topbar-inner"><a class="brand" href="/" aria-label="トップページへ"><span class="brand-mark">K</span><span>倉敷・吉備中央<br><small>OPEN POLICY PROJECT</small></span></a><nav aria-label="主なページ">${nav}</nav><a class="top-action" href="/#proposal">提案する <span aria-hidden="true">↗</span></a></div></header><main id="content">${body}</main><footer><div class="footer-inner"><div><strong>暮らしと産業の未来を、公開でつくる。</strong><p>市民による提案プロジェクトです。自治体・企業の決定事項ではありません。</p></div><div><a href="https://github.com/kechirojp/kibi-innovation-project">GitHub</a><a href="https://github.com/kechirojp/kibi-innovation-project/issues">Issue</a><a href="/participate/">参加方法</a><a href="/privacy/">投稿と個人情報</a></div></div></footer>${home ? `<script>${formScript}</script>` : ''}</body></html>`;

const hero = `<section class="hero"><div class="hero-inner"><div class="eyebrow"><span class="dot"></span> まちの未来を、更新できる形に</div><h1>倉敷の現場から、<br><em>未来を試す。</em></h1><p class="hero-lead">水島の産業、吉備中央町の挑戦、市民の暮らし。地域にある力をつなぎ、政策も技術も実証しながら育てる公開プロジェクトです。</p><div class="hero-actions"><a class="button primary" href="/vision/">構想を読む <span aria-hidden="true">→</span></a><a class="button ghost" href="#proposal">あなたの提案を送る <span aria-hidden="true">↗</span></a></div><p class="hero-note">この構想は市民提案です。採択・予算化・投資は決まっていません。</p></div><div class="hero-art" aria-hidden="true"><div class="orb orb-a"></div><div class="orb orb-b"></div><div class="grid-orbit"></div><span class="art-label art-a">KURASHIKI</span><span class="art-label art-b">MIZUSHIMA</span><span class="art-label art-c">KIBI-CHUO</span></div></section>`;
const cards = `<section class="section" id="themes"><div class="section-heading"><span class="kicker">PROJECT THEMES</span><h2>地域の強みを、<br>ひとつの循環に。</h2><p>暮らしの課題を起点に、研究・実証・事業化へつなげます。</p></div><div class="cards">${pages.slice(1, 5).map((p, i) => `<a class="card card-${i + 1}" href="/${p.slug}/"><span class="card-number">0${i + 1}</span><span class="card-arrow" aria-hidden="true">↗</span><h3>${p.title}</h3><p>${p.short}</p><span class="card-more">詳しく見る <span aria-hidden="true">→</span></span></a>`).join('')}</div></section>`;
const cycle = `<section class="cycle"><div class="section-heading"><span class="kicker">HOW IT WORKS</span><h2>提案が、次の改善になる。</h2><p>発案で終わらせず、結果と判断理由まで公開します。</p></div><div class="steps"><div><b>01</b><strong>課題を出す</strong><span>市民・企業・自治体が現場の困りごとを共有</span></div><div><b>02</b><strong>小さく試す</strong><span>大学・起業家・企業が解決策を実証</span></div><div><b>03</b><strong>結果を公開する</strong><span>費用、効果、うまくいかなかった点も記録</span></div><div><b>04</b><strong>各地へ広げる</strong><span>他自治体がフォークし、改善を戻す</span></div></div></section>`;
const siteKey = process.env.TURNSTILE_SITE_KEY || '';
const proposal = `<section class="section proposal" id="proposal"><div class="proposal-intro"><span class="kicker">JOIN THE PROJECT</span><h2>あなたの視点を、<br>次の一歩に。</h2><p>GitHubアカウントは不要です。地域の困りごと、政策の改善案、調べてほしいことを送ってください。投稿は確認後、個人情報を除いて公開Issueに整理します。</p><a href="/participate/">参加の方法を詳しく見る <span aria-hidden="true">→</span></a></div><form id="proposal-form" class="proposal-form"><label>地域<select name="municipality" required><option value="">選んでください</option><option value="倉敷市">倉敷市</option><option value="吉備中央町">吉備中央町</option><option value="その他">その他</option></select></label><label>テーマ<select name="category" required><option value="">選んでください</option><option value="暮らし・政策">暮らし・政策</option><option value="エネルギー・環境">エネルギー・環境</option><option value="AI・産業">AI・産業</option><option value="その他">その他</option></select></label><label>提案のタイトル<input name="title" required minlength="5" maxlength="120" placeholder="例：子育て世帯の近居を支える"></label><label>内容<textarea name="detail" required minlength="20" maxlength="2000" rows="6" placeholder="何に困っていますか？ どう変えると良いでしょうか？"></textarea></label><p class="form-note">氏名、住所、電話番号、病歴などの個人情報は書かないでください。<a href="/privacy/">投稿の扱い</a></p><div id="turnstile" class="turnstile" data-sitekey="${escapeHtml(siteKey)}"></div><button type="submit" class="button primary">提案を送る <span aria-hidden="true">→</span></button><p id="form-status" class="form-status" role="status" aria-live="polite"></p></form></section>`;

await mkdir(path('dist/'), { recursive: true });
const home = shell('ホーム', '倉敷・吉備中央町の暮らし、産業、エネルギー、AIをつなぐ公開政策プロジェクト', hero + cards + cycle + proposal, { home: true });
await writeFile(path('dist/index.html'), home, 'utf8');
for (const page of pages) {
  const md = await readFile(path(page.file), 'utf8');
  const article = `<section class="page-hero"><div class="page-hero-inner"><a class="back" href="/">← トップへ戻る</a><span class="kicker">OPEN POLICY / ${escapeHtml(page.slug.toUpperCase())}</span><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.short)}</p></div></section><div class="document-wrap"><article class="document">${renderMarkdown(md)}</article><aside class="document-aside"><strong>この構想に参加する</strong><p>根拠の追加や改善案を歓迎します。</p><a href="/#proposal">匿名で提案する →</a><a href="https://github.com/kechirojp/kibi-innovation-project/issues">GitHubで参加する ↗</a></aside></div>`;
  await mkdir(path(`dist/${page.slug}/`), { recursive: true });
  await writeFile(path(`dist/${page.slug}/index.html`), shell(page.title, page.short, article), 'utf8');
}
await writeFile(path('dist/robots.txt'), 'User-agent: *\nAllow: /\n', 'utf8');
console.log(`Built ${pages.length + 1} pages from repository documents.`);
