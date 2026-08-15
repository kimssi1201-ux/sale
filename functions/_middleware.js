export async function onRequest(context) {
  const response = await context.next();
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;

  let html = await response.text();
  html = html.replaceAll("픽앤세일 API 관리", "픽앤세일 관리자 도구");
  html = html.replaceAll("쿠팡 API 검색/딥링크", "쿠팡 상품 검색/딥링크");

  const headers = new Headers(response.headers);
  headers.set("cache-control", "no-cache");
  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
