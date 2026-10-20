import { initReveal } from './reveal';
import { initNav } from './nav';
import { initCopy } from './copy';
import { initTabs } from './tabs';
import { initCarousel } from './carousel';
import { initArrival } from './arrival';
import { initFilms } from './films';

// Mark elements already in view before the no-js class goes, so nothing blinks.
initReveal();
document.documentElement.classList.remove('no-js');

initNav();
initCopy();
initTabs();
initCarousel();
initFilms();
initArrival();
