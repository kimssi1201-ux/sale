# 픽앤세일 생활상품 자료실

쿠팡 상품 링크를 자료실형 정보 사이트처럼 정리하는 정적 사이트입니다. 상품 데이터는 `products.json`에서 불러오며, 쿠팡 파트너스 연동은 Cloudflare Pages Functions에서만 처리합니다.

## 파일

- `index.html`: 화면 구조
- `styles.css`: 전체 정보 사이트 디자인
- `manual.css`: 상품별 추가 스타일
- `app.js`: 상품 데이터와 자료 목록 렌더링
- `products.json`: 상품 데이터
- `admin.html`: 쿠팡 API 검색/딥링크 테스트 화면
- `functions/api/coupang.js`: 쿠팡 파트너스 API 프록시

## 상품 추가 방식

`products.json` 배열에 상품을 추가합니다.

- `name`: 상품명
- `category`: 카테고리
- `productUrl`: 사용자가 직접 만든 쿠팡 파트너스 링크
- `imageUrl`: 상품 이미지 URL 1개
- `summary`: 모바일에서 빠르게 읽히는 짧은 요약 문구
- `benefits`: 장점 3개

가격, 쿠폰, 배송일은 자주 바뀌므로 화면에는 최종 확인 문구를 같이 노출합니다.

## 쿠팡 검색 요청 제한

공개 상품검색은 사용자가 직접 2글자 이상 입력했을 때만 호출합니다. 같은 검색은 캐시를 사용하고, 짧은 시간 안에 반복 검색하면 잠시 대기 응답을 보냅니다. 쿠팡에서 요청 제한 응답이 오면 검색 호출을 한동안 멈춰 추가 제한을 피합니다.

## 쿠팡 API 설정

Cloudflare Pages의 Settings > Environment variables에 아래 값을 넣습니다.

- `COUPANG_ACCESS_KEY`: 쿠팡 파트너스 API Access Key
- `COUPANG_SECRET_KEY`: 쿠팡 파트너스 API Secret Key
- `COUPANG_ADMIN_TOKEN`: `/admin.html`에서 사용할 임의의 관리자 비밀번호. 쿠팡에서 받는 값이 아니라 직접 정하는 값입니다.

키는 코드나 GitHub에 직접 넣지 않습니다. 변수 저장 후 Production 배포를 다시 실행해야 Pages Function에서 읽을 수 있습니다.

## API 관리 화면

배포 후 `/admin.html`로 접속합니다.

- 상품 검색: 키워드로 쿠팡 상품을 검색하고 `products.json`에 넣을 JSON을 복사합니다.
- 딥링크 생성: 쿠팡 URL을 파트너스 딥링크로 변환합니다.
