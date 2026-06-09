const COUPANG_HOST = "https://api-gateway.coupang.com";
const API_PREFIX = "/v2/providers/affiliate_open_api/apis/openapi/v1";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function getSecret(env, name) {
  return env[name] || "";
}

function getEnvHealth(env) {
  const required = ["COUPANG_ACCESS_KEY", "COUPANG_SECRET_KEY", "COUPANG_ADMIN_TOKEN"];
  return {
    ok: true,
    checkedAt: new Date().toISOString(),
    variables: Object.fromEntries(required.map((name) => [name, Boolean(getSecret(env, name))])),
    missing: required.filter((name) => !getSecret(env, name))
  };
}

function assertAdmin(request, env) {
  const configuredToken = getSecret(env, "COUPANG_ADMIN_TOKEN");
  if (!configuredToken) {
    return { ok: false, status: 500, message: "COUPANG_ADMIN_TOKEN 환경변수를 먼저 설정하세요." };
  }

  const headerToken = request.headers.get("x-admin-token") || "";
  const authHeader = request.headers.get("authorization") || "";
  const bearerToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7) : "";
  const token = headerToken || bearerToken;

  if (token !== configuredToken) {
    return { ok: false, status: 401, message: "관리자 토큰이 올바르지 않습니다." };
  }

  return { ok: true };
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getSignedDate() {
  const iso = new Date().toISOString();
  return `${iso.slice(2, 4)}${iso.slice(5, 7)}${iso.slice(8, 10)}T${iso.slice(11, 13)}${iso.slice(14, 16)}${iso.slice(17, 19)}Z`;
}

async function createHmac(method, uri, accessKey, secretKey) {
  const [path, query = ""] = uri.split("?");
  const signedDate = getSignedDate();
  const message = `${signedDate}${method}${path}${query}`;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = toHex(await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message)));

  return `CEA algorithm=HmacSHA256,access-key=${accessKey},signed-date=${signedDate},signature=${signature}`;
}

async function callCoupang(requestOptions, env) {
  const result = await fetchCoupangData(requestOptions, env);
  return jsonResponse(result, result.ok ? 200 : result.status);
}

async function fetchCoupangData(requestOptions, env) {
  const accessKey = getSecret(env, "COUPANG_ACCESS_KEY");
  const secretKey = getSecret(env, "COUPANG_SECRET_KEY");

  if (!accessKey || !secretKey) {
    return { ok: false, status: 500, message: "COUPANG_ACCESS_KEY / COUPANG_SECRET_KEY 환경변수를 먼저 설정하세요." };
  }

  const authorization = await createHmac(requestOptions.method, requestOptions.uri, accessKey, secretKey);
  const response = await fetch(`${COUPANG_HOST}${requestOptions.uri}`, {
    method: requestOptions.method,
    headers: {
      authorization,
      "content-type": "application/json; charset=utf-8"
    },
    body: requestOptions.body ? JSON.stringify(requestOptions.body) : undefined
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  return { ok: response.ok, status: response.status, data };
}

function buildSearchUri(params) {
  const keyword = (params.get("keyword") || "").trim();
  const limit = Math.min(Math.max(Number(params.get("limit") || 10), 1), 20);
  const query = new URLSearchParams();
  query.set("keyword", keyword);
  query.set("limit", String(limit));

  ["subId", "imageSize", "srpLinkOnly"].forEach((name) => {
    const value = params.get(name);
    if (value) query.set(name, value);
  });

  return `${API_PREFIX}/products/search?${query.toString()}`;
}

function buildPublicSearchParams(url) {
  const keyword = (url.searchParams.get("keyword") || "").trim().slice(0, 50);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 15), 1), 15);
  const params = new URLSearchParams();
  params.set("keyword", keyword);
  params.set("limit", String(Math.min(limit, 10)));
  return { keyword, limit, params };
}

function normalizeSearchItem(item, keyword = "") {
  const price = Number(item.productPrice || 0);
  const priceText = price ? `${price.toLocaleString("ko-KR")}원` : "";
  const safeName = item.productName || "쿠팡 추천 상품";
  const safeCategory = item.categoryName || "추천상품";
  const benefits = [
    priceText ? `가격: ${priceText}` : "",
    safeCategory ? `카테고리: ${safeCategory}` : "",
    "쿠팡 링크"
  ].filter(Boolean);

  return {
    id: `coupang-${item.productId || item.rank || "item"}`,
    productId: item.productId || "",
    name: safeName,
    category: safeCategory,
    badge: item.isRocket ? "로켓배송" : safeCategory,
    review: "",
    originalPrice: "",
    priceLabel: "가격",
    price: priceText,
    discount: "",
    productUrl: item.productUrl || "",
    imageUrl: item.productImage || "",
    summary: [safeCategory, priceText].filter(Boolean).join(" · "),
    highlightTerms: [keyword, safeCategory, priceText].filter(Boolean),
    benefits
  };
}

