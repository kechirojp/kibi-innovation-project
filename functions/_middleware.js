// Temporary site closure. Remove this middleware and deploy to reopen.
export function onRequest() {
  return new Response('このサイトは一時的に非公開です。', {
    status: 503,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}
