const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');
const projectToggles = document.querySelectorAll('.project-toggle');
const revealItems = document.querySelectorAll('.reveal');
const themeToggle = document.querySelector('[data-theme-toggle]');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const aboutGrid = document.querySelector('.about-grid');
const aboutHeadlineLines = document.querySelectorAll('.about-lead h2 span');

const setProjectOpen = (toggle, isOpen, updateUrl = false) => {
  const details = document.getElementById(toggle.getAttribute('aria-controls'));
  const project = toggle.closest('.project');
  if (!details || !project) return;

  toggle.setAttribute('aria-expanded', String(isOpen));
  details.classList.toggle('is-open', isOpen);
  if (isOpen) project.classList.add('is-visible');
  details.setAttribute('aria-hidden', String(!isOpen));
  details.inert = !isOpen;
  toggle.querySelector('span:first-child').textContent = isOpen
    ? 'Close the case study'
    : 'Explore the case study';

  if (updateUrl) {
    const nextHash = isOpen ? `#${project.id}` : '#work';
    history.replaceState(null, '', nextHash);
  }
};

const syncAboutHeadlineWidth = () => {
  if (!aboutGrid || !aboutHeadlineLines.length) return;

  const headlineWidth = Math.max(
    ...Array.from(aboutHeadlineLines, (line) => Math.ceil(line.getBoundingClientRect().width)),
  );

  if (headlineWidth > 0) {
    aboutGrid.style.setProperty('--about-measured-copy-width', `${headlineWidth}px`);
  }
};

const setTheme = (theme) => {
  const nextTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = nextTheme;

  if (themeToggle) {
    const isDark = nextTheme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', nextTheme === 'dark' ? '#131610' : '#F0EEEA');
  }
};

setTheme(document.documentElement.dataset.theme);

themeToggle?.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);

  try {
    localStorage.setItem('portfolio-theme', nextTheme);
  } catch {
    // Theme persistence is a nice-to-have, not required for the toggle to work.
  }
});

requestAnimationFrame(syncAboutHeadlineWidth);
window.addEventListener('resize', syncAboutHeadlineWidth, { passive: true });

if (document.fonts?.ready) {
  document.fonts.ready.then(syncAboutHeadlineWidth);
}

const updateHeader = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 24);
};

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  siteNav.classList.toggle('is-open', !isOpen);
  document.body.style.overflow = isOpen ? '' : 'hidden';
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    siteNav.classList.remove('is-open');
    document.body.style.overflow = '';
  });
});

projectToggles.forEach((toggle) => {
  setProjectOpen(toggle, false);
  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setProjectOpen(toggle, !isOpen, true);
  });
});

const openProjectFromHash = () => {
  const hashId = decodeURIComponent(window.location.hash.slice(1));
  const project = hashId ? document.getElementById(hashId) : null;
  const toggle = project?.matches('.project') ? project.querySelector('.project-toggle') : null;
  if (toggle) setProjectOpen(toggle, true);
};

openProjectFromHash();
window.addEventListener('hashchange', openProjectFromHash);

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;

  if (menuToggle?.getAttribute('aria-expanded') === 'true') {
    menuToggle.setAttribute('aria-expanded', 'false');
    siteNav.classList.remove('is-open');
    document.body.style.overflow = '';
    menuToggle.focus();
  }
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

document.querySelector('[data-year]').textContent = new Date().getFullYear();

// The project directory is a disclosure: normal links retain keyboard navigation.
const projectIndexToggle = document.querySelector('.project-index-toggle');
const projectIndexDropdown = document.querySelector('.project-index-dropdown');
const closeProjectIndex = (restoreFocus = false) => {
  projectIndexDropdown.hidden = true;
  projectIndexToggle.setAttribute('aria-expanded', 'false');
  projectIndexToggle.setAttribute('aria-label', 'Open project menu');
  if (restoreFocus) projectIndexToggle.focus();
};
projectIndexToggle.addEventListener('click', () => {
  const opening = projectIndexDropdown.hidden;
  projectIndexDropdown.hidden = !opening;
  projectIndexToggle.setAttribute('aria-expanded', String(opening));
  projectIndexToggle.setAttribute('aria-label', opening ? 'Close project menu' : 'Open project menu');
});
projectIndexDropdown.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeProjectIndex()));
document.addEventListener('click', event => {
  if (!projectIndexDropdown.contains(event.target) && !projectIndexToggle.contains(event.target)) closeProjectIndex();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !projectIndexDropdown.hidden) closeProjectIndex(true);
});

const quickTop = document.querySelector('.quick-top');
let quickTopTimer;
let quickTopFadeTimer;
const hideQuickTop = () => {
  if (quickTop.matches(':hover, :focus')) return;
  quickTop.classList.remove('is-visible');
  quickTopFadeTimer = setTimeout(() => { quickTop.hidden = true; }, 200);
};
const showQuickTop = () => {
  clearTimeout(quickTopTimer);
  clearTimeout(quickTopFadeTimer);
  quickTop.hidden = false;
  requestAnimationFrame(() => quickTop.classList.add('is-visible'));
  quickTopTimer = setTimeout(hideQuickTop, 2000);
};
window.addEventListener('scroll', showQuickTop, { passive: true });
window.addEventListener('pointermove', showQuickTop, { passive: true });
quickTop.addEventListener('mouseenter', () => { clearTimeout(quickTopTimer); clearTimeout(quickTopFadeTimer); });
quickTop.addEventListener('focus', () => { clearTimeout(quickTopTimer); clearTimeout(quickTopFadeTimer); });
['mouseleave', 'blur'].forEach(type => quickTop.addEventListener(type, () => { quickTopTimer = setTimeout(hideQuickTop, 2000); }));
quickTop.addEventListener('click', () => { document.getElementById('hero-title').setAttribute('tabindex', '-1'); document.getElementById('hero-title').focus({ preventScroll: true }); });

