// The landing's two behaviours, ported from the Rails Stimulus controllers
// (word_rotate and lazy_video).

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

for (const element of document.querySelectorAll<HTMLElement>("[data-rotate-words]")) {
  const words: string[] = JSON.parse(element.dataset.rotateWords ?? "[]");
  const interval = Number(element.dataset.rotateInterval ?? 3000);
  let index = 0;

  setInterval(() => {
    element.classList.remove("is-visible");
    element.classList.add("is-out");

    setTimeout(() => {
      index = (index + 1) % words.length;
      element.textContent = words[index];
      element.classList.remove("is-out");
      element.classList.add("is-in");

      void element.offsetHeight;
      element.classList.remove("is-in");
      element.classList.add("is-visible");
    }, 300);
  }, interval);
}

// Off-screen videos download nothing until the visitor scrolls near them.
function load(video: HTMLVideoElement) {
  if (video.src) return;
  video.src = video.dataset.lazySrc!;
  video.load();
  video.play().catch(() => {});
}

const videos = document.querySelectorAll<HTMLVideoElement>("video[data-lazy-src]");

if (!reducedMotion) {
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          load(entry.target as HTMLVideoElement);
        }
      },
      { rootMargin: "300px" },
    );
    videos.forEach((video) => observer.observe(video));
  } else {
    videos.forEach(load);
  }
}
