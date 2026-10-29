/**
 * 페이지 문구 / 스토리 데이터.
 *
 * 각 Step 은 화면에 읽히는 "하나의 메시지"이며,
 *   view  : 무대(Stage)의 카메라 구도
 *   flags : 무대에서 켜질 상태 (레이더, 과열, 차단 등)
 * 를 함께 가집니다. 스크롤이 Step 에 도달하면 무대가 해당 상태로 바뀝니다.
 *
 * placeholder: true 인 값은 아직 확인되지 않은 데이터입니다. 실제 값으로 바꾸고 false 로 변경하세요.
 */

import ctaPhoto from '../assets/scenes/kitchen-operating.png';

import imgWideSensors from '../assets/cases/wide-sensors.jpg';
import imgOverhead from '../assets/cases/overhead.jpg';
import imgKettle from '../assets/cases/kettle-close.jpg';
import imgWideLine from '../assets/cases/wide-line.jpg';

export type StageView = 'full' | 'film' | 'blank' | 'kitchen' | 'dash' | 'compact' | 'arch' | 'sites' | 'beyond' | 'cta';

export type StageFlag =
  | 'away' // 조리원 자리 이탈
  | 'radar' // 레이더 감지 영역 표시
  | 'radar-alert' // 레이더 영역 경고(적색)
  | 'temp' // 온도 태그 표시
  | 'hot' // 온도 경고(적색)
  | 'danger' // 상태판 위험
  | 'valve-off' // 가스 밸브 차단
  | 'beacon' // 경광등 작동
  | 'alert' // 관제 알림 카드
  | 'haze' // 공기질 악화
  | 'vent' // 환기·정화 가동
  | 'devices' // 장비 위치 표시 강조
  | 'mobile' // 모바일 알림 표시
  | 'v1' | 'v2' | 'v3' // VALUE 장면 포커스
  | 'f-flow' | 'f-air' | 'f-patent' | 'f-net' | 'f-all' // WHY 장면 포커스
  | 'site-1' | 'site-all' // 확장 장면
  | 'proof' // 신뢰 장면
  | 'b-card' | 'b-1' | 'b-2' | 'b-3'; // 확장 장면

export interface Step {
  id: string;
  view: StageView;
  flags?: StageFlag[];
  /** 온도 표시 [시작, 끝] — Step 진행률에 따라 보간 */
  temp?: [number, number];
  /** 강조할 장비 id. 'g:그룹명' 으로 그룹 지정, '*' 는 전체 */
  focus?: string[];
  /**
   * 한 Step 안에서 스크롤 진행에 따라 무대 상태를 차례로 바꿀 때 사용.
   * Step 높이가 구간 수만큼 길어지고, 텍스트는 고정된 채 해당 부분만 강조됩니다.
   */
  cycle?: { flags: StageFlag[]; focus?: string[]; temp?: [number, number] }[];
  /** 실사 영상 구간 [시작초, 끝초] — Step 진행률에 맞춰 영상이 이 구간을 재생(스크럽) */
  film?: [number, number];
}

export const hero = {
  step: { id: 'hero', view: 'film', flags: [], film: [0, 1.2] } satisfies Step,
  title: ['주방화재 예방 및', '공기질 관리 통합\u00a0솔루션'],
  sub: '화재 발생 후 진압하는 시대에서\n화재를 사전 차단하는 시대로!',
  /** 첫 화면 버튼: 문의 섹션으로 이동 */
  cta: { label: '컨설팅 받기', href: '#contact' },
  label: '단체급식 주방 안전',
};