// Center the floating control in the measured gutter beyond the card shadow.
const positionQuickTop = () => {
  const card = document.querySelector('.project');
  if (!card || !quickTop) return;
  const style = getComputedStyle(card);
  const shadowValues = style.boxShadow.replace(/rgba?\([^)]*\)/g, '').match(/-?[\d.]+px/g) || [];
  const values = shadowValues.map(parseFloat);
  const shadowRight = Math.max(0, (values[0] || 0) + (values[3] || 0) + (values[2] || 0));
  const gap = Math.max(0, document.documentElement.clientWidth - card.getBoundingClientRect().right - shadowRight);
  quickTop.style.right = `${gap / 2}px`;
  quickTop.style.transform = 'translateX(50%)';
};
window.addEventListener('resize', positionQuickTop, { passive: true });
positionQuickTop();
if (document.fonts?.ready) document.fonts.ready.then(positionQuickTop);

// A quiet, pausable portfolio reel inside the line-drawn Macintosh.
(() => {
 const screen = document.querySelector('.mac-screen');
 if (!screen) return;
 const slides = [...screen.querySelectorAll('.mac-slide')];
 const pause = document.querySelector('.mac-pause');
 const description = document.querySelector('.mac-description');
 screen.append(description);
 const descriptions = [
  ['Mandated Reporter Training', 'Clear learner pathways, accessible courseware, and dependable compliance-training workflows.'],
  ['ClefShift', 'Guided music adaptation that helps musicians turn existing scores into playable cello parts.'],
  ['Power in Common', 'Systems research translated into practical energy choices for renters and property owners.'],
  ['Accessible Healthcare Systems', 'Mapping the policies, relationships, and assumptions that shape access to care.'],
  ['Culture Decoder', 'An interactive exploration of organizational culture through research, evidence, and design.']
 ];
 const writeDescription = () => {
  const heading = document.createElement('h2');
  const body = document.createElement('p');
  heading.textContent = descriptions[active][0];
  body.textContent = descriptions[active][1];
  description.replaceChildren(heading, body);
 };
 const revealDescription = () => { writeDescription(); description.classList.add('is-visible'); };
 const hideDescription = () => { if (!screen.matches(':hover, :focus-within')) description.classList.remove('is-visible'); };
 screen.addEventListener('mouseenter', revealDescription);
 screen.addEventListener('mouseleave', hideDescription);
 screen.addEventListener('focusin', revealDescription);
 screen.addEventListener('focusout', () => setTimeout(hideDescription, 0));
 const motion = matchMedia('(prefers-reduced-motion: reduce)');
 let paused = motion.matches, active = 0;
 const update = () => { pause.textContent = paused ? '▷' : 'Ⅱ'; pause.setAttribute('aria-label', paused ? 'Play case study slideshow' : 'Pause case study slideshow'); };
 pause.addEventListener('click', () => { paused = !paused; update(); });
 motion.addEventListener('change', e => { paused = e.matches; update(); });
 const step = direction => { slides[active].hidden = true; active = (active + direction + slides.length) % slides.length; slides[active].hidden = false; writeDescription(); };
 document.querySelector('.mac-prev').addEventListener('click',()=>step(-1));
 document.querySelector('.mac-next').addEventListener('click',()=>step(1));
 setInterval(() => { if (paused || document.hidden || screen.matches(':hover, :focus-within')) return; step(1); }, 4000);
 update();
})();

// A paired preview of the two archive channels, with explicit playback controls.
(() => {
 const panel = document.querySelector('.vacation-tv');
 if (!panel) return;
 const slides = [...panel.querySelectorAll('.vacation-tv-slides img')];
 const label = panel.querySelector('.vacation-tv-label');
 const pause = panel.querySelector('[data-tv="pause"]');
 const motion = matchMedia('(prefers-reduced-motion: reduce)');
 let current = 0, paused = motion.matches, hovering = false;
 const render = () => {
  slides.forEach((slide, i) => { slide.hidden = i !== current; });
  label.textContent = current ? '02 / Vacation Clipper' : '01 / Product Vault';
  pause.textContent = paused ? 'Play' : 'Pause';
  pause.setAttribute('aria-label', (paused ? 'Play' : 'Pause') + ' television preview');
 };
 panel.querySelector('[data-tv="next"]').addEventListener('click', () => { current = 1-current; render(); });
 panel.querySelector('[data-tv="previous"]').addEventListener('click', () => { current = 1-current; render(); });
 pause.addEventListener('click', () => { paused = !paused; render(); });
 panel.addEventListener('mouseenter', () => { hovering = true; });
 panel.addEventListener('mouseleave', () => { hovering = false; });
 setInterval(() => {
  if (paused || hovering || document.hidden || panel.contains(document.activeElement) || !panel.getClientRects().length) return;
  current = 1-current; render();
 }, 4500);
 render();
})();

// Size all current and future standalone systems explorers without nested page scrolling.
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.data?.type!=='systems-explorer-height')return;const frame=[...document.querySelectorAll('.interactive-map-embed iframe')].find(f=>f.contentWindow===event.source);const height=Number(event.data.height);if(frame&&Number.isFinite(height)&&height>100&&height<20000)frame.style.height=height+'px'});
