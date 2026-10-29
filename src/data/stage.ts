/**
 * 주방 Scene 설정 — 장비 위치와 미디어 경로.
 *
 * 좌표계: Scene은 16:10 비율 박스이며 x, y 는 그 박스 기준 % 입니다.
 *   - (x, y)   : 주방 화면에서 장비가 설치된 위치
 *   - (ax, ay) : "WHY GRIB" 장면에서 시스템 구조도로 분리되었을 때 위치
 *                (구조도는 무대 전체를 쓰는 별도 박스 기준 % — 화재 장비는 컨트롤러 아래, 공기질 장비는 게이트웨이 아래)
 *
 * 실제 주방 영상/사진으로 교체할 경우, 영상 속 실제 설치 위치에 맞춰 x, y 만 조정하면
 * 레이더 영역·온도 태그·경보 표시가 함께 따라갑니다.
 */
import radar from '../assets/products/radar-sensor.png';
import ir from '../assets/products/ir-sensor.png';
import valve from '../assets/products/gas-valve.png';
import light from '../assets/products/warning-light.png';
import controller from '../assets/products/controller.png';
import gateway from '../assets/products/gateway.png';
import air from '../assets/products/air-sensor.png';
import fan from '../assets/products/fan.png';
import purifier from '../assets/products/purifier.png';
import server from '../assets/products/server.png';
import dashboard from '../assets/products/dashboard.png';

export type DeviceTier = 'device' | 'network' | 'platform' | 'service';

export interface Device {
  id: string;
  name: string;
  role: string;
  img: ImageMetadata;
  tier: DeviceTier;
  /** 주방 화면 위치 (%) */
  x: number;
  y: number;
  /** 구조도 위치 (%) */
  ax: number;
  ay: number;
  /** 모바일(1023px 이하) 구조도 위치 (%) — 가로 스크롤 대신 2단 세로 배치 */
  mx: number;
  my: number;
  /** 주방 화면에서 숨김 (구조도에서만 등장) */
  archOnly?: boolean;
  /** 이 장비가 속한 기능 그룹 — WHY 장면 강조에 사용 */
  groups: string[];
}

export const devices: Device[] = [
  { id: 'radar', name: 'Radar 센서', role: '조리원 부재 감지', img: radar, tier: 'device', x: 43.5, y: 29.5, ax: 14, ay: 76, mx: 16, my: 68, groups: ['fire', 'patent'] },
  { id: 'ir', name: '적외선(IR) 온도계', role: '조리기구 과열 감지', img: ir, tier: 'device', x: 61.5, y: 29.5, ax: 26, ay: 76, mx: 38, my: 68, groups: ['fire', 'patent'] },
  { id: 'valve', name: '가스 밸브 차단기', role: '가스 자동 차단', img: valve, tier: 'device', x: 66.5, y: 85, ax: 38, ay: 76, mx: 16, my: 89, groups: ['fire'] },
  { id: 'light', name: '경광등·경고음', role: '현장 경보', img: light, tier: 'device', x: 76, y: 36, ax: 50, ay: 76, mx: 38, my: 89, groups: ['fire'] },
  { id: 'air', name: 'IoT 공기질 측정기', role: '미세먼지·유해가스 측정', img: air, tier: 'device', x: 25, y: 47, ax: 66, ay: 76, mx: 64, my: 68, groups: ['air'] },
  { id: 'fan', name: '환풍기', role: '자동 환기', img: fan, tier: 'device', x: 71, y: 18, ax: 79, ay: 76, mx: 86, my: 68, groups: ['air'] },
  { id: 'purifier', name: '공기청정 살균기', role: '공기 정화', img: purifier, tier: 'device', x: 80, y: 66, ax: 92, ay: 76, mx: 75, my: 89, groups: ['air'] },
  { id: 'controller', name: '컨트롤러', role: '위험 판단·자동 제어', img: controller, tier: 'network', x: 73, y: 54, ax: 32, ay: 49, mx: 27, my: 46, groups: ['fire', 'patent', 'net'] },
  { id: 'gateway', name: 'IoT 게이트웨이', role: '데이터 전송', img: gateway, tier: 'network', x: 80, y: 54, ax: 79, ay: 49, mx: 75, my: 46, groups: ['air', 'net'] },
  { id: 'server', name: 'ALLSAFER 운영 서버', role: '데이터 저장·이력 관리', img: server, tier: 'platform', x: 50, y: 50, ax: 55, ay: 28, mx: 50, my: 26, archOnly: true, groups: ['net'] },
  { id: 'dashboard', name: 'PC·모바일 관제', role: '실시간 모니터링·알림', img: dashboard, tier: 'service', x: 50, y: 50, ax: 55, ay: 9, mx: 50, my: 8, archOnly: true, groups: ['net'] },
];

