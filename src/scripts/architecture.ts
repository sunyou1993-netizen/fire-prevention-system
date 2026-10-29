/**
 * 시스템 구성도 — 현장 움직임 + 위험 이벤트 데모
 *  - canvas: 국물 표면의 작은 기포, 솥에서 올라오는 흰 증기 (화면에 보일 때만 그림)
 *  - 단계 루프: normal → rising → danger → response → recovery (data-phase)
 *    빨간 신호(SMIL animateMotion)는 해당 단계 시작 시 한 번씩 출발
 *  - 모든 기기·설정에서 같은 움직임 (화면 밖에서는 멈춤)
 */
interface Phase { id: string; dur: number }

export function initArchitecture() {
  const root = document.querySelector<HTMLElement>('[data-arch]');
  if (!root) return;
  const canvas = root.querySelector<HTMLCanvasElement>('[data-arch-fx]')!;
  const ctx = canvas.getContext('2d');
  const tempEl = root.querySelector<HTMLElement>('[data-arch-temp]');
  const tempState = root.querySelector<HTMLElement>('[data-arch-temp-state]');
  const phases: Phase[] = Array.from(root.querySelectorAll<HTMLElement>('[data-phase-id]')).map((el) => ({ id: el.dataset.phaseId!, dur: Number(el.dataset.dur) }));
  const phaseEls = Array.from(root.querySelectorAll<HTMLElement>('[data-phase-id]'));
  const pulses = new Map<string, SVGGElement>();
  root.querySelectorAll<SVGGElement>('[data-pulse]').forEach((g) => pulses.set(g.dataset.pulse!, g));
  const nodes = new Map<string, SVGCircleElement>();
  root.querySelectorAll<SVGCircleElement>('[data-node]').forEach((c) => nodes.set(c.dataset.node!, c));
  const lens = new Map<string, number>();
  root.querySelectorAll<SVGPathElement>('defs path[id^="ap-"]').forEach((p) => lens.set(p.id.slice(3), p.getTotalLength()));

  // ---------- 데이터 신호 ----------
  // 한 번에 1~2개의 짧은 빛만, 정해진 순서로 이동합니다. 도착하면 노드가 한 번 퍼집니다.
  const SPEED = 330; // px/s (이미지 좌표)
  const EASE = 'cubic-bezier(.45,.05,.3,1)';
  const run = (id: string, red = false, arrive?: string): Promise<void> => new Promise((done) => {
    const g = pulses.get(id), L = lens.get(id);
    if (!g || !L) return done();
    const seg = Math.min(70, L * 0.35);
    const dur = Math.max(450, (L / SPEED) * 1000);
    g.classList.toggle('is-red', red);
    g.querySelectorAll('use').forEach((u) => {
      u.style.strokeDasharray = `${seg} ${L + seg}`;
      u.animate([{ strokeDashoffset: seg, opacity: 0 }, { opacity: 1, offset: 0.12 }, { opacity: 1, offset: 0.85 }, { strokeDashoffset: -L, opacity: 0 }], { duration: dur, easing: EASE, fill: 'both' });
    });
    setTimeout(() => {
      if (arrive) nodes.get(arrive)?.animate([{ transform: 'scale(.4)', opacity: 0.9 }, { transform: 'scale(1.4)', opacity: 0 }], { duration: 700, easing: 'ease-out' });
      nodes.get(arrive || '')?.classList.toggle('is-red', red);
      done();
    }, dur * 0.88);
  });
  let flowBusy = false, airTurn = 0, sensorTurn = 0;
  const upstream = async (red = false) => {
    await run('ctrlGw', red, 'gateway');
    const srv = run('gwSrv', red, 'server');
    await new Promise((r) => setTimeout(r, ((lens.get('gwSrv') || 300) / SPEED) * 1000 * 0.45));
    await run('srvMon', red, 'monitor');
    await srv;
  };
  const normalFlow = async () => {
    if (flowBusy || !visible) return;
    flowBusy = true;
    const id = root.dataset.phase || 'normal';
    if (id === 'normal' || id === 'recovery') {
      if (airTurn++ % 3 === 2) {
        await run('airIn', false, 'controller');
        await Promise.all([run('ctrlFan', false, 'fan'), run('ctrlPur', false, 'purifier')]);
      } else {
        await run(sensorTurn++ % 2 ? 'ir' : 'radar', false, 'controller');
        await upstream();
      }
    }
    flowBusy = false;
  };
  setInterval(normalFlow, 600);
  const dangerFlow = async () => { await run('ir', true, 'controller'); };
  const responseFlow = async () => {
    await Promise.all([run('valve', true, 'valve'), run('beacon', true, 'beacon'), upstream(true)]);
  };

  // ---------- 단계 루프 ----------
  const total = phases.reduce((s, p) => s + p.dur, 0);
  let visible = false, clock = 0, last = 0, pi = -1;
  const enter = (i: number) => {
    pi = i;
    const id = phases[i].id;
    root.dataset.phase = id;
    phaseEls.forEach((el, k) => { el.classList.toggle('is-active', k === i); el.classList.toggle('is-done', k < i); });
    if (id === 'danger') dangerFlow();
    if (id === 'response') responseFlow();
  };
  const phaseAt = (t: number) => { let acc = 0; for (let i = 0; i < phases.length; i++) { if (t < acc + phases[i].dur) return [i, (t - acc) / phases[i].dur]; acc += phases[i].dur; } return [phases.length - 1, 1]; };

  // ---------- 국물 · 증기 ----------
  const W = 1672, H = 671;
  const SOUP = { x: 505, y: 302, rx: 100, ry: 30 };
  type Bub = { x: number; y: number; r: number; age: number; life: number };
  type Puff = { x: number; y: number; r: number; age: number; life: number; vx: number; vy: number; a: number };
  const bubbles: Bub[] = [], puffs: Puff[] = [];
  let scale = 1, heat = 0.35;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    scale = (r.width * dpr) / W;
  };
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  const inSoup = () => { const t = Math.random() * Math.PI * 2, k = Math.sqrt(Math.random()) * 0.85; return [SOUP.x + Math.cos(t) * SOUP.rx * k, SOUP.y + Math.sin(t) * SOUP.ry * k]; };

  // 열기: 솥 위 공기가 일렁이는 아지랑이 (이미지 일부를 가로로 미세하게 흔들어 다시 그림)
  const img = root.querySelector<HTMLImageElement>('.arch-img')!;
  const HZ = { x: 390, y: 120, w: 240, h: 190 };
  const haze = document.createElement('canvas'); haze.width = HZ.w; haze.height = HZ.h;
  const hctx = haze.getContext('2d');
  const drawHeat = (t: number) => {
    if (!ctx || !hctx || !img.complete || !img.naturalWidth) return;
    const sx = img.naturalWidth / W;
    hctx.globalCompositeOperation = 'source-over';
    hctx.clearRect(0, 0, HZ.w, HZ.h);
    const amp = 1.1 + heat * 1.9;
    for (let y = 0; y < HZ.h; y += 2) {
      const near = y / HZ.h; // 솥에 가까울수록 강하게
      const dx = Math.sin(y * 0.11 - t * 5.2) * amp * (0.35 + near) + Math.sin(y * 0.031 + t * 1.7) * amp * 0.5 * near;
      hctx.drawImage(img, (HZ.x) * sx, (HZ.y + y) * sx, HZ.w * sx, 2 * sx, dx, y, HZ.w, 2);
    }
    // 가장자리는 원본과 자연스럽게 섞이도록 둥글게 마스크
    hctx.globalCompositeOperation = 'destination-in';
    const m = hctx.createRadialGradient(HZ.w / 2, HZ.h * 0.78, 10, HZ.w / 2, HZ.h * 0.6, HZ.w * 0.55);
    m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)');
    hctx.fillStyle = m; hctx.fillRect(0, 0, HZ.w, HZ.h);
    ctx.globalAlpha = 1;
    ctx.drawImage(haze, HZ.x, HZ.y);
    // 국물 표면의 은은한 열기 (따뜻한 빛, 끓는 정도에 따라 숨쉬듯)
    const glow = ctx.createRadialGradient(SOUP.x, SOUP.y - 6, 4, SOUP.x, SOUP.y - 6, SOUP.rx * 1.15);
    const ga = 0.10 + heat * 0.16 + Math.sin(t * 2.2) * 0.03;
    glow.addColorStop(0, `rgba(255,150,70,${ga})`); glow.addColorStop(1, 'rgba(255,150,70,0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = glow; ctx.beginPath(); ctx.ellipse(SOUP.x, SOUP.y - 6, SOUP.rx * 1.15, SOUP.ry * 2.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  };

  const draw = (dt: number) => {
    if (!ctx) return;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, W, H);
    drawHeat(performance.now() / 1000);
    // 기포: 국물 위의 작은 고리가 부풀었다가 터짐 (붉은 계열, 은은하게)
    if (Math.random() < dt * (14 + heat * 30)) { const [x, y] = inSoup(); bubbles.push({ x, y, r: rnd(2, 4.5 + heat * 3), age: 0, life: rnd(0.5, 1.1) }); }
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i]; b.age += dt;
      const k = b.age / b.life; if (k >= 1) { bubbles.splice(i, 1); continue; }
      const r = b.r * (0.4 + k * 0.9);
      ctx.globalAlpha = Math.sin(k * Math.PI) * 0.55;
      ctx.beginPath(); ctx.ellipse(b.x, b.y, r, r * 0.42, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,170,120,0.35)'; ctx.fill();
      ctx.lineWidth = 0.9; ctx.strokeStyle = 'rgba(150,30,10,0.55)'; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(b.x - r * 0.3, b.y - r * 0.15, r * 0.28, r * 0.12, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,235,220,0.7)'; ctx.fill();
    }
    // 국물 표면의 느린 일렁임
    const t = performance.now() / 1000;
    ctx.globalAlpha = 0.12 + heat * 0.08;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(SOUP.x + Math.sin(t * 0.7 + i * 2) * 26, SOUP.y + Math.cos(t * 0.5 + i) * 6, 34 + i * 6, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 ? 'rgba(255,200,160,1)' : 'rgba(120,20,10,1)'; ctx.fill();
    }
    // 증기: 부드러운 흰 덩어리가 천천히 오르며 좌우로 흔들리고 흐려짐
    if (Math.random() < dt * (12 + heat * 12)) { const [x] = inSoup(); puffs.push({ x, y: SOUP.y - 8, r: rnd(14, 26), age: 0, life: rnd(2.6, 4.2), vx: rnd(-6, 6), vy: rnd(-34, -22), a: rnd(0.18, 0.34) + heat * 0.08 }); }
    for (let i = puffs.length - 1; i >= 0; i--) {
      const p = puffs[i]; p.age += dt;
      const k = p.age / p.life; if (k >= 1) { puffs.splice(i, 1); continue; }
      p.x += (p.vx + Math.sin(t * 0.9 + p.y * 0.04) * 9) * dt; p.y += p.vy * dt;
      const r = p.r * (1 + k * 1.8);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = p.a * Math.sin(Math.min(k * 1.6, 1) * Math.PI * 0.5) * (1 - k);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const setTemp = (id: string, k: number) => {
    let v = 186 + Math.sin(performance.now() / 900) * 2;
    if (id === 'rising') v = 188 + (231 - 188) * k * k;
    if (id === 'danger') v = 231;
    if (id === 'response') v = 231 - 18 * k;
    if (id === 'recovery') v = 213 - 25 * k;
    if (tempEl) tempEl.textContent = String(Math.round(v));
    if (tempState) tempState.textContent = id === 'danger' ? '위험 온도' : id === 'response' ? '가스 차단 · 온도 하강' : id === 'rising' ? (v >= 220 ? '위험 온도' : '상승 중') : '정상';
    heat = id === 'rising' ? 0.35 + 0.65 * k : id === 'danger' ? 1 : id === 'response' ? 1 - 0.5 * k : id === 'recovery' ? 0.5 - 0.15 * k : 0.35;
  };

  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    if (visible) {
      clock = (clock + dt) % total;
      const [i, k] = phaseAt(clock);
      if (i !== pi) enter(i);
      root.style.setProperty('--pk', k.toFixed(3));
      setTemp(phases[i].id, k);
      draw(dt);
    }
    requestAnimationFrame(frame);
  };

  new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting && e.intersectionRatio > 0.25); root.classList.toggle('is-live', visible); }, { threshold: [0, 0.25, 0.5] }).observe(root.querySelector('.arch-stage')!);
  window.addEventListener('resize', resize, { passive: true });
  resize();
  enter(0);
  requestAnimationFrame(frame);
}
