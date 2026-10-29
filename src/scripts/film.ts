import { prepareScrubVideo } from './video-prime';
/**
 * Scroll-scrubbed film
 *
 * story.ts 가 현재 Step 의 film 구간과 진행률로 목표 시간을 정하면,
 * 이 모듈이 영상의 currentTime 을 부드럽게 따라가게 합니다.
 * - 첫 화면 렌더링을 막지 않도록 페이지 로드 후 영상을 불러옵니다.
 * - 화면 폭에 따라 720p / 480p 를 선택합니다.
 * - 데이터 절약 모드에서는 불러오지 않고 포스터만 보여줍니다.
 */
export interface FilmController {
  setTarget(seconds: number): void;
}

export function initFilm(root: HTMLElement): FilmController | null {
  const video = root.querySelector<HTMLVideoElement>('.film-video');
  if (!video) return null;

  const duration = Number(video.dataset.duration || 0);
  let target = 0;
  let shown = -1;
  let ready = false;
  let raf = 0;

  const load = () => {
    const small = window.matchMedia('(max-width: 1023px)').matches;
    const mp4 = video.canPlayType('video/mp4; codecs="avc1.42E01E"') !== '';
    const d = video.dataset;
    video.src = (mp4 ? (small ? d.srcSmall : d.src) : (small ? d.webmSmall : d.webm)) || '';
    video.preload = 'auto';
    video.load();
  };

  prepareScrubVideo(video, () => {
    ready = true;
    root.classList.add('film-ready');
    tick();
  });
  video.addEventListener('error', () => root.classList.remove('film-ready'));

  const tick = () => {
    raf = 0;
    if (!ready) return;
    // 부드럽게 따라가기 (빠른 스크롤에서도 끊김 없이)
    const next = shown < 0 ? target : shown + (target - shown) * 0.35;
    const done = Math.abs(target - next) < 0.012;
    const t = done ? target : next;
    if (!video.seeking && Math.abs(video.currentTime - t) > 0.008) {
      video.currentTime = Math.min(Math.max(t, 0), (video.duration || duration) - 0.05);
    }
    shown = t;
    if (!done) raf = requestAnimationFrame(tick);
  };

  if (document.readyState === 'complete') setTimeout(load, 200);
  else window.addEventListener('load', () => setTimeout(load, 200), { once: true });

  // ---------- 첫 화면 반복 영상 ----------
  const loopV = root.querySelector<HTMLVideoElement>('.film-loop');
  let idle = true;
  const syncLoop = () => {
    if (!loopV) return;
    root.classList.toggle('film-idle', idle);
    if (idle && document.visibilityState === 'visible') loopV.play().catch(() => {});
    else if (!loopV.paused) loopV.pause();
  };
  if (loopV) {
    loopV.muted = true; loopV.defaultMuted = true; loopV.playsInline = true;
    const small = window.matchMedia('(max-width: 1023px)').matches;
    const mp4 = loopV.canPlayType('video/mp4; codecs="avc1.42E01E"') !== '';
    const d = loopV.dataset;
    loopV.src = (mp4 ? (small ? d.srcSmall : d.src) : (small ? d.webmSmall : d.webm)) || '';
    loopV.preload = 'auto';
    loopV.addEventListener('playing', () => root.classList.add('film-loop-ready'), { once: true });
    document.addEventListener('visibilitychange', syncLoop);
    ['touchstart', 'pointerdown'].forEach((e) => window.addEventListener(e, () => idle && loopV.play().catch(() => {}), { passive: true }));
    syncLoop();
  }

  return {
    setTarget(seconds: number) {
      const nowIdle = seconds < 0.04;
      if (nowIdle !== idle) { idle = nowIdle; syncLoop(); }
      target = seconds;
      if (!raf) raf = requestAnimationFrame(tick);
    },
  };
}
