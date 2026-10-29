/**
 * Scroll Story Engine
 *
 * 화면 중앙선을 지난 마지막 Step 을 "현재 Step" 으로 보고,
 * 그 Step 의 data-view / data-flags / data-focus 를 .story 루트에 기록합니다.
 * 실제 시각 변화는 모두 CSS(stage.css)가 담당하므로 스크립트는 상태만 바꿉니다.
 *
 * - 스크롤 핸들러는 passive + requestAnimationFrame 으로 한 프레임에 한 번만 계산
 * - 레이아웃을 바꾸는 쓰기는 상태가 바뀔 때만 수행
 * - JS 가 없거나 실패해도 모든 텍스트는 그대로 읽힙니다
 */

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 2);

const TEMP_MIN = 100;
const TEMP_MAX = 260;

import { initFilm } from './film';

export function initStory(root: HTMLElement) {
  const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-step]'));
  if (!steps.length) return;

  const devices = Array.from(root.querySelectorAll<HTMLElement>('[data-device]'));
  const links = Array.from(root.querySelectorAll<SVGElement>('.arch-link'));
  const tempEl = root.querySelector<HTMLElement>('[data-temp]');
  const tempTag = root.querySelector<HTMLElement>('.temp-tag');

  let active: HTMLElement | null = null;
  let lastFlags = '';
  let lastTemp = -1;
  let ticking = false;
  // 데스크톱은 화면 중앙, 모바일은 텍스트 카드가 화면 하단에 들어올 때 전환
  const mobile = window.matchMedia('(max-width: 1023px)');

  const resolveFocus = (tokens: string[]) => {
    const all = tokens.includes('*');
    const groups = tokens.filter((t) => t.startsWith('g:')).map((t) => t.slice(2));
    const on = new Set<string>();
    devices.forEach((el) => {
      const id = el.dataset.device!;
      const g = (el.dataset.groups || '').split(' ');
      const hit = all || tokens.includes(id) || g.some((x) => groups.includes(x));
      el.classList.toggle('is-focus', hit);
      if (hit) on.add(id);
    });
    links.forEach((el) => {
      el.classList.toggle('is-focus', on.has(el.dataset.a!) && on.has(el.dataset.b!));
    });
  };

  type Part = { flags: string[]; focus?: string[]; temp?: [number, number] };
  const cycles = new Map<HTMLElement, Part[]>();
  const cycleOf = (step: HTMLElement): Part[] | null => {
    if (!step.dataset.cycle) return null;
    if (!cycles.has(step)) {
      try {
        cycles.set(step, JSON.parse(step.dataset.cycle));
      } catch {
        cycles.set(step, []);
      }
    }
    const c = cycles.get(step)!;
    return c.length ? c : null;
  };
  let activeKey = '';
  const film = initFilm(root);

  const apply = (step: HTMLElement, p: number) => {
    // 0) 한 Step 안의 구간(cycle) — 진행률로 현재 구간과 구간 내 진행률 계산
    const cycle = cycleOf(step);
    let part = 0;
    let pp = p;
    if (cycle) {
      const n = cycle.length;
      part = Math.min(n - 1, Math.floor(p * n));
      pp = clamp(p * n - part);
    }
    const src = cycle ? cycle[part] : null;
    const focus = src?.focus ?? (step.dataset.focus || '').split(' ').filter(Boolean);
    const baseFlags = src ? [...src.flags] : (step.dataset.flags || '').split(' ').filter(Boolean);
    const temp = src ? src.temp : step.dataset.temp?.split(',').map(Number);

    // 1) Step / 구간 변경
    const key = `${step.id}:${part}`;
    if (key !== activeKey) {
      activeKey = key;
      root.dataset.view = step.dataset.view || 'kitchen';
      root.dataset.layout = step.dataset.layout || 'split-left';
      resolveFocus(focus);
      if (cycle) step.dataset.sub = String(part);
      if (step !== active) {
        active = step;
        steps.forEach((s) => s.classList.toggle('is-active', s === step));
      }
    }

    // 2) 진행률 기반 파생 플래그
    if (baseFlags.includes('haze')) baseFlags.push(pp < 0.5 ? 'air-bad' : 'air-recover');
    const flags = baseFlags.join(' ');
    if (flags !== lastFlags) {
      root.dataset.flags = flags;
      lastFlags = flags;
    }
    root.style.setProperty('--sp', pp.toFixed(3));

    // 3) 실사 영상 구간 — Step 진행률에 맞춰 스크럽
    const fr = step.dataset.film?.split(',').map(Number);
    if (film && fr && fr.length === 2) {
      // 첫 장면은 페이지 맨 위(스크롤 0)에서 정확히 0초가 되도록 — 대기 반복 영상과 같은 카메라 위치
      let pf = p;
      if (step === steps[0]) {
        const line = window.innerHeight * (mobile.matches ? 0.8 : 0.5);
        pf = clamp(window.scrollY / Math.max(1, step.offsetTop + step.offsetHeight - line));
        root.style.setProperty('--hp', pf.toFixed(3));
      }
      film.setTarget(fr[0] + (fr[1] - fr[0]) * pf);
    }

    // 4) 실시간 온도
    if (temp && temp.length === 2 && tempEl && tempTag) {
      const t = Math.round(temp[0] + (temp[1] - temp[0]) * ease(clamp(pp * 1.4)));
      if (t !== lastTemp) {
        lastTemp = t;
        tempEl.textContent = String(t);
        tempTag.style.setProperty('--tp', `${clamp((t - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * 100}%`);
      }
    }
  };

  const update = () => {
    ticking = false;
    const line = window.innerHeight * (mobile.matches ? 0.8 : 0.5);
    let current = steps[0];
    let rect = current.getBoundingClientRect();
    for (const s of steps) {
      const r = s.getBoundingClientRect();
      if (r.top <= line) {
        current = s;
        rect = r;
      } else break;
    }
    const p = clamp((line - rect.top) / Math.max(rect.height, 1));
    apply(current, p);
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  root.classList.add('is-ready');
  update();
}

/**
 * Hero 주방 영상 — 데스크톱 + 모션 허용 + 데이터 절약 모드가 아닐 때만 불러옵니다.
 * 그 외 환경에서는 poster(또는 일러스트)가 그대로 표시됩니다.
 */
export function initKitchenVideo(root: HTMLElement) {
  const video = root.querySelector<HTMLVideoElement>('video[data-autoplay]');
  if (!video) return;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  const ok =
    window.matchMedia('(min-width: 1024px)').matches && Boolean(nav);
  if (!ok) return;

  video.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((s) => {
    s.src = s.dataset.src!;
  });
  video.load();
  video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
  video.play().catch(() => {
    /* 자동재생이 막힌 환경은 poster 유지 */
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else video.play().catch(() => {});
  });
}
