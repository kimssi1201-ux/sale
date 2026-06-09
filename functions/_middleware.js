export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) {
    return response;
  }

  const html = await response.text();
  const injection = '<script src="/category-cleanup.js?v=category-cleanup-timeout-5e0960b"></script>';
  const bodyClose = "</body>";
  const nextHtml = html.includes(bodyClose) ? html.replace(bodyClose, `${injection}${bodyClose}`) : `${html}${injection}`;
  const headers = new Headers(response.headers);
  headers.set("cache-control", "no-cache");

  return new Response(nextHtml, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
