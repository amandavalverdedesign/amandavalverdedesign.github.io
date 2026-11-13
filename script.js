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

  if (!isOpen && document.body.dataset.workView === 'grid') {
    project.classList.remove('browse-selected');
    document.documentElement.classList.add('grid-locked');
    window.scrollTo({top:0,behavior:'instant'});
  }

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
const showQuickTop = () => { quickTop.hidden=false; quickTop.classList.add('is-visible'); };
showQuickTop();
quickTop.addEventListener('click', event => {
 event.preventDefault();
 const target=document.body.dataset.workView?document.querySelector('.work-browser'):document.getElementById('top');
 const focus=document.body.dataset.workView?document.getElementById('browse-title'):document.getElementById('hero-title');
 focus.setAttribute('tabindex','-1');focus.focus({preventScroll:true});
 window.scrollTo({top:0,behavior:'smooth'});
 history.replaceState(null,'',document.body.dataset.workView?'#portfolio-views':'#top');
});

// Center the floating control in the measured gutter beyond the card shadow.
const positionQuickTop = () => {
  quickTop.style.removeProperty('right');
  quickTop.style.removeProperty('transform');
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

// Page-level grid and infinite scroll-snap gallery share the case study content.
(() => {
 const panel=document.querySelector('.work-browser'), grid=panel.querySelector('.browse-grid'), gallery=panel.querySelector('.browse-gallery'), track=panel.querySelector('.browse-track'), preview=panel.querySelector('.browse-preview');
 const projects=[...document.querySelectorAll('article.project')];
 const extras=[['Role-based workflows','Accessible learning','Dependable account states'],['Musician control','Visible processing','Editable arrangements'],['Renter advocacy','Shared incentives','Four usability sessions'],['Disability-centered research','Root causes','Connected barriers'],['Evidence-based interpretation','Interactive frameworks','Brand culture']];
 const entries=projects.map((project,i)=>({id:project.id,title:project.querySelector('.project-copy h3').textContent,summary:project.querySelector('.project-summary').textContent.trim(),kicker:project.querySelector('.project-kicker').textContent,points:[...project.querySelectorAll('.project-tags span')].map(el=>el.textContent).concat(extras[i]),project}));
 const about={id:'about',title:'About & Connect',summary:'My background combines design, psychology, systems thinking, accessibility, and research. I’m seeking opportunities in product design, interaction design, and UX design where thoughtful research becomes meaningful change.',kicker:'Warm research brain. Graphic design heart. Systems appetite.',points:['Interaction design','Design + psychology','Systems thinking','Qualitative research','Accessibility','Open to opportunities']};
 entries.push(about);
 let mode=null,active=0,physical=1,settleTimer,returnY=0,initializing=false;
 const artwork=entry=>{
  if(entry.id==='power-in-common'||entry.id==='culture-decoder'){const art=document.createElement('div');art.className='browse-live-site';const frame=document.createElement('iframe');frame.src=entry.id==='power-in-common'?'civic-energy-preview.html':'https://amandavalverde.design/culturedecoderapp/';frame.title=entry.title+' live website preview';frame.loading='eager';frame.tabIndex=-1;art.append(frame);new ResizeObserver(()=>{const scale=(art.clientWidth+2)/1440;frame.style.transform='scale('+scale+')';frame.style.height=Math.max(600,(art.clientHeight+2)/(scale||1))+'px';}).observe(art);return art;}
  if(entry.id==='about'){const art=document.createElement('div');art.className='browse-about-art';const photo=document.querySelector('#about .portrait-frame img').cloneNode();photo.removeAttribute('loading');const copy=document.createElement('p');['Warm research brain.','Graphic design heart.','Systems appetite.'].forEach(sentence=>{const line=document.createElement('span');line.textContent=sentence;copy.append(line);});const frame=document.createElement('div');frame.className='browse-portrait';frame.append(photo);art.append(frame,copy);return art;}

  const art=entry.project.querySelector('.project-visual img, .project-visual svg').cloneNode(true);art.removeAttribute('id');art.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));art.removeAttribute('aria-labelledby');art.removeAttribute('loading');return art;
 };
 const choose=(event,entry)=>{event.preventDefault();document.querySelectorAll('.browse-selected').forEach(el=>el.classList.remove('browse-selected'));const target=document.getElementById(entry.id);target.classList.add('browse-selected');document.documentElement.classList.remove('grid-locked');const toggle=target.querySelector('.project-toggle');if(toggle)setProjectOpen(toggle,true);location.hash=entry.id;target.scrollIntoView({behavior:'smooth',block:'start'});};
 entries.forEach(entry=>{const card=document.createElement('a');card.className='browse-card';card.href='#'+entry.id;const art=document.createElement('div');art.className='browse-art';art.append(artwork(entry));const copy=document.createElement('div');copy.className='browse-card-copy';const h=document.createElement('h3');h.textContent=entry.title+' ↗';const p=document.createElement('p');p.textContent=entry.id==='about'?entry.summary:entry.kicker;copy.append(h,p);card.append(art,copy);card.addEventListener('click',event=>choose(event,entry));grid.append(card);});
 const homes=projects.map(project=>{const marker=document.createComment('Project home');project.before(marker);return marker;});
 const slide=document.createElement('article');slide.className='project gallery-about';
 const entry=about;
   slide.classList.add('gallery-about');
   const heading=document.createElement('div');heading.className='project-card-top';heading.textContent='06 · ABOUT & CONNECT';
   const visual=document.createElement('div');visual.className='project-visual';const frame=document.createElement('div');frame.className='browse-portrait';frame.append(document.querySelector('#about .portrait-frame img').cloneNode());visual.append(frame);
   const copy=document.createElement('div');copy.className='project-copy';
   const title=document.createElement('h3');['Warm research brain.','Graphic design heart.','Systems appetite.'].forEach(text=>{const line=document.createElement('span');line.textContent=text;title.append(line);});
   const summary=document.createElement('p');summary.textContent=about.summary;
   const label=document.createElement('h4');label.textContent='Skills & areas of interest';
   const skills=document.createElement('div');skills.className='interest-cloud';document.querySelectorAll('#about .interest-cloud span').forEach(skill=>skills.append(skill.cloneNode(true)));
   const link=document.createElement('a');link.href='#about';link.className='browse-open';link.textContent='About & connect ↗';link.addEventListener('click',event=>choose(event,entry));
   copy.append(title,summary,label,skills,link);slide.append(heading,visual,copy);

 const aboutCard=slide;
 aboutCard.querySelector('.browse-open').remove();
 const contact=document.querySelector('.contact-links');
 if(contact){
 const box=document.createElement('div');box.className='gallery-contact-box';
 const intro=document.createElement('p');intro.textContent='I’m interested in interaction and systems design roles where research, accessibility, and complex problem-solving matter.';
 const compact=contact.cloneNode(true);compact.classList.add('gallery-contact');box.append(intro,compact);visual.append(box);
 }
 const energyVisual=projects.find(p=>p.id==='power-in-common').querySelector('.project-visual');
 const energyOriginal=[...energyVisual.childNodes];
 const energyLive=document.querySelector('#culture-decoder .site-preview').cloneNode(true);
 energyLive.setAttribute('aria-label','Live preview of Civic Energy');
 energyLive.querySelector('strong').textContent='Civic Energy';
 const energyLink=energyLive.querySelector('a');energyLink.href='https://karen-happuch.github.io/civic-energy/';energyLink.innerHTML='View the website <span aria-hidden="true">↗</span>';energyLink.setAttribute('aria-label','View Civic Energy (opens in a new tab)');
 const energyFrame=energyLive.querySelector('iframe');energyFrame.src='civic-energy-preview.html';energyFrame.title='Live preview of Civic Energy';energyFrame.loading='eager';
 const galleryCards=[...projects,aboutCard];
 const render=i=>{active=(i+entries.length)%entries.length;galleryCards.forEach((card,n)=>card.hidden=n!==active);progress.value=active+1;panel.querySelector('#browse-title').textContent=entries[active].id==='about'?'Let’s make the complicated feel possible.':'Explore the work';panel.querySelector('.browse-counter').textContent=`${String(active+1).padStart(2,'0')} / 06`;};
 // Scale the complete composition uniformly; retain all internal geometry.
 const fitBrowse=()=>{
  panel.style.transform='';panel.style.marginBottom='';
  if(!mode||innerWidth<=800)return;
  if(mode==='gallery'&&track.querySelector('.project:not([hidden]) > .project-details.is-open'))return;
  const height=panel.offsetHeight;
  const footer=document.querySelector('footer').offsetHeight;
  const scale=Math.min(1,(innerHeight-footer-12)/height);
  panel.style.transform=`scale(${scale})`;
  panel.style.transformOrigin='top center';
  panel.style.marginBottom=`${height*(scale-1)}px`;
 };
 window.addEventListener('resize',()=>{if(mode==='grid')requestAnimationFrame(()=>{fitBrowse();window.scrollTo({top:0,behavior:'instant'});});});
 const sizeGallery=()=>{
  if(mode!=='gallery')return;
  panel.style.transform='';panel.style.marginBottom='';
  track.style.removeProperty('--gallery-copy-height');
  let height=0;
  galleryCards.forEach(card=>{card.hidden=false;const copy=card.querySelector('.project-copy');height=Math.max(height,copy.getBoundingClientRect().height);card.hidden=true;});
  aboutCard.hidden=false;
  const portrait=aboutCard.querySelector('.browse-portrait'),contactBox=aboutCard.querySelector('.gallery-contact-box');
  height=Math.max(height,portrait.offsetHeight+contactBox.offsetHeight+72);
  track.style.setProperty('--gallery-copy-height',Math.ceil(height)+'px');render(active);fitBrowse();
 };
 track.addEventListener('click',event=>{
  if(event.target.closest('.project-toggle'))fitBrowse();
 });
 window.addEventListener('resize',()=>requestAnimationFrame(sizeGallery));
 document.fonts.ready.then(()=>requestAnimationFrame(sizeGallery));
 const go=direction=>{const current=galleryCards[active];current.querySelectorAll('.project-toggle').forEach(t=>setProjectOpen(t,false));render(active+direction);fitBrowse();window.scrollTo({top:0,behavior:"instant"});};
 const progress=document.createElement('progress');progress.className='browse-progress';progress.max=entries.length;progress.value=1;progress.setAttribute('aria-label','Gallery progress');gallery.append(progress);
 gallery.append(panel.querySelector('.browse-gallery-heading'));
 panel.querySelector('.browse-prev').addEventListener('click',()=>go(-1));panel.querySelector('.browse-next').addEventListener('click',()=>go(1));
 let wheelTotal=0,wheelLast=0,wheelLock=0;
 window.addEventListener('wheel',event=>{
  if(mode==='grid'&&!event.ctrlKey&&!document.querySelector('.browse-selected')){
   event.preventDefault();
   return;
  }
  if(mode!=='gallery'||event.ctrlKey||galleryCards[active].querySelector('.project-details.is-open'))return;
  event.preventDefault();
  const now=performance.now(), delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
  if(now-wheelLast>180)wheelTotal=0;
  wheelLast=now;
  if(now<wheelLock)return;
  wheelTotal+=delta*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
  if(Math.abs(wheelTotal)>=45){go(wheelTotal>0?1:-1);wheelTotal=0;wheelLock=now+650;}
 },{passive:false});
 track.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();go(event.key==='ArrowRight'?1:-1);}});
 const buttons=[...document.querySelectorAll('[data-browse]')];
 const restore=()=>projects.forEach((project,i)=>{homes[i].after(project);project.hidden=false;});
 const setMode=next=>{
 if(!mode&&next)returnY=window.scrollY;
 restore();energyVisual.replaceChildren(...energyOriginal);energyVisual.classList.remove('gallery-live-energy');aboutCard.remove();mode=next;panel.hidden=!mode;
 document.querySelectorAll('.browse-selected').forEach(el=>el.classList.remove('browse-selected'));
 document.documentElement.classList.toggle('grid-locked',mode==='grid');
 if(mode)document.body.dataset.workView=mode;else delete document.body.dataset.workView;
 buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.browse===mode)));
 grid.hidden=mode!=='grid';gallery.hidden=mode!=='gallery';
 panel.querySelector('.browse-header > p').textContent=mode==='gallery'?'Scroll or use the arrows to browse all six cards.':'Choose a project to explore.';
 if(mode!=='gallery')panel.querySelector('#browse-title').textContent='Explore the work';
 if(mode==='gallery'){projects.forEach(p=>setProjectOpen(p.querySelector('.project-toggle'),false));energyVisual.replaceChildren(energyLive);energyVisual.classList.add('gallery-live-energy');galleryCards.forEach(card=>{track.append(card);card.classList.add('is-visible');});render(active);requestAnimationFrame(()=>{sizeGallery();window.scrollTo({top:0,behavior:"instant"});});}
 if(mode==='grid')requestAnimationFrame(()=>{fitBrowse();window.scrollTo({top:0,behavior:'instant'});});
 if(!mode){panel.style.transform='';panel.style.marginBottom='';}
 if(mode){history.replaceState(null,'','#portfolio-views');window.scrollTo({top:0,behavior:'instant'});}else{history.replaceState(null,'',location.pathname+location.search);window.scrollTo({top:returnY,behavior:'instant'});}
 requestAnimationFrame(()=>{positionQuickTop();align();});
 };
 buttons.forEach(button=>{button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>setMode(mode===button.dataset.browse?null:button.dataset.browse));});
 document.querySelector('.browse-home').addEventListener('click',()=>{
  if(mode)setMode(null);
  quickTop.click();
 });
 // Existing navigation still reveals the destination while a layout remains active.
 window.addEventListener('hashchange',()=>{if(!mode)return;const target=document.getElementById(location.hash.slice(1));if(target?.matches('.project,.about-section')){target.classList.add('browse-selected');if(mode==='gallery')fitBrowse();target.scrollIntoView({block:'start'});}else if(target?.id==='top')setMode(null);});
 const align=()=>{const top=document.querySelector('.quick-top'),controls=document.querySelector('.browse-controls');controls.style.right=top.style.right;controls.style.transform=top.style.transform;};window.addEventListener('resize',align);requestAnimationFrame(align);
})();
