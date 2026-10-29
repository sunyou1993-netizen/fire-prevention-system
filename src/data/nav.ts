/**
 * GNB 메뉴 — 그립 사이트 전체 메뉴 구조.
 * 각 메뉴는 실제 페이지로 이동합니다. 상세 내용이 아직 없는 페이지는 src/pages/[...slug].astro 가 '준비 중' 화면을 만듭니다.
 * 실제 페이지를 만들면 같은 주소의 .astro 파일을 추가하세요(그 파일이 우선합니다).
 * current: true 인 항목은 지금 보고 있는 페이지로 표시됩니다.
 */
export interface NavLink { label: string; href: string; current?: boolean }
export interface NavGroup { title?: string; links: NavLink[] }
export interface NavMenu { label: string; href: string; intro: string; groups: NavGroup[] }

export const gnb: NavMenu[] = [
  {
    label: '솔루션', href: '/solutions/', intro: '산업현장부터 시설·교육 공간까지, 현장에 맞는 안전·관제 솔루션을 제공합니다.',
    groups: [
      { title: '산업안전·설비', links: [
        { label: 'AI 산업안전 통합관제', href: '/solutions/ai-safety/' },
        { label: '설비 예지보전', href: '/solutions/predictive-maintenance/' },
        { label: '설비·에너지 통합관리', href: '/solutions/facility-energy/' },
      ] },
      { title: '시설안전·관제', links: [
        { label: '스마트 시설점검', href: '/solutions/facility-inspection/' },
        { label: '주방 화재·공기질 관리', href: '/', current: true },
        { label: '연구실 안전관제', href: '/solutions/lab-safety/' },
        { label: '분전반 화재예방', href: '/solutions/panel-fire/' },
        { label: '소방 수신기 원격관제', href: '/solutions/fire-receiver/' },
      ] },
      { title: '스마트 교육', links: [
        { label: 'CLAIX', href: '/solutions/claix/' },
        { label: 'CLAIX AI Board', href: '/solutions/claix-ai-board/' },
      ] },
    ],
  },
  {
    label: '디바이스', href: '/devices/', intro: '그립이 직접 설계·제조하는 게이트웨이, 센서, 통신 모듈, 산업용 PC입니다.',
    groups: [
      { title: '게이트웨이', links: [
        { label: '산업용 게이트웨이', href: '/devices/industrial-gateway/' },
        { label: 'IoT 게이트웨이', href: '/devices/iot-gateway/' },
        { label: 'LoRaWAN 게이트웨이', href: '/devices/lorawan-gateway/' },
      ] },
      { title: '센서·계측', links: [
        { label: '전력측정기', href: '/devices/power-meter/' },
        { label: '진동·기울기 센서', href: '/devices/vibration-tilt-sensor/' },
        { label: '무선 진동센서', href: '/devices/wireless-vibration-sensor/' },
        { label: '플렉스 센서', href: '/devices/flex-sensor/' },
      ] },
      { title: '통신·I/O', links: [
        { label: '무선 I/O 모듈', href: '/devices/wireless-io/' },
        { label: 'Interface I/O 모듈', href: '/devices/interface-io/' },
      ] },
      { title: '산업용 PC', links: [
        { label: '산업용 컴팩트 서버', href: '/devices/compact-server/' },
      ] },
    ],
  },
  {
    label: '도입사례', href: '/cases/', intro: '실제 현장에 적용된 그립 솔루션 사례입니다.',
    groups: [
      { title: '산업안전·설비', links: [
        { label: '제조현장 안전·설비', href: '/cases/manufacturing/' },
      ] },
      { title: '시설안전·관제', links: [
        { label: '시설점검', href: '/cases/facility-inspection/' },
        { label: '주방안전', href: '/#case' },
        { label: '연구실안전', href: '/cases/lab/' },
      ] },
      { title: '스마트교육', links: [
        { label: '교육기관 구축', href: '/cases/education/' },
      ] },
    ],
  },
  {
    label: '회사', href: '/company/', intro: '현장의 안전을 연결하는 기업, 그립입니다.',
    groups: [
      { links: [
        { label: '회사소개', href: '/company/about/' },
        { label: '뉴스', href: '/company/news/' },
        { label: '오시는 길', href: '/company/location/' },
      ] },
    ],
  },
];