function getProductKey(product) {
  try {
    const url = new URL(product.productUrl || product.link || "https://example.invalid");
    const pageKey = url.searchParams.get("pageKey");
    const itemId = url.searchParams.get("itemId");
    const vendorItemId = url.searchParams.get("vendorItemId");
    if (pageKey) return [pageKey, itemId, vendorItemId].filter(Boolean).join(":");
  } catch {
    // Fall back to stable fields below.
  }

  return [
    product.productId || product.id || "",
    String(product.name || product.title || "").toLowerCase().replace(/\s+/g, " ").trim(),
    product.price || ""
  ].filter(Boolean).join("|");
}

function dedupeProducts(products) {
  const seen = new Set();
  return products.filter((product) => {
    const key = getProductKey(product);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function publicSearch(request, env) {
  const url = new URL(request.url);
  const { keyword, limit, params } = buildPublicSearchParams(url);

  if (keyword.length < 2) {
    return jsonResponse({ ok: false, message: "검색어는 2글자 이상 입력하세요." }, 400);
  }

  const cacheKey = new Request(`${url.origin}${url.pathname}?action=public-search&keyword=${encodeURIComponent(keyword)}&limit=${limit}`);
  const cache = typeof caches !== "undefined" ? caches.default : null;
  const cached = cache ? await cache.match(cacheKey) : null;
  if (cached) return cached;

  const result = await fetchCoupangData({ method: "GET", uri: buildSearchUri(params) }, env);
  const products = result.data?.data?.productData || [];
  const normalizedProducts = dedupeProducts(products.map((item) => normalizeSearchItem(item, keyword))).slice(0, limit);
  const response = jsonResponse({
    ok: result.ok,
    status: result.status,
    landingUrl: result.data?.data?.landingUrl || "",
    message: result.data?.rMessage || result.message || "",
    products: normalizedProducts,
    normalizedProducts
  }, result.ok ? 200 : result.status);

  response.headers.set("cache-control", result.ok ? "public, max-age=300" : "no-store");
  if (cache && result.ok) await cache.put(cacheKey, response.clone());
  return response;
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "search";

  if (action === "public-search") {
    return publicSearch(request, env);
  }

  const admin = assertAdmin(request, env);
  if (!admin.ok) return jsonResponse({ ok: false, message: admin.message }, admin.status);

  if (action === "health") {
    return jsonResponse(getEnvHealth(env));
  }

  if (action !== "search") {
    return jsonResponse({ ok: false, message: "GET은 action=search만 지원합니다." }, 400);
  }

  const keyword = (url.searchParams.get("keyword") || "").trim();
  if (!keyword) return jsonResponse({ ok: false, message: "keyword가 필요합니다." }, 400);

  const response = await callCoupang({ method: "GET", uri: buildSearchUri(url.searchParams) }, env);
  const payload = await response.clone().json();
  const products = payload.data?.data?.productData || [];

  return jsonResponse({
    ...payload,
    normalizedProducts: products.map((item) => normalizeSearchItem(item, keyword))
  }, response.status);
}

export async function onRequestPost({ request, env }) {
  const admin = assertAdmin(request, env);
  if (!admin.ok) return jsonResponse({ ok: false, message: admin.message }, admin.status);

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, message: "JSON body가 필요합니다." }, 400);
  }

  if (body.action === "search") {
    const params = new URLSearchParams();
    params.set("keyword", body.keyword || "");
    params.set("limit", body.limit || "10");
    if (body.subId) params.set("subId", body.subId);
    if (body.imageSize) params.set("imageSize", body.imageSize);
    if (body.srpLinkOnly) params.set("srpLinkOnly", body.srpLinkOnly);

    const response = await callCoupang({ method: "GET", uri: buildSearchUri(params) }, env);
    const payload = await response.clone().json();
    const products = payload.data?.data?.productData || [];

    return jsonResponse({
      ...payload,
      normalizedProducts: products.map((item) => normalizeSearchItem(item, body.keyword || ""))
    }, response.status);
  }

  if (body.action === "deeplink") {
    const urls = Array.isArray(body.urls) ? body.urls : [body.url].filter(Boolean);
    if (urls.length === 0) return jsonResponse({ ok: false, message: "url 또는 urls가 필요합니다." }, 400);

    return callCoupang({
      method: "POST",
      uri: `${API_PREFIX}/deeplink`,
      body: { coupangUrls: urls }
    }, env);
  }

  return jsonResponse({ ok: false, message: "지원하지 않는 action입니다. search 또는 deeplink를 사용하세요." }, 400);
}
