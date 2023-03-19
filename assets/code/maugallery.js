function mauGallery(opt = {}) {
  const mauGallerydefaults = {
    columns: 3,
    lightBox: true,
    showTags: true,
    navigation: true,
    tagsPosition: 'bottom',
    prevImgButtonLabel: 'Previous image',
    nextImgButtonLabel: 'Next image',
    disableFiltersButtonLabel: 'All',
    mauPrefixClass: 'mau',
    lightboxId: 'mauDefaultLightboxId',
    galleryRootNodeId: 'maugallery',
    galleryItemsRowId: 'gallery-items-row',
    filtersActiveTagId: 'active-tag',
    lightboxImgId: 'lightboxImage',
    galleryItemClass: 'gallery-item',
    modalTriggerClass: 'modal-trigger',
    animationName: 'mauGalleryFadeInDefaultAnimationName',
    animationKeyframes: '{0% {opacity: 0} 5% {opacity: 0} 100% {opacity: 1}}',
    animationDuration: '.5s',
    animationEasing: 'ease-in',
  };

  const style = (() => {
    let style = document.createElement('style');
    style.appendChild(document.createTextNode(''));
    document.head.appendChild(style);
    return style;
  })();

  let memoCurX = 0;
  let memoCurY = 0;
  let memoScrollBehavior = null;
  let memoIsOnMobile = null;
  const tagsSet = new Set();

  function injectMau(target, options) {
    function isOnMobile() {
      if (memoIsOnMobile === null) {
        memoIsOnMobile = (navigator.userAgent.match(/Android/i)
          || navigator.userAgent.match(/webOS/i)
          || navigator.userAgent.match(/iPhone/i)
          || navigator.userAgent.match(/iPad/i)
          || navigator.userAgent.match(/iPod/i)
          || navigator.userAgent.match(/BlackBerry/i)
          || navigator.userAgent.match(/Windows Phone/i));
      }
      return memoIsOnMobile;
    }

    function saveCurrentCameraPosition() {
      memoScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'smooth !important;'
      memoCurX = window.scrollX;
      memoCurY = window.scrollY;
    }

    function clearSaveCurrentCameraPositionSideEffects() {
      document.documentElement.style.scrollBehavior = memoScrollBehavior;
    }

    function snapCamera(x, y, delay = 0) {
      setTimeout(() => {
        const oldScrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto !important;'
        window.scrollTo({
          top: y,
          left: x,
          behavior: 'auto'
        });
        document.documentElement.style.scrollBehavior = oldScrollBehavior;
      }, delay);
    }

    function snapCameraToSavedPosition(delay = 1) {
      snapCamera(memoCurX, memoCurY, delay);
      clearSaveCurrentCameraPositionSideEffects();
    }

    function wrapItemInColumn(element, options) {
      function doWrap(element, wrapperOpen, wrapperClose) {
        orgHtml = element.outerHTML;
        newHtml = wrapperOpen + orgHtml + wrapperClose;
        element.outerHTML = newHtml;
      }

      const columns = options.columns;
      const mauPrefixClass = options.mauPrefixClass;
      const isImg = element.tagName === 'IMG' || element.tagName === 'PICTURE';
      const injectModalTrigger = `data-bs-toggle="modal" data-bs-target=".${mauPrefixClass}#${options.lightboxId}" class="${mauPrefixClass} ${options.modalTriggerClass}"`;
      let wrapperOpen = '';
      let wrapperClose = '';
      if (isOnMobile()) {
        style.sheet.insertRule(`#${options.galleryRootNodeId} .${mauPrefixClass}.item-column a:focus {outline-style:none;box-shadow:none;border-color:transparent;}`, 0);
      }
      if (typeof columns === 'number') {
        if (isImg) {
          wrapperOpen = `<div class='${mauPrefixClass} item-column mb-4 col-${Math.ceil(12 / columns)}'><a href="#" ${injectModalTrigger} style="text-decoration:none;color:inherit;display:flex;width:100%;height:100%">`;
          wrapperClose = '</a></div>';
        } else {
          wrapperOpen = `<div tabindex="0" class='${mauPrefixClass} item-column mb-4 col-${Math.ceil(12 / columns)}'><div style="width:100%;height:100%;">`;
          wrapperClose = '</div></div>';
        }
        doWrap(element, wrapperOpen, wrapperClose);
      } else if (typeof columns === 'object') {
        let columnClasses = '';
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        if (isImg) {
          wrapperOpen = `<div class='${mauPrefixClass} item-column mb-4${columnClasses}'><a href="#" ${injectModalTrigger} style="text-decoration:none;color:inherit;display:flex;width:100%;height:100%">`;
          wrapperClose = '</a></div>';
        } else {
          wrapperOpen = `<div tabindex="0" class='${mauPrefixClass} item-column mb-4${columnClasses}'><div style="width:100%;height:100%;">`;
          wrapperClose = '</div></div>';
        }
        doWrap(element, wrapperOpen, wrapperClose);
      } else {
        console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
      }
    }

    function clearModalPictureSources(modal) {
      const currentModalPictureElement = modal.querySelector('picture');
      const currentModalPictureSources = currentModalPictureElement.querySelectorAll('source');
      currentModalPictureSources.forEach(source => currentModalPictureElement.removeChild(source));
    }

    function clearOldPictureSources(modal, oldSources) {
      const currentModalPictureElement = modal.querySelector('picture');
      oldSources.forEach(() => {
        const nextElementToRemove = currentModalPictureElement.querySelector('source:last-of-type');
        currentModalPictureElement.removeChild(nextElementToRemove);
      });
    }

    function doUpdateImageElementInModal(currentModalImg, newImageElement) {
      const srcset = newImageElement.getAttribute('srcset') || null;
      const sizes = newImageElement.getAttribute('sizes') || null;
      const alt = newImageElement.getAttribute('alt');
      const src = newImageElement.getAttribute('src');
      currentModalImg.setAttribute('alt', alt);
      currentModalImg.setAttribute('src', src);
      if (srcset) {
        currentModalImg.setAttribute('srcset', srcset);
      }
      if (sizes) {
        currentModalImg.setAttribute('sizes', sizes);
      }
    }

    function updateImageElementInModal(modal, newImageElement) {
      const currentModalImg = modal.querySelector('picture > img');
      doUpdateImageElementInModal(currentModalImg, newImageElement);
      clearModalPictureSources(modal);
    }

    function updatePictureElementInModal(modal, newPictureElement) {
      const currentModalPicture = modal.querySelector('picture');
      const currentModalImg = currentModalPicture.querySelector('img');
      const newImageElement = newPictureElement.querySelector('img');
      doUpdateImageElementInModal(currentModalImg, newImageElement);
      const newPictureElementCopy = newPictureElement.cloneNode(deep = true);
      const oldSources = currentModalPicture.querySelectorAll('source');
      const newSources = newPictureElementCopy.querySelectorAll('source');
      newSources.forEach(newSource => {
        currentModalPicture.insertBefore(newSource, currentModalPicture.firstChild);
      });
      clearOldPictureSources(modal, oldSources);
    }

    function getModalActiveImage(modal, options) {
      const lightboxImgElement = modal.querySelector(`.${options.mauPrefixClass}#${options.lightboxImgId}`);
      const lightboxImgSrc = lightboxImgElement.getAttribute('src');

      const galleryItems = document.querySelectorAll(`img.${options.mauPrefixClass}.${options.galleryItemClass}`);
      for (const item of galleryItems) {
        if (item.getAttribute('src') === lightboxImgSrc) {
          return item;
        }
      }
      return null;
    }

    function updateModalPicture(modal, newElement) {
      if (newElement.parentNode.tagName === 'PICTURE') {
        updatePictureElementInModal(modal, newElement.parentNode);
      } else {
        updateImageElementInModal(modal, newElement);
      }
    }

    function buildImagesCollection(options) {
      const filtersActiveTagId = options.filtersActiveTagId;
      const galleryItemClass = options.galleryItemClass;
      const mauPrefixClass = options.mauPrefixClass;
      const galleryItems = document.querySelectorAll(`img.${mauPrefixClass}.${galleryItemClass}`);
      const activeTag = document.querySelector(`.${mauPrefixClass}#${filtersActiveTagId}`).dataset.imagesToggle;
      let imagesCollection = [];

      if (activeTag === 'all') {
        imagesCollection = galleryItems;
      } else {
        galleryItems.forEach(item => {
          if (item.dataset.galleryTag === activeTag) {
            imagesCollection.push(item);
          }
        });
      }
      return imagesCollection;
    }

    function prevImage(modal, options) {
      const imagesCollection = buildImagesCollection(options);
      const activeImage = getModalActiveImage(modal, options);

      let index = 0;
      for (const image of imagesCollection) {
        if (activeImage.getAttribute('src') === image.getAttribute('src')) {
          index -= 1;
          break;
        }
        index += 1;
      }

      const prev =
        imagesCollection[index] ??
        imagesCollection[imagesCollection.length - 1];
      updateModalPicture(modal, prev, options);
    }

    function nextImage(modal, options) {
      const imagesCollection = buildImagesCollection(options);
      const activeImage = getModalActiveImage(modal, options);

      let index = 0;
      for (const image of imagesCollection) {
        index += 1;
        if (activeImage.getAttribute('src') === image.getAttribute('src')) {
          break;
        }
      }

      const next = imagesCollection[index] ?? imagesCollection[0];
      updateModalPicture(modal, next, options);
    }

    function getRichGalleryItems(options) {
      const columns = document.querySelectorAll(`#${options.galleryRootNodeId} div.${options.mauPrefixClass}.item-column`);
      const dataEntries = [];
      columns.forEach(column => {
        const item = column.querySelector(`.${options.mauPrefixClass}.${options.galleryItemClass}`);
        const entry = {item, column};
        dataEntries.push(entry);
      });
      return dataEntries;
    }

    function filterByTag(element, options) {
      function forceReplayAnim(options) {
        const galleryItemsRowId = options.galleryItemsRowId;
        const mauPrefixClass = options.mauPrefixClass;
        const rootNode = document.querySelector(`.${mauPrefixClass}#${galleryItemsRowId}`);
        if (!isOnMobile()) {
          const oldAnimation = rootNode.style.animation;
          const oldDisplay = rootNode.style.display;
          rootNode.style.animation = 'none';
          rootNode.style.display = 'none';
          rootNode.offsetHeight;
          rootNode.style.display = oldDisplay;
          rootNode.style.animation = oldAnimation;
        }
        const oldAnimationName = rootNode.style.animationName;
        rootNode.style.animationName = 'none';
        window.requestAnimationFrame(() => rootNode.style.animationName = oldAnimationName);
      }

      if (element.id === options.filtersActiveTagId) {
        return;
      }

      saveCurrentCameraPosition();
      forceReplayAnim(options);
      const richGalleryItems = getRichGalleryItems(options);
      const activeTag = document.querySelector(`.${options.mauPrefixClass}#${options.filtersActiveTagId}`);
      const tag = element.dataset.imagesToggle;

      activeTag.classList.remove('active');
      activeTag.removeAttribute('id');
      element.classList.add(options.mauPrefixClass, 'active');
      element.id = options.filtersActiveTagId;

      richGalleryItems.forEach(richItem => {
        if (tag === 'all' || richItem.item.dataset.galleryTag === tag) {
          richItem.column.style.display = 'block';
        } else {
          richItem.column.style.display = 'none';
        }
        snapCameraToSavedPosition(delay = 3);
      });
    }

    function showItemTags(gallery, options, tagsSet) {
      const tagsPosition = options.tagsPosition;
      const activeTagId = options.filtersActiveTagId;
      const disableFiltersButtonLabel = options.disableFiltersButtonLabel;
      let tagItems = `<li class="nav-item"><button style="touch-action:manipulation;" class="${options.mauPrefixClass} nav-link active" data-images-toggle="all" id="${activeTagId}">${disableFiltersButtonLabel}</button></li>`;
      tagsSet.forEach(value => tagItems += `<li class="nav-item"><button style="touch-action:manipulation;" class="${options.mauPrefixClass} nav-link" data-images-toggle="${value}">${value}</button></li>`);
      const tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;
      if (tagsPosition === 'bottom') {
        gallery.innerHTML = gallery.innerHTML + tagsRow;
      } else if (tagsPosition === 'top') {
        gallery.innerHTML = tagsRow + gallery.innerHTML;
      } else {
        console.error(`Unknown tags position: ${tagsPosition}`);
      }
    }

    function generateRowWrapper(target, item, options, tagsSet) {
      let tag = null;
      if (item.tagName === 'IMG') {
        tag = item.dataset.galleryTag;
      } else if (item.tagName === 'PICTURE') {
        const itemImg = item.querySelector('img');
        tag = itemImg.dataset.galleryTag;
      }
      if (options.showTags && tag) {
        tagsSet.add(tag);
      }

      if (item.tagName === 'IMG') {
        item.classList.add('img-fluid');
      }

      if (item.tagName === 'PICTURE') {
        const itemImg = item.querySelector('img');
        if (!itemImg) {
          return;
        }
        itemImg.classList.add('img-fluid');
      }

      const parent = target.querySelector(`.${options.mauPrefixClass}#${options.galleryItemsRowId}`);
      parent.append(item);

      wrapItemInColumn(item, options);
    }

    function generateListeners(gallery, modal, options) {
      function handleKeyDown(event) {
        if (event.keyCode == 37 || event.key === 'ArrowLeft') {
          prevImage(modal, options);
        }
        if (event.keyCode == 39 || event.key === 'ArrowRight') {
          nextImage(modal, options);
        }
      }

      elements = gallery.querySelectorAll(`.${options.mauPrefixClass}.${options.modalTriggerClass}`);
      elements.forEach(element => {
        element.addEventListener('click', (event) => {
          saveCurrentCameraPosition();
          let imgElement = event.target.querySelector('img') ?? event.target;
          if (options.lightBox && imgElement) {
            if (imgElement.parentNode.tagName === 'PICTURE') {
              imgElement = imgElement.parentNode;
            }
            lightBoxOnOpen(modal, imgElement, options);
          }
        });
      });

      const galleryElementNavLinks = gallery.querySelectorAll(`.${options.mauPrefixClass}.nav-link`);
      const galleryElementMgPrev = gallery.querySelector(`#${options.galleryRootNodeId} .${options.mauPrefixClass}.mg-prev`);
      const galleryElementMgNext = gallery.querySelector(`#${options.galleryRootNodeId} .${options.mauPrefixClass}.mg-next`);

      galleryElementNavLinks.forEach(navlink => navlink.addEventListener('click', (event) => filterByTag(event.target, options)));
      galleryElementMgPrev.addEventListener('click', () => prevImage(modal, options));
      galleryElementMgNext.addEventListener('click', () => nextImage(modal, options));

      modal.addEventListener('shown.bs.modal', () => {
        document.addEventListener('keydown', handleKeyDown);
      });

      modal.addEventListener('hidden.bs.modal', () => {
        if (options.navigation) {
          const buttons = modal.querySelectorAll('button');
          buttons.forEach(button => button.removeAttribute('tabindex'));
        }
        snapCameraToSavedPosition();
        document.removeEventListener('keydown', handleKeyDown);
        clearModalPictureSources(modal);
      });
    }

    function lightBoxOnOpen(modal, element, options) {
      function handleImg(modal, element) {
        updateImageElementInModal(modal, element);
      }
      function handlePicture(modal, element, options) {
        updatePictureElementInModal(modal, element);
      }
      const modalImg = modal.querySelector(`.${options.mauPrefixClass}#${options.lightboxImgId}`);
      if (element.tagName === 'IMG') {
        handleImg(modal, element);
      } else if (element.tagName === 'PICTURE') {
        handlePicture(modal, element, options);
      }
      if (options.navigation) {
        const buttons = modal.querySelectorAll('button');
        buttons.forEach(button => button.setAttribute('tabindex', 0));
      }
    }

    function createLightBox(gallery, options) {
      const lightboxImgId = options.lightboxImgId;
      const lightboxId = options.lightboxId;
      const navigation = options.navigation;
      const prevImgBtnLabel = options.prevImgButtonLabel;
      const nextImgBtnLabel = options.nextImgButtonLabel;
      const mauPrefixClass = options.mauPrefixClass;

      const lightbox = `
        <div class="${mauPrefixClass} modal fade" id="${lightboxId ? lightboxId : "galleryLightbox"}" tabindex="-1" role="dialog" aria-hidden="true" style="user-select:none;-webkit-user-select:none;">
          <div class="${mauPrefixClass} modal-dialog" role="document">
            <div class="${mauPrefixClass} modal-content">
              <div class="${mauPrefixClass} modal-body">
                <picture>
                  <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" id="${lightboxImgId}" class="${mauPrefixClass} img-fluid" alt="" />
                </picture>
                ${navigation ? `<button aria-label="${prevImgBtnLabel}" class="${mauPrefixClass} mg-prev" style="touch-action:manipulation;border:none;left:-15px;background:#fff;"><span><</span></button>` : '<span style="display:none;" />'}
                ${navigation ? `<button aria-label="${nextImgBtnLabel}" class="${mauPrefixClass} mg-next" style="touch-action:manipulation;border:none;right:-15px;background:#fff;}"><span>></span></button>` : '<span style="display:none;" />'}
              </div>
            </div>
          </div>
        </div>`;
      gallery.innerHTML = gallery.innerHTML + lightbox;
    }

    function createRowWrapper(element, options) {
      if (!element.classList.contains('row')) {
        const div = document.createElement('div');
        div.id = options.galleryItemsRowId;
        div.classList.add(options.mauPrefixClass, 'row');
        element.append(div);
      }
    }

    function appendCSS(options) {
      const animationKeyframesRepresentation = `@keyframes ${options.animationName} ${options.animationKeyframes}`;
      const animationRuleValue = `${options.animationName} ${options.animationDuration} ${options.animationEasing}`;
      const dispatchAnimOnGallery = `.${options.mauPrefixClass}#${options.galleryItemsRowId} {animation: ${animationRuleValue}}`;
      const dispatchAnimOnModal = `.${options.mauPrefixClass}.modal {animation: ${animationRuleValue}}`;
      const centerTheModalRule = `.${options.mauPrefixClass}.modal-dialog {display: flex; align-items: center; justify-content: center; height: 100%; margin: 0 auto 0 auto}`;
      const navigationButtonsResponsiveRule = `@media (max-width: 1000px) {.mau.mg-next, .mau.mg-prev {margin:-25px 15px;}}`;
      const navigationButtonsRule = `.${options.mauPrefixClass}.mg-next, .${options.mauPrefixClass}.mg-prev {display:flex;position:absolute;top:50%;margin:-25px;width:50px;height:50px;border-radius:0;justify-content:center;align-items:center;font-size:24px;transition:margin-right .5s, margin-left .5s;}`;

      style.sheet.insertRule(animationKeyframesRepresentation, 0);
      style.sheet.insertRule(dispatchAnimOnGallery, 0);
      style.sheet.insertRule(dispatchAnimOnModal, 0);
      style.sheet.insertRule(centerTheModalRule, 0);
      style.sheet.insertRule(navigationButtonsResponsiveRule, 0);
      style.sheet.insertRule(navigationButtonsRule, 0);
    }

    function process(target, options) {
      appendCSS(options);
      createRowWrapper(target, options);
      if (options.lightBox) {
        createLightBox(target, options);
      }

      target.querySelectorAll(`.${options.mauPrefixClass}.${options.galleryItemClass}`).forEach(item => {
        if (item.parentNode.tagName === 'PICTURE') {
          item = item.parentNode;
        }
        generateRowWrapper(target, item, options, tagsSet)
      });

      if (options.showTags) {
        showItemTags(target, options, tagsSet);
      }
      const modal = document.querySelector(`.${options.mauPrefixClass}#${options.lightboxId}`);
      generateListeners(target, modal, options);
    }

    process(target, options);
  }

  function run(opt) {
    const options = mauGallerydefaults;
    Object.assign(options, opt);

    const target = document.querySelector(`#${options.galleryRootNodeId}`);
    injectMau(target, options);
  }

  run(opt);
}