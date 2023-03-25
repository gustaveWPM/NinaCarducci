document.addEventListener("DOMContentLoaded", () => {
  const collapseNavbarHamburgerOnClick = true;
  function runMauGallery() {
    const opt = {
      columns: {
        'xs': 1,
        'sm': 2,
        'md': 3,
        'lg': 3,
        'xl': 3
      },
      'lightBox': true,
      'navigation': true,
      'showTags': true,
      'lightboxId': 'myAwesomeLightbox',
      'tagsPosition': 'top',
      'prevImgButtonLabel': 'Image précédente',
      'nextImgButtonLabel': 'Image suivante',
      'disableFiltersButtonLabel': 'Tout'
    };
    mauGallery(opt);
  }

  function generateForceToCollapseNavbarEvents() {
    const hamburgerWidthPxBreakpoint = 767;
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    const skipCollapse = () => isFirefox || window.innerWidth > hamburgerWidthPxBreakpoint;

    function doGenerate() {
      const forceToCollapseElements = document.querySelectorAll('.navbar .nav-item .nav-link, .trigger-navbar-collapse-onclick');
      const ctxTargetElement = document.querySelector('#navbar-hamburger-killswitch');
      const bsCollapse = new bootstrap.Collapse(ctxTargetElement, config = { toggle: false });

      forceToCollapseElements.forEach(element => {
        element.addEventListener('click', () => {
          if (!skipCollapse()) {
            bsCollapse.hide();
          }
        });
      });
    }

    doGenerate();
  }

  function process() {
    runMauGallery();
    if (collapseNavbarHamburgerOnClick) {
      generateForceToCollapseNavbarEvents();
    }
  }

  process();
});
