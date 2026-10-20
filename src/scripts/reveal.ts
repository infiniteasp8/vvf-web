/**
 * Scroll-reveal fallback for browsers without scroll-driven animations.
 * Browsers that support `animation-timeline: view()` need no JavaScript.
 */
export function initReveal(): void {
  const supported =
    typeof CSS !== 'undefined' && CSS.supports && CSS.supports('animation-timeline: view()');
  if (supported) return;

  const targets = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
  if (targets.length === 0) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const viewportHeight = window.innerHeight;
  targets.forEach((el) => {
    if (el.getBoundingClientRect().top < viewportHeight) el.classList.add('is-in');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  );
  targets.forEach((el) => {
    if (!el.classList.contains('is-in')) observer.observe(el);
  });
}
