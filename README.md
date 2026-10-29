# GRIB 단체급식 주방 화재 예방 + 공기질 통합관리 — 솔루션 상세페이지

스크롤에 따라 하나의 주방 Scene 이 감지 → 차단 → 관제 → 운영 사례 → 시스템 구조 → 다중 사업장으로 변형되는
반응형 B2B 상세페이지입니다. 장면 설계는 [STORYBOARD.md](./STORYBOARD.md) 참고.

- 프레임워크: [Astro](https://astro.build) — 빌드 결과는 **순수 정적 HTML/CSS/JS** (특정 빌더·호스팅에 종속되지 않음)
- 클라이언트 JS: 스크롤 상태 기록(약 3KB) + 폼 전송. 애니메이션은 전부 CSS
- 모든 핵심 문구는 HTML 텍스트(H1/H2/H3) — 영상·이미지·Canvas 안에 정보 없음

## 실행

```bash
npm install
npm run dev       # http://localhost:4321 개발 서버
npm run build     # dist/ 에 정적 사이트 생성
npm run preview   # 빌드 결과 미리보기
```

Node.js 20.3 이상.

## 폴더 구조

```
src/
  pages/index.astro            페이지 조립 (Scene 순서)
  layouts/BaseLayout.astro     메타 태그, OG, canonical, JSON-LD
  sections/                    Scene 별 텍스트 컴포넌트
    HeroScene · OperationScene · CaseStudyScene · ValueScene
    ProblemSolutionScene · WhyGribScene · ScaleScene · TrustScene · CTASection · ContactSection
  components/
    stage/                     스크롤 내내 고정되는 무대(Visual Anchor)
      Stage.astro              무대 레이어 조립
      KitchenIllustration.astro 주방 일러스트(실사 영상 전 임시)
      Dashboard.astro          알림 카드 → 운영 대시보드 → 요약 패널
      SiteGrid.astro           다중 사업장
    ui/                        Step, Button, Header, Footer, Logo
  data/                        ★ 문구·데이터 — 수정은 대부분 여기서
    site.ts                    회사 정보, SEO, 폼 전송 주소, 소개자료 경로
    content.ts                 Scene 별 문구와 Step 상태(view/flags/focus)
    stage.ts                   장비 목록·좌표, 주방 영상 경로
  assets/products/             GRIB 제품 이미지 (빌드 시 WebP 변환)
  scripts/story.ts             스크롤 → 무대 상태 전환, 영상 지연 로딩
  scripts/contact.ts           상담 폼 전송
  styles/
    tokens.css                 컬러·타입·모션 토큰
    stage.css                  무대 상태별 스타일
    story.css                  텍스트 Step, 폼, 반응형
public/
  robots.txt · favicon.svg · og/ · media/ · downloads/
```

## 콘텐츠 수정

| 바꾸려는 것 | 위치 |
|---|---|
| 헤드라인·설명 문구 | `src/data/content.ts` |
| 아워홈 사례 수치·기간·코멘트 | `content.ts` → `caseStudy.facts` 등. 값 입력 후 `placeholder: false` |
| 특허명·번호 | `content.ts` → `whyGrib.steps[2].patents`, `trust.proofs` |
| 고객사 목록 | `content.ts` → `trust.customers` |
| 연락처·주소·SEO 문구 | `src/data/site.ts` |
| 장비 위치 | `src/data/stage.ts` → `devices[].x / y` (주방), `ax / ay` (구조도), `mx / my` (모바일 구조도) |

`site.showPlaceholders`
- `true` (기본): 확인되지 않은 값과 사진 자리를 빗금·점선으로 표시 — 검수용
- `false`: 미확인 항목을 숨김 — 오픈 시 권장

## 실제 GRIB 에셋으로 교체

| 에셋 | 방법 |
|---|---|
| **주방 영상** | `public/media/` 에 mp4/webm/poster 저장 → `stage.ts` 의 `kitchenMedia` 에 경로 입력. 영상 속 실제 장비 위치에 맞춰 `devices[].x / y` 조정. 사양·ffmpeg 명령은 `public/media/README.md` |
| 현장 사진 (아워홈) | `src/assets/cases/` 에 저장 → `content.ts` 에서 `import` 후 `caseStudy.photo` 에 지정 |
| 실제 운영 대시보드 캡처 | 같은 방식으로 `caseStudy.dashboardShot` 에 지정 → 무대의 예시 화면 대체 |
| 제품 사진 | `src/assets/products/` 의 같은 파일명으로 교체 (투명/흰 배경 PNG, 400px 이상 권장 — 현재는 소개자료에서 잘라낸 저해상도 임시본) |
| **로고** | `src/components/ui/Logo.astro` 주석대로 공식 SVG 로 교체 (현재 임시 워드마크) |
| 소개자료 PDF | `public/downloads/grib-kitchen-safety-brochure.pdf` |
| OG 이미지 | `public/og/og-kitchen-safety.png` (1200×630) |

이미지는 `astro:assets` 가 빌드 시 WebP 로 변환하고 width/height 를 지정해 CLS 를 막습니다.

## 상담 폼 연결

`site.contactEndpoint` 가 비어 있으면 제출 시 메일 앱(`manager@grib.co.kr`)이 열립니다.
Formspree, 사내 API, CRM 웹훅 주소를 넣으면 JSON 으로 POST 합니다.
필드: `company, name, phone, email, facility, sites, message, consent`

## SEO

- `site.ts` 의 `seo.title / description / keywords`
- canonical / OG / Twitter Card 자동 생성 (`astro.config.mjs` 의 `site` 를 실제 도메인으로)
- `sitemap-index.xml` 자동 생성, `public/robots.txt` 의 Sitemap 주소 수정
- 구조화 데이터: Organization + Service (BaseLayout `schema` prop 으로 FAQ 등 추가 가능)
- Google Search Console / 네이버 서치어드바이저: 발급받은 코드를 `seo.googleVerification`, `seo.naverVerification` 에 입력

## 성능·접근성

- 무대 전환은 CSS transition, 스크롤 핸들러는 passive + requestAnimationFrame 1회
- 영상은 데스크톱 + 모션 허용 + 데이터 절약 모드 아님 조건에서만 로드(preload="none"), 그 외엔 포스터
- Pretendard 동적 서브셋(필요한 글자 조각만 로드)
- `prefers-reduced-motion`: 전환·반복 애니메이션 제거, 상태 변화만 표시
- 무대는 `aria-hidden` (같은 정보가 본문 텍스트에 있음), 건너뛰기 링크, 키보드 포커스 표시

## 배포

`npm run build` 후 `dist/` 를 어떤 정적 호스팅(Nginx, S3+CloudFront, Vercel, Netlify, 사내 서버)에도 올릴 수 있습니다.
하위 경로(예: `/solutions/kitchen-safety/`)에 둘 경우 `astro.config.mjs` 의 `base` 를 맞춰 주세요.

## 실사 영상 (첫 화면 ~ 작동 과정)

`public/media/kitchen-film-*.mp4|webm` 는 스크롤 위치에 맞춰 재생되는 원테이크 영상입니다 (`src/scripts/film.ts`).
- 각 장면이 재생할 구간: `src/data/content.ts` 의 `film: [시작초, 끝초]`
- 파일 경로·포스터: `src/data/stage.ts` 의 `film`
- 앞뒤로 매끄럽게 움직이려면 모든 프레임이 키프레임이어야 합니다 (`-g 1`). 예:
  `ffmpeg -i src.mp4 -vf scale=1280:720 -c:v libx264 -crf 27 -g 1 -an -movflags +faststart kitchen-film-720.mp4`
- 데이터 절약 모드에서는 영상을 불러오지 않고 첫 프레임 포스터만 보여줍니다.
