# 주방 영상 / 포스터

src/data/stage.ts 의 kitchenMedia 에 경로를 넣으면 적용됩니다.

- kitchen-hero.mp4  : H.264, 1920×1200(16:10), 6~10초 루프, 무음, 3MB 이하
- kitchen-hero.webm : VP9 동일 사양 (선택)
- kitchen-hero-poster.avif : 첫 프레임, 1920×1200, 200KB 이하 (LCP 이미지)

변환 예시 (ffmpeg):
  ffmpeg -i raw.mov -vf "scale=1920:1200:force_original_aspect_ratio=increase,crop=1920:1200" -an -c:v libx264 -crf 26 -preset slow -movflags +faststart kitchen-hero.mp4
  ffmpeg -i raw.mov -vf "scale=1920:1200:force_original_aspect_ratio=increase,crop=1920:1200" -an -c:v libvpx-vp9 -crf 36 -b:v 0 kitchen-hero.webm
  ffmpeg -i kitchen-hero.mp4 -frames:v 1 -c:v libaom-av1 -still-picture 1 kitchen-hero-poster.avif

영상을 쓰면 영상 속 실제 장비 위치에 맞춰 stage.ts 의 devices[].x / y 를 조정하세요.
