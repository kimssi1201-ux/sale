export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) {
    return response;
  }

  const html = await response.text();
  const noticeText = "\ucfe0\ud321 \ud30c\ud2b8\ub108\uc2a4 \ud65c\ub3d9\uc758 \uc77c\ud658\uc73c\ub85c, \uc774\uc5d0 \ub530\ub978 \uc77c\uc815\uc561\uc758 \uc218\uc218\ub8cc\ub97c \uc81c\uacf5\ubc1b\uc2b5\ub2c8\ub2e4.";
  const noticeHtml = `<section class="notice-bar" id="notice" aria-label="\ud30c\ud2b8\ub108\uc2a4 \uace0\uc9c0"><span>${noticeText}</span></section>`;
  const noticeStyle = `<style id="notice-fixed-style">
:root { --notice-bar-height: 46px; }
body { padding-top: var(--notice-bar-height) !important; }
.notice-bar {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 9999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: var(--notice-bar-height) !important;
  padding: 8px 18px !important;
  text-align: center !important;
  color: #3f3522 !important;
  background: #fff4d6 !important;
  border-bottom: 1px solid #efdca7 !important;
  box-shadow: 0 4px 14px rgba(23, 27, 34, 0.08) !important;
  font-size: 14.5px !important;
  font-weight: 900 !important;
  line-height: 1.35 !important;
}
.notice-bar strong,
.notice-extra { display: none !important; }
.notice-bar span { max-width: min(100%, 980px); text-align: center !important; }
.site-header {
  position: static !important;
  top: auto !important;
  z-index: 1 !important;
  min-height: 48px !important;
  padding: 0 18px !important;
  background: #fff !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
}
.brand { min-width: 0 !important; gap: 8px !important; }
.brand-mark { width: 30px !important; height: 30px !important; border-radius: 7px !important; }
.brand-copy strong { font-size: 16px !important; line-height: 1.1 !important; }
.brand-copy small { display: none !important; }
.main-nav,
.header-cta { display: none !important; }
@media (max-width: 720px) {
  :root { --notice-bar-height: 60px; }
  .notice-bar { padding: 7px 12px !important; font-size: 12.5px !important; }
  .site-header { min-height: 42px !important; padding: 0 12px !important; }
  .brand-mark { width: 26px !important; height: 26px !important; }
  .brand-copy strong { font-size: 15px !important; }
}
</style>`;
  const injection = [
    '<script src="/category-cleanup.js?v=category-cleanup-keywords-6160a81"></script>',
    '<script src="/top-category-cleanup.js?v=top-category-tabs-20260610"></script>'
  ].join("");
  const bodyClose = "</body>";
  const noticePattern = /<section class="notice-bar" id="notice"[\s\S]*?<\/section>/;
  let nextHtml = html.includes("</head>") ? html.replace("</head>", `${noticeStyle}</head>`) : `${noticeStyle}${html}`;
  nextHtml = noticePattern.test(nextHtml)
    ? nextHtml.replace(noticePattern, noticeHtml)
    : nextHtml.replace("<body>", `<body>${noticeHtml}`);
  nextHtml = nextHtml.includes(bodyClose) ? nextHtml.replace(bodyClose, `${injection}${bodyClose}`) : `${nextHtml}${injection}`;
  const headers = new Headers(response.headers);
  headers.set("cache-control", "no-cache");

  return new Response(nextHtml, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