/** 구조도의 단계 라벨 (Device → Network → Platform → Service) */
export const tiers: { id: DeviceTier; label: string; en: string; y: number }[] = [
  { id: 'service', label: '서비스', en: 'Service', y: 9 },
  { id: 'platform', label: '플랫폼', en: 'Platform', y: 28 },
  { id: 'network', label: '판단·통신', en: 'Network', y: 49 },
  { id: 'device', label: '현장 장비', en: 'Device', y: 76 },
];

/** 구조도의 연결선 — [from, to, 라벨] */
export const links: [string, string, string?][] = [
  ['radar', 'controller'],
  ['ir', 'controller', 'RS-485'],
  ['valve', 'controller'],
  ['light', 'controller'],
  ['air', 'gateway'],
  ['fan', 'gateway'],
  ['purifier', 'gateway'],
  ['controller', 'gateway', 'LAN'],
  ['gateway', 'server', 'Ethernet / WiFi / LTE'],
  ['server', 'dashboard'],
];

/** 관제 대상 조리기구(메인 솥) 위치 — 온도 태그 기준점 */
export const kettle = { x: 55, y: 62 };

/**
 * 주방 미디어.
 * video.src 를 채우면 일러스트 대신 실제 주방 영상이 재생됩니다(데스크톱, 모션 허용 환경만).
 * poster 는 저사양·모바일·reduced-motion 환경과 영상 로딩 전에 표시됩니다.
 * 파일은 /public/media 에 넣으세요. 권장: 1920×1200, H.264 MP4 + WebM, 8초 내외 루프, 3MB 이하.
 */
/**
 * 실사 원테이크 영상 (첫 화면 ~ 작동 과정).
 * 스크롤 위치에 맞춰 앞뒤로 재생되므로 모든 프레임이 키프레임(-g 1)인 H.264 mp4 를 사용합니다.
 * 교체 시 같은 길이·구성으로 다시 인코딩하고, content.ts 의 각 Step film: [시작, 끝] 구간을 맞추세요.
 *   ffmpeg -i src.mp4 -c:v libx264 -crf 20 -g 5 -bf 0 -an -movflags +faststart kitchen-film-1080.mp4
 * loop: 첫 화면에서 스크롤 전 반복 재생되는 5초 영상(같은 카메라 위치에서 국 끓음·증기·LED만 움직임)
 */
export const film = {
  src: '/media/kitchen-film-1080.mp4?v=1610',      // 데스크톱 (1920×1080)
  srcSmall: '/media/kitchen-film-720.mp4?v=1610',  // 모바일·태블릿 (1280×720)
  /** H.264 를 재생하지 못하는 브라우저용 (VP9) */
  webm: '/media/kitchen-film-1080.webm?v=1610',
  webmSmall: '/media/kitchen-film-720.webm?v=1610',
  loop: '/media/hero-loop-1080.mp4?v=1610',
  loopSmall: '/media/hero-loop-720.mp4?v=1610',
  loopWebm: '/media/hero-loop-1080.webm?v=1610',
  loopWebmSmall: '/media/hero-loop-720.webm?v=1610',
  poster: '/media/kitchen-film-poster.webp?v=1610',
  posterFallback: '/media/kitchen-film-poster.jpg',
  duration: 22.4,
  alt: '단체급식 주방의 대형 국솥 위에 설치된 적외선 온도계가 과열을 감지하고, 가스 밸브 차단과 경광등 작동 후 관리자가 스마트폰으로 상태를 확인하는 장면',
};

export const kitchenMedia = {
  video: {
    mp4: '', // 예: '/media/kitchen-hero.mp4'
    webm: '', // 예: '/media/kitchen-hero.webm'
  },
  poster: '', // 예: '/media/kitchen-hero-poster.avif'
  alt: '단체급식 주방에서 대형 회전식 국솥으로 조리하는 모습',
};