/** 왜 필요한가 — 출처가 있는 수치만 사용합니다 */
export const problem = {
  step: { id: 'why-now', view: 'blank', flags: [] } satisfies Step,
  kicker: '왜 자동화가 필요한가',
  heading: ['주의만으로는', '막을 수 없는 사고가 있습니다.'],
  items: [
    {
      id: 'fire', label: '화재', value: '59.9', unit: '%',
      title: '음식점 화재 10건 중 6건은\n부주의에서 시작됐습니다.',
      body: '그중 가장 많은 원인은 조리 중인 음식을 두고\n자리를 비운 경우였습니다(520건).',
      source: '서울시 안전분야 누리집 · 서울 음식점 화재 1,861건 분석(2018~2020)',
      url: 'https://news.seoul.go.kr/safe/?p=506812',
    },
    {
      id: 'air', label: '공기질', value: '341', unit: '명',
      title: '학교 급식 종사자 341명에게서\n폐암 의심 소견이 확인됐습니다.',
      body: '폐 CT 검진을 받은 약 4만 2천 명 가운데\n1만 3천여 명이 폐 결절 등 이상 소견을 보였습니다.',
      source: 'EBS 보도(2023.3.6) · 전국 시도교육청 급식 종사자 폐 CT 검진 결과',
      url: 'https://v.daum.net/v/20230306195253738',
    },
  ],
  closing: '그래서 GRIB은 사람보다 시스템이 먼저 감지하도록 설계했습니다.',
};

export const operation = {
  heading: '단체급식 주방 화재 예방·공기질 관리 시스템의 작동 과정',
  areas: { fire: '화재 예방', air: '공기질 관리', platform: '통합 관제' } as Record<string, string>,
  steps: [
    {
      id: 'op1', view: 'film', area: 'fire', film: [1.2, 5.6], flags: ['away', 'radar'], focus: ['radar'],
      title: '자리를 비운 순간에도',
      body: 'Radar 센서가 조리원의 부재를 먼저 감지합니다.',
    },
    {
      id: 'op2', view: 'film', area: 'fire', film: [5.6, 7.3], flags: ['away', 'radar', 'temp'], temp: [168, 219], focus: ['ir'],
      title: '조리기구가 과열되면',
      body: '적외선(IR) 온도계가 조리기구 표면 온도를\n끊김 없이 측정합니다.',
    },
    {
      id: 'op3', view: 'film', area: 'fire', film: [7.3, 9.4], flags: ['away', 'radar', 'radar-alert', 'temp', 'hot', 'danger'], temp: [224, 231], focus: ['radar', 'ir'],
      title: '부재와 과열이 겹치는 순간',
      body: '사람이 발견하기를 기다리지 않고\n즉시 위험으로 판단합니다.',
      note: '조리원 부재와 위험 온도, 두 조건이 함께 충족될 때만 작동합니다.\n기준 온도는 현장에 맞게 설정합니다.',
    },
    {
      id: 'op4', view: 'film', area: 'fire', film: [9.4, 12.4], flags: ['away', 'radar', 'radar-alert', 'temp', 'hot', 'danger', 'valve-off', 'beacon'], temp: [231, 231], focus: ['valve', 'light'],
      title: '가스 공급을 자동으로 차단합니다',
      body: '가스 밸브 차단기가 닫히고,\n경광등과 경고음으로 현장에 즉시 알립니다.',
    },
    {
      id: 'op5', view: 'film', film: [12.4, 14.4], flags: [], area: 'air',
      title: '연기와 유해가스가 늘어나면',
      body: '후드의 공기질 측정기가 미세먼지와 유해가스를\n실시간으로 측정합니다.',
    },
    {
      id: 'op6', view: 'film', film: [14.4, 16.6], flags: [], area: 'air',
      title: '환기와 정화가 자동으로 시작됩니다',
      body: '기준치를 넘으면 환풍기와 공기청정 살균기가 가동되고,\n공기질이 회복되면 정상 상태로 돌아갑니다.',
    },
    {
      id: 'op7', view: 'film', film: [16.6, 22.3], flags: ['alert'], area: 'platform',
      title: '관리자는 어디서든 바로 확인합니다',
      body: '위험 조치 내역과 현재 공기질을\nPC와 모바일에서 실시간으로 확인할 수 있습니다.',
    },
  ],
};

/**
 * 실제 운영 사례 (Case Study) — 아워홈
 * 화면이 고정된 채 스크롤하면 카드가 가로로 지나갑니다 (모바일은 손가락으로 넘김).
 * 출처가 있는 사실만 사용합니다. placeholder: true 항목은 site.showPlaceholders=false 일 때 숨겨집니다.
 */
