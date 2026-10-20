/** Mobile navigation drawer. */
export function initNav(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!toggle || !nav) return;

  const label = toggle.querySelector<HTMLElement>('[data-nav-label]');
  const iconOpen = toggle.querySelector<SVGElement>('.nav-icon-open');
  const iconClose = toggle.querySelector<SVGElement>('.nav-icon-close');

  function setOpen(open: boolean): void {
    if (!toggle || !nav) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    iconOpen?.classList.toggle('hidden', open);
    iconClose?.classList.toggle('hidden', !open);
    if (label) {
      label.textContent = open ? label.dataset.labelClose || '' : label.dataset.labelOpen || '';
    }
  }

  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!nav.classList.contains('is-open')) return;
    const target = event.target as Node;
    if (!nav.contains(target) && !toggle.contains(target)) setOpen(false);
  });

  // Close the drawer when the viewport grows into the desktop layout.
  const desktop = window.matchMedia('(min-width: 64rem)');
  desktop.addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}
