// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 실제 배포 도메인으로 변경하세요. canonical / sitemap / OG URL에 사용됩니다.
const SITE_URL = 'https://www.grib.co.kr';

export default defineConfig({
  site: SITE_URL,
  // 솔루션 상세페이지 경로. 루트에 배포하면 '/' 로 바꾸세요.
  base: '/',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: {
    // 작은 CSS는 인라인해 첫 화면 렌더링 요청 수를 줄입니다.
    inlineStylesheets: 'auto',
  },
  image: {
    // 원본 PNG를 빌드 시 WebP/AVIF로 변환합니다.
    layout: 'constrained',
  },
});
