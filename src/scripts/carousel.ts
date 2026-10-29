/**
 * Scroll-linked card carousel (데스크톱)
 * 섹션 높이만큼 세로로 스크롤하는 동안 카드 트랙이 가로로 이동합니다.
 * 모바일(1023px 이하) 에서는 CSS 가로 스크롤(스와이프)로 동작하고 이 스크립트는 쉽니다.
 */
export function initCarousel(root: HTMLElement) {
  const pin = root.querySelector<HTMLElement>('[data-carousel]');
  const track = root.querySelector<HTMLElement>('[data-track]');
  const bar = root.querySelector<HTMLElement>('[data-progress]');
  if (!pin || !track) return;
  const step = pin.closest<HTMLElement>('[data-step]');
  if (!step) return;

  const desktop = window.matchMedia('(min-width: 1024px)');
  let ticking = false;
  let dist = 0;

  const measure = () => {
    const vp = track.parentElement!.clientWidth;
    dist = Math.max(0, track.scrollWidth - vp);
    // 섹션 높이 = 한 화면 + 가로 이동 거리 (가로 1px 당 세로 1px)
    step.style.setProperty('--cc-scroll', `${dist}px`);
  };

  const update = () => {
    ticking = false;
    if (!desktop.matches) {
      track.style.transform = '';
      if (bar) bar.style.transform = '';
      return;
    }
    const r = step.getBoundingClientRect();
    const total = Math.max(1, r.height - window.innerHeight);
    const p = Math.min(1, Math.max(0, -r.top / total));
    track.style.transform = `translate3d(${-p * dist}px,0,0)`;
    track.style.setProperty('--p', p.toFixed(3));
    if (bar) bar.style.transform = `scaleX(${0.08 + p * 0.92})`;
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  measure();
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measure(); onScroll(); }, { passive: true });
  window.addEventListener('load', () => { measure(); onScroll(); }, { once: true });
}
