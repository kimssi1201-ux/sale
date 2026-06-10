const MAINTENANCE_HTML = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>사이트 정지 중</title>
    <style>
      :root {
        color-scheme: light;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        background: #f6f3ec;
        color: #171b22;
      }

      main {
        width: min(92vw, 520px);
        padding: 32px 24px;
        border: 1px solid #e1d7c5;
        border-radius: 8px;
        background: #fff;
        text-align: center;
        box-shadow: 0 18px 46px rgba(23, 27, 34, 0.08);
      }

      h1 {
        margin: 0 0 10px;
        font-size: 28px;
        line-height: 1.25;
      }

      p {
        margin: 0;
        color: #5f6672;
        font-size: 16px;
        line-height: 1.55;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>사이트 정지 중입니다</h1>
      <p>현재 사이트 운영을 일시 중단했습니다.</p>
    </main>
  </body>
</html>`;

export async function onRequest() {
  return new Response(MAINTENANCE_HTML, {
    status: 503,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "retry-after": "86400",
      "x-robots-tag": "noindex, nofollow"
    }
  });
}