/**
 * 카드 공통 구조: 위쪽 미디어 패널 + 아래 두 줄 캡션(kicker 회색 · title 굵게)
 *  media: 'photo'  사진          | 'stat'   흰 카드 위 큰 숫자
 *         'quote'  흰 카드 위 후기 | 'total' 파란 패널 위 실적 숫자
 */
export type CaseCard = {
  media: 'photo' | 'stat' | 'quote' | 'total';
  kicker: string;
  title: string;
  image?: ImageMetadata;
  imageExample?: boolean;
  stat?: { value: string; unit?: string; note?: string; image?: ImageMetadata };
  quote?: { text: string; by: string; topic?: string };
  totals?: { value: string; unit: string }[];
  tone?: 'blue' | 'warm' | 'gray';
  placeholder?: boolean;
};

export const caseStudy = {
  step: { id: 'case', view: 'blank', flags: [] } satisfies Step,
  title: ['실제 급식 현장에서', '이미 운영되고 있습니다.'],
  customer: { name: '아워홈', type: '단체급식 운영사' },
  /** 고객사 로고 (선택) — src/assets/cases/ 에 넣고 import 후 지정하면 텍스트 대신 표시 */
  customerLogo: null as ImageMetadata | null,
  /** 헤더 옆 핵심 지표 */
  stats: [
    { value: '약 300', unit: '개 급식 사업장', note: '2022년 12월 보도 기준' },
    { value: '2020.06', unit: '협약', note: '5개 사업장 7개월 시범 운영 후' },
  ],
  cards: [
    {
      media: 'stat', tone: 'gray', kicker: '도입 전 검증',
      title: '5개 사업장에서 7개월간 먼저 검증했습니다',
      stat: { value: '7', unit: '개월', note: '전국 5개 급식 사업장', image: imgOverhead },
    },
    {
      media: 'photo', image: imgKettle, imageExample: true, kicker: '튀김솥 · 대형 조리기구',
      title: '과열 감지 시 가스를 자동으로 차단합니다',
    },
    {
      media: 'photo', image: imgWideSensors, imageExample: true, kicker: '볶음솥 · 대형 조리기구',
      title: '경광등과 경고음으로 현장에 즉시 알립니다',
    },
    {
      media: 'stat', tone: 'blue', kicker: '2022년 12월 보도 기준',
      title: '약 300개 사업장으로 확대하고 있습니다',
      stat: { value: '약 300', unit: '개', note: '전 사업장 확대 추진', image: imgWideLine },
    },
    {
      media: 'quote', tone: 'gray', kicker: '안전관리 담당',
      title: '조리 중 자리 비움 관리의 변화', placeholder: true,
      quote: { text: '[실제 인터뷰 내용 확인 후 적용]', by: '아워홈 안전관리 담당' },
    },
    {
      media: 'quote', tone: 'warm', kicker: '시설관리 담당',
      title: '여러 사업장을 관리하는 방식', placeholder: true,
      quote: { text: '[실제 인터뷰 내용 확인 후 적용]', by: '아워홈 시설관리 담당' },
    },
    {
      media: 'quote', tone: 'blue', kicker: '사업장 조리실장',
      title: '현장 조리원이 느낀 작업 환경', placeholder: true,
      quote: { text: '[실제 인터뷰 내용 확인 후 적용]', by: '아워홈 사업장 조리실장' },
    },
    {
      media: 'total', kicker: '2025년 4월 기준 누적',
      title: 'GRIB 주방화재 IoT 누적 설치 실적',
      totals: [{ value: '500', unit: '개 점포' }, { value: '550', unit: '건 설치' }],
    },
  ] as CaseCard[],
  sources: [
    { label: '아시아경제, 2020.06.03', url: 'https://www.asiae.co.kr/en/article/2020060308351900780' },
    { label: '전자신문, 2022.12.27', url: 'https://m.etnews.com/20221227000158' },
  ],
  exampleImageLabel: '예시 이미지',
  /** 아래 항목은 무대(관제 화면)에서 계속 사용 */
  dashboardShot: null as ImageMetadata | null,
  dashboardCaption: 'ALLSAFER 관제 화면 (예시 화면 · 실제 운영 화면으로 교체 예정)',
  dashboardTag: '예시 화면',
};

