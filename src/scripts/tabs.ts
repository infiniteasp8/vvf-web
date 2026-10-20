/**
 * Accessible tabs (WAI-ARIA Authoring Practices). Works for horizontal tab
 * strips and the vertical day timeline alike. Without JavaScript every
 * panel stays visible, so nothing is lost.
 */
export function initTabs(): void {
  document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((root) => {
    const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const panels = tabs.map((tab) => {
      const id = tab.getAttribute('aria-controls');
      return id ? document.getElementById(id) : null;
    });
    if (tabs.length === 0) return;

    const list = root.querySelector('[role="tablist"]');
    const vertical = list?.getAttribute('aria-orientation') === 'vertical';

    function select(index: number, focus: boolean): void {
      tabs.forEach((tab, i) => {
        const on = i === index;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        const panel = panels[i];
        if (panel) panel.hidden = !on;
        if (on && focus) tab.focus();
      });
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(i, false));
      tab.addEventListener('keydown', (event) => {
        const prevKey = vertical ? 'ArrowUp' : 'ArrowLeft';
        const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';
        let next: number | null = null;
        if (event.key === nextKey) next = (i + 1) % tabs.length;
        else if (event.key === prevKey) next = (i - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        if (next !== null) {
          event.preventDefault();
          select(next, true);
        }
      });
    });

    select(0, false);
  });
}
