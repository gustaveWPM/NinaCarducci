document.addEventListener("DOMContentLoaded", () => {
    function runMauGallery() {
        const opt = {
            columns: {
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 3
            },
            lightBox: true,
            lightboxId: 'myAwesomeLightbox',
            showTags: true,
            tagsPosition: 'top'
        };
        mauGallery(opt);
    }

    function collapseNavbarOnClick() {
        const navLinks = document.querySelectorAll('.nav-item .nav-link')
        const menuToggle = document.querySelector('#navbar-hamburger-killswitch')
        const bsCollapse = new bootstrap.Collapse(menuToggle, { toggle: false })
        const hamburgerWidthPxBreakpoint = 767
        navLinks.forEach(l => {
            l.addEventListener('click', () => {
                if (window.innerWidth <= hamburgerWidthPxBreakpoint) {
                    bsCollapse.toggle()
                }
            })
        })
    }
    runMauGallery();
    collapseNavbarOnClick();
});
