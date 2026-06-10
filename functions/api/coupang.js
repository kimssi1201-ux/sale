const STOPPED_RESPONSE = {
  ok: false,
  status: 503,
  message: "사이트 운영을 일시 중단했습니다."
};

function stoppedJsonResponse() {
  return new Response(JSON.stringify(STOPPED_RESPONSE), {
    status: 503,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "retry-after": "86400",
      "x-robots-tag": "noindex, nofollow"
    }
  });
}

export async function onRequestGet() {
  return stoppedJsonResponse();
}

export async function onRequestPost() {
  return stoppedJsonResponse();
}
