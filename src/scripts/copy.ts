/** Copy-to-clipboard buttons with a two-second "Copied" state. */
export function initCopy(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-copy]');
  if (buttons.length === 0) return;

  let status = document.getElementById('copy-status');
  if (!status) {
    status = document.createElement('div');
    status.id = 'copy-status';
    status.className = 'sr-only';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    document.body.appendChild(status);
  }

  buttons.forEach((button) => {
    let timer: number | undefined;
    button.addEventListener('click', async () => {
      const text = button.dataset.copy ?? '';
      const ok = await writeClipboard(text);
      if (!ok) return;

      const label = button.querySelector<HTMLElement>('[data-copy-label]');
      const done = button.dataset.labelDone ?? 'Copied';
      const idle = button.dataset.label ?? '';

      button.classList.add('is-done');
      button.querySelector('.copy-icon')?.classList.add('hidden');
      button.querySelector('.done-icon')?.classList.remove('hidden');
      if (label) label.textContent = done;
      else button.setAttribute('aria-label', done);
      if (status) status.textContent = done;

      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        button.classList.remove('is-done');
        button.querySelector('.copy-icon')?.classList.remove('hidden');
        button.querySelector('.done-icon')?.classList.add('hidden');
        if (label) label.textContent = idle;
        else button.setAttribute('aria-label', idle);
        if (status) status.textContent = '';
      }, 2000);
    });
  });
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}
