/**
 * 한 화면씩 넘기기 — 마우스 휠·트랙패드 한 번의 동작에 한 장면만 이동합니다.
 *  - 멈춤 지점: 각 장면(Step)의 시작, 상담 섹션, 페이지 끝.
 *    한 화면보다 긴 구간(사례 카드, 긴 정보 섹션)은 화면 높이의 90%씩 나눠 멈춥니다.
 *  - 이동은 0.9초 동안 부드럽게, 이동 중 들어오는 휠(트랙패드 관성 포함)은 무시합니다.
 *  - 터치 기기는 CSS scroll-snap(가까운 장면에 멈춤)을 씁니다 — styles/global.css
 */
export function initPageScroll() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  const DUR = 1250;           // 한 장면 이동 시간 (ms) — 천천히 시작해 천천히 멈춥니다
  const QUIET = 120;           // 이 시간 이상 휠이 끊기면 손동작이 끝난 것으로 봅니다 (ms)
  let points: number[] = [];
  let busy = false, lastWheel = 0;

  const measure = () => {
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    const tops = new Set<number>([0, max]);
    document.querySelectorAll<HTMLElement>('[data-step], #contact').forEach((el) => {
      tops.add(Math.round(el.getBoundingClientRect().top + window.scrollY));
    });
    const base = [...tops].filter((y) => y >= 0 && y <= max).sort((a, b) => a - b);
    const out: number[] = [];
    base.forEach((y, i) => {
      out.push(y);
      const next = base[i + 1];
      if (next === undefined) return;
      if (next - y <= vh * 1.3) return;   // 조금 긴 정도(아래 여백)는 한 번에 넘깁니다
      // 긴 구간: 90%씩 내려가고, 마지막은 구간 끝이 화면 아래에 맞도록
      for (let p = y + vh * 0.9; p < next - vh - 40; p += vh * 0.9) out.push(Math.round(p));
      out.push(Math.round(next - vh));
    });
    // 너무 가까운 멈춤 지점(화면의 30% 미만 간격)은 하나로 합칩니다 — 마지막(페이지 끝)은 유지
    const sorted = [...new Set(out)].sort((a, b) => a - b);
    points = [];
    for (const p of sorted) {
      const prev = points[points.length - 1];
      if (prev !== undefined && p - prev < vh * 0.3) {
        if (p === max) points[points.length - 1] = p;
        continue;
      }
      points.push(p);
    }
  };

  const ease = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
  const go = (to: number) => {
    const from = window.scrollY;
    if (Math.abs(to - from) < 2) return;
    busy = true;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / DUR);
      window.scrollTo({ top: from + (to - from) * ease(k), behavior: 'instant' as ScrollBehavior });
      if (k < 1) requestAnimationFrame(step);
      else busy = false;
    };
    requestAnimationFrame(step);
  };

  // ---------- 휠 · 트랙패드 ----------
  // 한 번의 손동작 = 한 장면. 이동이 끝난 뒤 이어지는 관성 휠은 무시하고,
  // 휠 세기가 다시 커지거나(새로 쓸어내림) 잠깐 멈춘 뒤 들어오는 휠만 다음 장면으로 넘깁니다.
  let tail = false;            // 직전 이동의 관성 꼬리를 무시하는 중
  const THRESHOLD = 90;        // 한 장면을 넘기는 데 필요한 휠 이동량 (마우스 휠 한 칸 ≈ 100)
  let acc = 0, accDir = 0;
  let lastAbs = 0;
  const page = (dir: number) => {
    measure();
    const y = window.scrollY;
    const target = dir > 0 ? points.find((p) => p > y + 4) : [...points].reverse().find((p) => p < y - 4);
    if (target !== undefined) go(target);
    tail = true;
  };
  window.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey) return;                                   // 확대/축소
      if ((e.target as HTMLElement).closest('textarea, select, [data-scroll-free]')) return;
      e.preventDefault();                                      // 브라우저 기본 스크롤은 항상 막음 (대각선·가로 휠 포함)
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;
      else if (e.deltaMode === 2) dy *= window.innerHeight;
      const abs = Math.abs(dy);
      if (abs < 1) return;
      const now = performance.now();
      const gap = now - lastWheel;
      lastWheel = now;
      const rising = abs > lastAbs * 1.6 + 3;                  // 관성은 점점 약해지므로, 세기가 커지면 새 동작
      lastAbs = abs;
      if (busy) return;
      if (tail && gap < QUIET && !rising) return;
      // 살짝 건드린 정도로는 넘어가지 않도록, 한 동작 안에서 일정 거리 이상 굴렸을 때만 넘깁니다
      const dir = Math.sign(dy);
      if (tail || gap >= QUIET || dir !== accDir) { acc = 0; accDir = dir; }
      tail = false;
      acc += abs;
      if (acc < THRESHOLD) return;
      acc = 0;
      page(dir);
    },
    { passive: false },
  );

  // ---------- 키보드 ----------
  window.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    if (e.altKey || e.ctrlKey || e.metaKey || t.closest('input, textarea, select, [contenteditable]')) return;
    const down = ['PageDown', 'ArrowDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey);
    const up = ['PageUp', 'ArrowUp'].includes(e.key) || (e.key === ' ' && e.shiftKey);
    if (!down && !up) return;
    e.preventDefault();
    if (!busy) page(down ? 1 : -1);
  });

  let rt = 0;
  const remeasure = () => { clearTimeout(rt); rt = window.setTimeout(measure, 200); };
  window.addEventListener('resize', remeasure);
  window.addEventListener('load', measure);
  new ResizeObserver(remeasure).observe(document.body);
  measure();
}
