const COUPANG_HOST = "https://api-gateway.coupang.com";
const API_PREFIX = "/v2/providers/affiliate_open_api/apis/openapi/v1";
const SEARCH_CACHE_SECONDS = 21600;
const SEARCH_CACHE_CONTROL = `public, max-age=${SEARCH_CACHE_SECONDS}, s-maxage=${SEARCH_CACHE_SECONDS}, stale-while-revalidate=86400`;
const IMAGE_CACHE_CONTROL = "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800";
const CLIENT_SEARCH_COOLDOWN_SECONDS = 8;
const GLOBAL_SEARCH_COOLDOWN_SECONDS = 2;
const COUPANG_SUSPEND_SECONDS = 3600;

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

function getClientId(request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("user-agent") ||
    "unknown"
  ).slice(0, 180);
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return toHex(digest);
}

function privateCacheResponse(body, ttlSeconds, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `private, max-age=${ttlSeconds}`
    }
  });
}

function getCache(origin) {
  if (typeof caches === "undefined") return null;
  return { cache: caches.default, origin };
}

async function getMarker(cacheContext, key) {
  if (!cacheContext) return null;
  return cacheContext.cache.match(new Request(`${cacheContext.origin}/__rate/${key}`));
}

async function putMarker(cacheContext, key, ttlSeconds, body = { ok: true }) {
  if (!cacheContext) return;
  await cacheContext.cache.put(
    new Request(`${cacheContext.origin}/__rate/${key}`),
    privateCacheResponse(body, ttlSeconds)
  );
}

async function getPublicSearchRateLimit(request, url, cacheContext) {
  if (!cacheContext) return null;
  const clientHash = await sha256(getClientId(request));
  const clientKey = `client-search-${clientHash}`;
  const globalKey = "global-search";
  const suspended = await getMarker(cacheContext, "coupang-suspended");

  if (suspended) {
    return {
      ok: false,
      status: 429,
      message: "쿠팡 검색 요청이 잠시 제한되어 검색을 일시 중단했습니다. 잠시 후 다시 시도하세요.",
      retryAfter: COUPANG_SUSPEND_SECONDS
    };
  }

  if (await getMarker(cacheContext, clientKey)) {
    return {
      ok: false,
      status: 429,
      message: "검색 요청이 너무 빠릅니다. 잠시 후 다시 검색하세요.",
      retryAfter: CLIENT_SEARCH_COOLDOWN_SECONDS
    };
  }

  if (await getMarker(cacheContext, globalKey)) {
    return {
      ok: false,
      status: 429,
      message: "동시에 검색 요청이 많아 잠시 대기 중입니다.",
      retryAfter: GLOBAL_SEARCH_COOLDOWN_SECONDS
    };
  }

  await putMarker(cacheContext, clientKey, CLIENT_SEARCH_COOLDOWN_SECONDS);
  await putMarker(cacheContext, globalKey, GLOBAL_SEARCH_COOLDOWN_SECONDS);
  return null;
}

function isCoupangLimitResult(result) {
  const message = `${result.data?.rMessage || ""} ${result.message || ""} ${result.data?.message || ""}`;
  return result.status === 429 || /분당|시간당|사용 횟수|초과|제한/.test(message);
}

async function suspendCoupangSearch(cacheContext) {
  await putMarker(cacheContext, "coupang-suspended", COUPANG_SUSPEND_SECONDS, {
    ok: false,
    message: "coupang limit detected"
  });
}

function isAllowedCoupangImageUrl(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return (
      url.protocol === "https:" &&
      (host === "ads-partners.coupang.com" || host.endsWith(".coupangcdn.com"))
    );
  } catch {
    return false;
  }
}

function getImageProxyUrl(value) {
  if (!value || !isAllowedCoupangImageUrl(value)) return "";
  return `/api/coupang?action=image&src=${encodeURIComponent(value)}`;
}

async function proxyCoupangImage(request) {
  const url = new URL(request.url);
  const source = url.searchParams.get("src") || "";

  if (!isAllowedCoupangImageUrl(source)) {
    return new Response("invalid image", {
      status: 400,
      headers: { "cache-control": "no-store" }
    });
  }

  const upstream = await fetch(source, {
    redirect: "follow",
    headers: { "user-agent": "Mozilla/5.0" },
    cf: { cacheEverything: true, cacheTtl: 604800 }
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("image unavailable", {
      status: upstream.status || 502,
      headers: { "cache-control": "no-store" }
    });
  }

  const headers = new Headers();
  headers.set("content-type", upstream.headers.get("content-type") || "image/jpeg");
  headers.set("cache-control", IMAGE_CACHE_CONTROL);
  headers.set("access-control-allow-origin", "*");
  return new Response(upstream.body, { status: 200, headers });
}

function normalizeSearchItem(item, keyword = "") {
  const price = Number(item.productPrice || 0);
  const priceText = price ? `${price.toLocaleString("ko-KR")}원` : "";
  const safeName = item.productName || "쿠팡 추천 상품";
  const safeCategory = item.categoryName || "추천상품";
  const sourceImageUrl = item.productImage || "";
  const imageUrl = getImageProxyUrl(sourceImageUrl);
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
    imageUrl,
    productImage: imageUrl,
    sourceImageUrl,
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

  const cacheContext = getCache(url.origin);
  const cacheKey = new Request(`${url.origin}${url.pathname}?action=public-search&keyword=${encodeURIComponent(keyword)}&limit=${limit}&image=proxy1`);
  const cached = cacheContext ? await cacheContext.cache.match(cacheKey) : null;
  if (cached) return cached;

  const rateLimit = await getPublicSearchRateLimit(request, url, cacheContext);
  if (rateLimit) {
    const response = jsonResponse({ ok: false, message: rateLimit.message }, rateLimit.status);
    response.headers.set("retry-after", String(rateLimit.retryAfter));
    return response;
  }

  const result = await fetchCoupangData({ method: "GET", uri: buildSearchUri(params) }, env);
  if (isCoupangLimitResult(result)) await suspendCoupangSearch(cacheContext);

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

  response.headers.set("cache-control", result.ok ? SEARCH_CACHE_CONTROL : "no-store");
  if (cacheContext && result.ok) await cacheContext.cache.put(cacheKey, response.clone());
  return response;
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "search";

  if (action === "image") {
    return proxyCoupangImage(request);
  }

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