export const architecture = {
  step: { id: 'why', view: 'blank' } satisfies Step,
  kicker: '시스템 구성',
  heading: ['흩어져 있던 기기를', '하나의 화면으로 연결합니다.'],
  sub: '화재 감지·대응 기기와 공기질 설비가\n컨트롤러와 IoT 게이트웨이를 거쳐 ALLSAFER 관제로 모입니다.',
  /** 구성도 아래 기기 범례 (작동 과정은 위 영상에서 한 번만 보여 줍니다) */
  groups: [
    { id: 'fire', name: '화재 감지·대응', items: ['Radar 센서', '적외선(IR) 온도계', '가스 밸브 차단기', '경광등·경고음'] },
    { id: 'air', name: '공기질 관리', items: ['IoT 공기질 측정기', '환풍기', '공기청정 살균기'] },
    { id: 'net', name: '연결·관제', items: ['컨트롤러', 'IoT 게이트웨이', '운영서버', 'ALLSAFER PC·모바일'] },
  ],
  alt: '단체급식 주방의 Radar 센서·적외선(IR) 온도계·가스 밸브 차단기·경광등이 컨트롤러에 연결되고, IoT 게이트웨이를 거쳐 운영서버와 ALLSAFER PC·모바일 관제로 이어지는 시스템 구성도. 공기질 측정기·환풍기·공기청정 살균기도 컨트롤러에 연결됩니다.',
  /** 구성도 위 작동 예시: 정상 감시 → 온도 상승 → 위험 감지 → 자동 대응 → 정상 복귀 (초) */
  /** 구성도는 정상 운영 상태만 보여 줍니다 (위험 대응 장면은 작동 과정 영상에서) */
  phases: [
    { id: 'normal', label: '정상 감시', desc: '', dur: 3600 },
  ],
  temp: { normal: 186, limit: 220, peak: 231 },
  media: { image: '/media/arch-normal.webp', fallback: '/media/arch-normal.jpg', irRed: '/media/arch-ir-red.webp', beaconOn: '/media/arch-beacon-on.webp', w: 1672, h: 671 },
};

export const scale = {
  step: { id: 'scale', view: 'blank', flags: [] } satisfies Step,
  kicker: '도입과 운영',
  heading: ['설치 이후까지', '함께합니다.'],
  sub: '현장 진단부터 운영·유지관리,\n추가 사업장 확장까지 하나의 흐름으로 지원합니다.',
  /** 도입 후 달라지는 것 */
  effects: [
    { title: '안전은 시스템이 관리합니다', body: '조리원은 조리에 집중하고, 관리자는 현장에 없어도 이상 상황을 즉시 파악합니다.' },
    { title: '점검 기록이 자동으로 쌓입니다', body: '감지·차단 이력과 공기질 추이가 자동으로 기록되어 안전 점검과 보고 자료로 활용됩니다.' },
    { title: '모든 사업장에 같은 기준을 적용합니다', body: '본사가 정한 안전 기준을 전 사업장에 동일하게 적용하고, 신규 사업장도 같은 구성으로 시작합니다.' },
  ],
  process: [
    { title: '현장 진단', body: '주방 구조, 조리기구, 가스 배관과 기존 설비를 직접 확인합니다.' },
    { title: '맞춤 설계', body: '센서 위치와 연결 방식을 현장에 맞게 설계합니다.' },
    { title: '설치·연동', body: '기기를 설치하고 기존 설비 및 관제 시스템과 연동합니다.' },
    { title: '운영 안정화', body: '관리자·조리원 교육을 진행하고 초기 운영을 함께 점검합니다.' },
    { title: '유지관리', body: '이상 발생 시 원격으로 먼저 확인하고, 점검·조치 이력을 관리합니다.' },
    { title: '추가 사업장 확장', body: '검증된 구성을 기준으로 다음 사업장에 단계적으로 확대합니다.' },
  ],
  trust: [
    { icon: 'layers', title: '기기부터 플랫폼까지 직접 개발합니다', body: '센서와 게이트웨이까지 자체 설계·제조해, 문제가 생기면 원인을 시스템 전체에서 추적합니다.' },
    { icon: 'plug', title: '기존 설비를 그대로 활용합니다', body: 'RS-485, Modbus, MQTT, OPC-UA 등 산업 통신 방식으로 기존 설비와 연동해, 필요한 영역부터 도입할 수 있습니다.' },
    { icon: 'shield', title: '보안 정책에 맞춰 구축합니다', body: '클라우드부터 폐쇄망까지, 고객사 환경에 맞는 구축 방식을 선택할 수 있습니다.', chips: ['Cloud', 'On-Premise', '폐쇄망', 'Hybrid'] },
  ],
};

