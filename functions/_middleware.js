export async function onRequest(context) {
  const response = await context.next();
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;

  let html = await response.text();
  html = html.replaceAll("픽앤세일 API 관리", "픽앤세일 관리자 도구");
  html = html.replaceAll("쿠팡 API 검색/딥링크", "쿠팡 상품 검색/딥링크");

  const notice =
    "\ucfe0\ud321 \ud30c\ud2b8\ub108\uc2a4 \ud65c\ub3d9\uc758 \uc77c\ud658\uc73c\ub85c, \uc774\uc5d0 \ub530\ub978 \uc77c\uc815\uc561\uc758 \uc218\uc218\ub8cc\ub97c \uc81c\uacf5\ubc1b\uc2b5\ub2c8\ub2e4.";
  const style = `<style id="notice-fixed-style">:root{--notice-bar-height:46px}body{padding-top:var(--notice-bar-height)!important}.notice-bar{position:fixed!important;top:0!important;left:0!important;right:0!important;z-index:9999!important;display:flex!important;align-items:center!important;justify-content:center!important;min-height:var(--notice-bar-height)!important;padding:8px 18px!important;text-align:center!important;color:#3f3522!important;background:#fff4d6!important;border-bottom:1px solid #efdca7!important;box-shadow:0 4px 14px rgba(23,27,34,.08)!important;font-size:14.5px!important;font-weight:900!important;line-height:1.35!important}.notice-bar strong,.notice-extra{display:none!important}.notice-bar span{max-width:min(100%,980px);text-align:center!important}.site-header{display:none!important;position:static!important;top:auto!important;z-index:1!important;min-height:0!important;padding:0!important;background:#fff!important;backdrop-filter:none!important;box-shadow:none!important}.main-nav,.header-cta{display:none!important}@media(max-width:720px){:root{--notice-bar-height:60px}.notice-bar{padding:7px 12px!important;font-size:12.5px!important}.site-header{display:none!important;min-height:0!important;padding:0!important}}</style>`;
  const loadGuard = `<script src="/load-guard.js?v=load-guard-20260610"></script>`;
  const boot = `<script>(function(){var text='${notice}';var n=document.querySelector('.notice-bar');if(!n){n=document.createElement('section');n.className='notice-bar';document.body.prepend(n)}n.id='notice';n.setAttribute('aria-label','\\ud30c\\ud2b8\\ub108\\uc2a4 \\uace0\\uc9c0');n.innerHTML='<span>'+text+'</span>';var bars=document.querySelectorAll('.notice-bar');for(var i=1;i<bars.length;i++)bars[i].remove()})()</script><script src="/category-cleanup.js?v=category-cleanup-keywords-6160a81"></script><script src="/top-category-cleanup.js?v=top-category-tabs-20260610"></script><script src="/price-review-accuracy.js?v=verified-minimal-sort-20260610"></script>`;

  html = html.includes("</head>")
    ? html.replace("</head>", style + loadGuard + "</head>")
    : style + loadGuard + html;
  html = html.includes("</body>")
    ? html.replace("</body>", boot + "</body>")
    : html + boot;

  const headers = new Headers(response.headers);
  headers.set("cache-control", "no-cache");
  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
