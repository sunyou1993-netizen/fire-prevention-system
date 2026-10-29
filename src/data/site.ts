/**
 * 사이트 전역 설정 — 회사 정보, SEO, 폼 연동.
 * 문구/연락처가 바뀌면 이 파일만 수정하면 됩니다.
 */
export const site = {
  company: '(주)그립',
  brand: 'GRIB',
  platform: 'ALLSAFER',
  address: '서울특별시 서초구 효령로 242 서영빌딩 5, 6층',
  tel: '02-521-6542',
  email: 'manager@grib.co.kr',
  homepage: 'https://www.grib.co.kr',
  copyright: `Copyright © ${new Date().getFullYear()} Grib Co., Ltd. All Rights Reserved.`,

  seo: {
    title: '단체급식 주방 화재 예방·공기질 통합관리 솔루션 | GRIB 그립',
    description:
      '조리원 부재·과열·공기질을 실시간 감지하고 가스 자동 차단부터 환기·통합관제까지 연결하는 단체급식 주방 화재 예방 시스템. 누적 500개 점포 550건 설치.',
    keywords: [
      '단체급식 주방 화재 예방',
      '주방 화재 예방 시스템',
      '급식실 화재 안전',
      '주방 IoT 안전관리',
      '주방 공기질 관리',
      '가스 자동 차단',
      '단체급식 안전관리',
    ],
    /** /public 기준 경로. 1200×630 권장 */
    ogImage: '/og/og-kitchen-safety.png',
    locale: 'ko_KR',
    /** Google Search Console / Naver Search Advisor 소유 확인 코드 (발급 후 입력) */
    googleVerification: '',
    naverVerification: '',
  },

  /**
   * 상담 폼 전송 주소.
   * 비워두면 메일 앱(mailto)으로 내용을 채워 엽니다.
   * Formspree, 사내 API, 아임웹 폼 연동 주소 등을 넣으면 POST(JSON)로 전송합니다.
   */
  contactEndpoint: '',
  /** 소개자료 PDF (/public 기준). 파일을 넣고 경로를 맞추세요. */
  brochureUrl: '/downloads/grib-kitchen-safety-brochure.pdf',

  /**
   * true: 아직 받지 못한 사진/데이터 자리를 점선 박스로 표시(검수용)
   * false: 빈 슬롯을 숨김(오픈 시 권장)
   */
  showPlaceholders: false,
};
