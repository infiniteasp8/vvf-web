/**
 * The arrival sequence: a lamp lights, the horizon draws, the sun rises, the
 * mantra appears, and the curtain lifts onto the hero. Plays once per browser
 * session, is skippable, and never runs for people who prefer reduced motion.
 * The whole animation is CSS; this script only decides whether to show it.
 */
const SEEN_KEY = 'vvf-arrival-seen';

export function initArrival(): void {
  const overlay = document.querySelector<HTMLElement>('[data-intro]');
  if (!overlay) return;

  const html = document.documentElement;
  const template = overlay.cloneNode(true) as HTMLElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current: HTMLElement | null = overlay;

  if (reduced || hasSeen()) {
    dismiss('off');
  } else {
    play(overlay);
  }

  document.querySelectorAll<HTMLButtonElement>('[data-intro-replay]').forEach((button) => {
    button.addEventListener('click', replay);
  });

  function play(el: HTMLElement): void {
    current = el;
    html.dataset.arrival = 'on';
    remember();
    el.querySelector<HTMLButtonElement>('[data-intro-skip]')?.addEventListener('click', () =>
      dismiss('off'),
    );
    el.addEventListener('animationend', (event) => {
      // The curtain keyframe is on the overlay itself; children animate too.
      if (event.target === el) dismiss('done');
    });
    document.addEventListener('keydown', onEscape);
  }

  function onEscape(event: KeyboardEvent): void {
    if (event.key === 'Escape' && html.dataset.arrival === 'on') dismiss('off');
  }

  function dismiss(state: 'off' | 'done'): void {
    current?.remove();
    current = null;
    html.dataset.arrival = state;
    document.removeEventListener('keydown', onEscape);
  }

  function replay(): void {
    dismiss('off');
    // Restart the hero entrance so it rises again behind the curtain.
    document
      .querySelectorAll<HTMLElement>('[data-hero-rise], [data-hero-rise] .rise')
      .forEach((el) => {
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = '';
      });
    const fresh = template.cloneNode(true) as HTMLElement;
    document.body.prepend(fresh);
    window.scrollTo({ top: 0, behavior: 'auto' });
    requestAnimationFrame(() => play(fresh));
  }
}

function hasSeen(): boolean {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function remember(): void {
  try {
    window.sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    // Private mode or storage disabled: the sequence simply plays again next time.
  }
}
