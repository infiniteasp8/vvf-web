/** One-slide-at-a-time carousel with dots, arrows and gentle autoplay. */
export function initCarousel(): void {
  document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((root) => {
    const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-slide]'));
    const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-dot]'));
    const prev = root.querySelector<HTMLButtonElement>('[data-prev]');
    const next = root.querySelector<HTMLButtonElement>('[data-next]');
    if (slides.length < 2) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let index = 0;
    let timer: number | undefined;
    let paused = false;

    function show(i: number): void {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, n) => {
        slide.hidden = n !== index;
      });
      dots.forEach((dot, n) => dot.setAttribute('aria-pressed', String(n === index)));
    }

    function stop(): void {
      window.clearInterval(timer);
      timer = undefined;
    }

    function start(): void {
      if (reduced || timer !== undefined) return;
      timer = window.setInterval(() => {
        if (!paused) show(index + 1);
      }, 7000);
    }

    prev?.addEventListener('click', () => {
      show(index - 1);
      stop();
    });
    next?.addEventListener('click', () => {
      show(index + 1);
      stop();
    });
    dots.forEach((dot, n) =>
      dot.addEventListener('click', () => {
        show(n);
        stop();
      }),
    );

    root.addEventListener('mouseenter', () => (paused = true));
    root.addEventListener('mouseleave', () => (paused = false));
    root.addEventListener('focusin', () => (paused = true));
    root.addEventListener('focusout', () => (paused = false));
    document.addEventListener('visibilitychange', () => {
      paused = document.hidden;
    });

    show(0);
    start();
  });
}
