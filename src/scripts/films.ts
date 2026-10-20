/** Replace a film poster with its embedded player when the play button is pressed. */
export function initFilms(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-film-play]').forEach((button) => {
    button.addEventListener('click', () => {
      const src = button.dataset.src;
      const host = button.closest<HTMLElement>('[data-film]');
      if (!src || !host) return;
      const frame = document.createElement('iframe');
      frame.src = `${src}${src.includes('?') ? '&' : '?'}autoplay=1`;
      frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      frame.setAttribute('allowfullscreen', '');
      frame.setAttribute('title', button.textContent?.trim() || 'Film');
      host.replaceChildren(frame);
    });
  });
}