/**
 * 검증 정보 (SCENE 08) — 세로 배치: 특허 → 수상 → 주요 고객사
 * 이미지: public/proofs/ 에 image 경로 그대로 저장하면 자동으로 표시 (없으면 빈 이미지 칸)
 * 로고:   public/logos/{slug}.svg (또는 .png) 로 저장하면 자동으로 로고 표시 (없으면 회사명 글자)
 *         로고는 각 사 공식 브랜드 자료(CI 다운로드 페이지 등)에서 받은 파일을 사용하세요.
 */
export const trust = {
  step: { id: 'trust', view: 'blank', flags: [] } satisfies Step,
  kicker: '검증',
  heading: ['학교와 기업 급식 현장이', '먼저 선택했습니다.'],
  proofs: [
    {
      kind: '특허',
      title: '[특허명 확인 후 적용]',
      body: '특허 제10-XXXXXXX호 외 — 보유 특허 목록 확인 후 적용',
      image: '/proofs/patent-01.jpg',
      imageAlt: '특허증',
      placeholder: true,
    },
    {
      kind: '수상',
      title: '2023 AIoT 혁신대상 과학기술정보통신부장관상',
      body: 'AIoT 서비스 분야',
      image: '/proofs/award-2023-aiot.jpg',
      imageAlt: '2023 AIoT 혁신대상 상장',
      placeholder: false,
    },
  ],
  /** 주요 고객사 — 로고 모음 이미지(public/logos/customers.png)의 대체 텍스트로 쓰입니다 */
  customerNames: [
    '전주만수초등학교', '현대청운고등학교', 'KAIST 서울캠퍼스', '부산외국어대학교', '상산고등학교', '채드윅 국제학교', '시온고등학교',
    '국민대학교', '연암대학교', '한민고등학교', '건국대학교', '서강대학교', '대진대학교', '대원대학교', '강원대학교', '국립금오공과대학교',
    '대림대학교', '대덕대학교', '청주대학교', '삼성전자', 'KB국민은행', 'LG전자', 'LG디스플레이', '기아', 'POSCO', '한화', '두산',
    'CJ제일제당', 'HD현대중공업',
  ],
};

export const cta = {
  step: { id: 'cta', view: 'cta', flags: [] } satisfies Step,
  title: ['우리 주방에 맞는 구성이', '궁금하신가요?'],
  body: '현재 설비와 주방 환경을 확인한 뒤\n필요한 구성과 구축 범위를 제안해 드립니다.',
  primary: '컨설팅 받기',
  /** 실제 주방 현장 사진 — 같은 비율(16:9 내외, 1600px 이상)의 실사로 교체 가능 */
  photo: ctaPhoto,
  photoAlt: '대형 회전식 국솥과 스테인리스 조리 설비가 갖춰진 단체급식 주방에서 위생복을 입은 조리원들이 조리하는 모습',
  /** 사진 초점 (CSS object-position). 데스크톱 / 모바일 */
  photoFocus: '58% 50%',
  photoFocusMobile: '56% 50%',
};

export const contact = {
  heading: '컨설팅 신청',
  body: '사업장 정보를 남겨 주시면 담당자가 연락드려\n현장 방문 일정을 안내해 드립니다.',
  facilityTypes: ['급식 운영사', '기업 구내식당', '학교·대학', '병원', '공공기관', '기타'],
  sitesOptions: ['1곳', '2~5곳', '6~20곳', '21곳 이상'],
  consent: '상담을 위한 개인정보(회사명, 담당자명, 연락처, 이메일) 수집·이용에 동의합니다.',
  submit: '컨설팅 신청하기',
  success: '신청이 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.',
  error: '전송하지 못했습니다. 잠시 후 다시 시도하시거나 전화로 문의해 주세요.',
};
