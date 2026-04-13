function scaleTitles() {
  const marginPct = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--margin-x')) / 100;
  const marginPx = window.innerWidth * marginPct;
  const availableWidth = window.innerWidth - marginPx * 2;

  const span = document.createElement('span');
  span.style.cssText = `
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-weight: 400;
    font-style: normal;
    letter-spacing: -0.01em;
    white-space: nowrap;
    position: absolute;
    visibility: hidden;
    top: 0; left: 0;
  `;
  span.textContent = 'PORTFOLIO';
  document.body.appendChild(span);

  // Binary search for the largest font size that fits within available width
  let lo = 10, hi = 800;
  while (hi - lo > 0.5) {
    const mid = (lo + hi) / 2;
    span.style.fontSize = mid + 'px';
    if (span.offsetWidth <= availableWidth) lo = mid;
    else hi = mid;
  }
  document.body.removeChild(span);

  const fs = lo + 'px';
  document.querySelectorAll('.big-line').forEach(el => el.style.fontSize = fs);
}

function positionPhoto() {
  const lineOne   = document.getElementById('lineOne');
  const heroBody  = document.getElementById('heroBody');
  const photoCol  = document.getElementById('photoCol');
  const bioText   = document.getElementById('bioText');
  const lineTwoEl = document.getElementById('lineTwo');

  if (!lineOne || !heroBody || !photoCol || !bioText || !lineTwoEl) return;

  // Pause animations before measuring — getBoundingClientRect during a
  // translateY animation returns the in-flight position, not the final one
  const animated = [lineOne, lineTwoEl];
  const saved = animated.map(el => el.style.animation);
  animated.forEach(el => el.style.animation = 'none');
  void lineOne.offsetHeight; // force reflow

  const lineRect  = lineOne.getBoundingClientRect();
  const bodyRect  = heroBody.getBoundingClientRect();
  const midOfLine = (lineRect.top + lineRect.height / 2) - bodyRect.top;
  photoCol.style.top = midOfLine + 'px';

  const imgHeight   = photoCol.querySelector('img').offsetHeight;
  const totalNeeded = midOfLine + imgHeight;
  heroBody.style.minHeight = totalNeeded + 'px';

  const lineTwoRect = lineTwoEl.getBoundingClientRect();
  const bioTop = lineTwoRect.bottom - bodyRect.top;
  bioText.style.paddingTop    = '4vh';
  bioText.style.paddingBottom = '0';

  if (window.innerWidth <= 1100) {
    heroBody.style.paddingTop = '';
    heroBody.style.minHeight  = totalNeeded + 'px';
    bioText.style.marginTop   = (totalNeeded - bioTop) + (window.innerHeight * 0.04) + 'px';
    bioText.style.height      = 'auto';
  } else {
    heroBody.style.paddingTop = '';
    bioText.style.marginTop   = '';
    bioText.style.height      = (totalNeeded - bioTop) + 'px';
  }

  animated.forEach((el, i) => el.style.animation = saved[i]);
}

function setupMobileMenu() {
  const btn  = document.getElementById('navHamburger');
  const menu = document.getElementById('mobileMenu');
  const nav  = document.querySelector('nav');
  if (!btn || !menu) return;

  function close() {
    menu.style.height  = '0px';
    menu.style.opacity = '0';
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    menu.classList.remove('is-open');
    nav.classList.remove('menu-open');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      close();
    } else {
      // Snapshot scrollHeight before animating from 0 so the transition has a target
      menu.style.height  = 'auto';
      const fullHeight   = menu.scrollHeight;
      menu.style.height  = '0px';
      menu.style.opacity = '0';
      menu.style.display = 'block';
      void menu.offsetHeight; // force reflow

      menu.style.height  = fullHeight + 'px';
      menu.style.opacity = '1';
      menu.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');
      nav.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
    }
  });

  menu.querySelectorAll('.mobile-menu-link').forEach(link => {
    link.addEventListener('click', close);
  });
}

function setupForm() {}

function setupLegalPanel() {
  const panel   = document.getElementById('legalPanel');
  const btnImp  = document.getElementById('impressumToggle');
  const btnDat  = document.getElementById('datenschutzToggle');
  const contImp = document.getElementById('content-impressum');
  const contDat = document.getElementById('content-datenschutz');
  const footer  = document.querySelector('footer');

  if (!panel || !btnImp || !btnDat) return;

  panel.style.overflow = 'hidden';
  panel.style.height   = '0px';
  panel.style.opacity  = '0';
  panel.style.padding  = '0 10%';

  let activePanel = null;

  function scrollToFooter() {
    const footerTop = footer.getBoundingClientRect().top + window.scrollY;
    if (footer.getBoundingClientRect().top > 0) {
      window.scrollTo({ top: footerTop, behavior: 'smooth' });
    }
  }

  function updateButtons(id) {
    btnImp.setAttribute('aria-expanded', id === 'impressum'   ? 'true' : 'false');
    btnDat.setAttribute('aria-expanded', id === 'datenschutz' ? 'true' : 'false');
  }

  function open(id) {
    contImp.classList.toggle('is-active', id === 'impressum');
    contDat.classList.toggle('is-active', id === 'datenschutz');
    activePanel = id;
    updateButtons(id);

    panel.style.height  = 'auto';
    const fullHeight    = panel.scrollHeight;
    panel.style.height  = fullHeight + 'px';
    panel.style.opacity = '1';
    panel.setAttribute('aria-hidden', 'false');

    scrollToFooter();
  }

  function close() {
    panel.style.height  = '0px';
    panel.style.opacity = '0';
    panel.setAttribute('aria-hidden', 'true');
    activePanel = null;
    updateButtons(null);

    // Defer DOM cleanup until after the CSS height transition completes
    panel.addEventListener('transitionend', () => {
      contImp.classList.remove('is-active');
      contDat.classList.remove('is-active');
    }, { once: true });
  }

  btnImp.addEventListener('click', () => {
    if (activePanel === 'impressum') close();
    else open('impressum');
  });

  btnDat.addEventListener('click', () => {
    if (activePanel === 'datenschutz') close();
    else open('datenschutz');
  });
}

function layoutGallery() {
  const list = document.querySelector('.gallery-list');
  if (!list) return;

  const items = Array.from(list.querySelectorAll('.gallery-item'));
  if (!items.length) return;

  const contentWidth = list.getBoundingClientRect().width;
  const gap          = window.innerWidth * 0.05;
  const halfWidth    = (contentWidth - gap) / 2;
  const imgHeight    = window.innerHeight * 0.80;

  items.forEach(item => {
    const img = item.querySelector('img');
    if (!img || !img.naturalWidth || !img.naturalHeight) return;

    // Project the image's natural aspect ratio onto the 80vh render height,
    // then decide whether it fits beside another image or needs a full row
    const naturalRenderWidth = (img.naturalWidth / img.naturalHeight) * imgHeight;

    if (naturalRenderWidth > halfWidth) {
      item.setAttribute('data-solo', '');
      item.removeAttribute('data-paired');
    } else {
      item.setAttribute('data-paired', '');
      item.removeAttribute('data-solo');
    }
  });
}

function init() {
  scaleTitles();
  positionPhoto();
  layoutGallery();
}

document.addEventListener('DOMContentLoaded', () => {
  setupForm();
  setupLegalPanel();
  setupMobileMenu();
});

window.addEventListener('load',   () => { init(); layoutGallery(); });
window.addEventListener('resize', () => { init(); layoutGallery(); });
document.fonts.ready.then(init);