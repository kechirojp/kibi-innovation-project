# 倉敷・吉備中央 オープン政策プロジェクト

倉敷市と吉備中央町を起点に、暮らし、産業、エネルギー、AIを一緒に育てる市民提案です。自治体や企業が決定した事業ではありません。

市民向けサイト: https://kibi-innovation-project.pages.dev/

このリポジトリでは、提案と確認済みの事実を分け、必要な調査、実証結果、政策の変更履歴を公開します。他の自治体によるフォークと改善提案を歓迎します。

## まず読む

- [全体構想](docs/overview.md)
- [近居支援とプッシュ型行政](docs/family-and-civic.md)
- [水島のエネルギー・資源循環](docs/mizushima-energy.md)
- [吉備中央町のAI基盤](docs/kibi-ai.md)
- [フィジカルAIと起業](docs/physical-ai-and-startups.md)
- [進め方と検証指標](ROADMAP.md)
- [公開Projectsボード](https://github.com/users/kechirojp/projects/2/views/1)

## 参加する

- 誤りや出典の不足は「事実確認」のIssueで知らせてください。
- 新しい施策や実証案は「政策・実証の提案」のIssueで、対象者・効果・検証方法を添えてください。
- 文書やサイトの修正はプルリクエストを送ってください。詳しくは[参加ガイド](CONTRIBUTING.md)へ。
- GitHubアカウントがない方は、市民向けサイトの投稿フォームから匿名で提案できます。投稿は審査後、個人情報を除いてIssueに整理します。

## 原則

1. 事実・提案・仮説を混ぜない。
2. 実証前に成果を断定しない。
3. 公費を使う場合は、募集条件、選定理由、費用、成果を公開する。
4. 市民の健康、暮らし、所得を成果指標に含める。
5. 他自治体が地域条件に合わせて改変できる形で公開する。

このプロジェクトは、個人の住民記録や医療情報を収集・公開しません。将来の行政データ連携は、自治体の正式な制度設計と法的確認を経て検討します。

## 開発

Node.js 22以降で `npm run build` を実行すると、リポジトリのMarkdownから市民向けサイトを `dist/` に生成します。`npm test` はページ生成と投稿受付の動作を確認します。Cloudflare Pages、D1、Turnstileの設定は[運用手順](docs/operations.md)にあります。

## ライセンス

文書は [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.ja)、サイトと投稿受付のコードは [MIT](LICENSE-CODE) で公開します。第三者の引用・資料は各出典の条件に従います。
