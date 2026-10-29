/**
 * 스크롤로 재생 위치를 바꾸는 영상(스크럽)을 모든 기기에서 같은 방식으로 준비합니다.
 * iOS Safari·일부 Android 브라우저는 영상을 한 번도 재생하지 않으면 데이터를 받지 않거나
 * currentTime 을 바꿔도 화면을 갱신하지 않습니다. 그래서 음소거 인라인 재생을 한 번 시작했다가
 * 바로 멈추고(prime), 그 뒤부터 스크롤로 위치를 조절합니다.
 */
export function prepareScrubVideo(video: HTMLVideoElement, onReady: () => void) {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  let ready = false;
  const mark = () => {
    if (ready) return;
    ready = true;
    onReady();
  };
  video.addEventListener('loadeddata', mark);
  video.addEventListener('canplay', mark);
  let primed = false;
  const prime = () => {
    if (primed || !video.src) return;
    const p = video.play();
    if (p && typeof p.then === 'function') {
      p.then(() => {
        primed = true;
        video.pause();
        mark();
      }).catch(() => {
        /* 자동 재생이 막힌 경우: 첫 터치·클릭 때 다시 시도 */
      });
    }
  };
  video.addEventListener('loadedmetadata', prime);
  const gesture = () => prime();
  ['touchstart', 'pointerdown', 'keydown'].forEach((e) => window.addEventListener(e, gesture, { passive: true }));
  return prime;
}
