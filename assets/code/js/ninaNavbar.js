function ninaNavbarAsyncGenerateForceToCollapseNavbarEvents() {
  const ENABLE_COLLAPSE_NAVBAR_HAMBURGER_MENU_ON_CLICK = true;
  const HAMBURGER_MENU_WIDTH_PX_BREAKPOINT = 767;
  const notReadyError = new Error('Not ready');

  if (!ENABLE_COLLAPSE_NAVBAR_HAMBURGER_MENU_ON_CLICK) return;

  const ctxTargetElement = document.querySelector('#navbar-hamburger-killswitch');
  if (!ctxTargetElement) throw notReadyError;

  let bsCollapse;
  try {
    bsCollapse = new bootstrap.Collapse(ctxTargetElement, { toggle: false });
  } catch {
    throw notReadyError;
  }

  const forceToCollapseElements = document.querySelectorAll('.navbar .nav-item .nav-link, .trigger-navbar-collapse-onclick');
  if (forceToCollapseElements.length === 0) throw notReadyError;

  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  const skipCollapse = () => isFirefox || window.innerWidth > HAMBURGER_MENU_WIDTH_PX_BREAKPOINT;

  forceToCollapseElements.forEach((element) => {
    element.addEventListener('click', () => {
      if (!skipCollapse()) bsCollapse.hide();
    });
  });
}

const ninaNavbarInitializationCoroutine = setInterval(() => {
  try {
    ninaNavbarAsyncGenerateForceToCollapseNavbarEvents();
    clearInterval(ninaNavbarInitializationCoroutine);
    ninaNavbarInitializationCoroutine = undefined;
    ninaNavbarAsyncGenerateForceToCollapseNavbarEvents = undefined;
  } catch {}
}, 350);
