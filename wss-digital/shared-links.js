(function () {
  const LINK_CONFIG = {
    'mathe-trainer': {
      url: 'https://ws-mathe-trainer.vercel.app/',
      newTab: true,
    },
    'digitale-bildung': {
      url: '#',
      newTab: false,
    },
    'wirtschaftsplanspiel': {
      url: 'https://marktmatch5.vercel.app/',
      newTab: true,
    },
    'uebungsunternehmen': {
      url: 'https://wss-digital-uebungsunternehmen.vercel.app/',
      newTab: false,
    },
  };

  const modifierPressed = (event) => event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

  const navigateSameTab = (url) => {
    if (typeof window !== 'undefined' && url) {
      window.location.href = url;
    }
  };

  const applyLink = (element, config) => {
    if (!element || !config) {
      return;
    }

    element.setAttribute('href', config.url);

    if (config.newTab) {
      element.setAttribute('target', '_blank');
      element.setAttribute('rel', 'noopener noreferrer');
      return;
    }

    element.removeAttribute('target');
    element.removeAttribute('rel');

    element.addEventListener('click', (event) => {
      if (event.defaultPrevented) {
        return;
      }

      if (event.button !== 0) {
        return;
      }

      if (modifierPressed(event)) {
        return;
      }

      event.preventDefault();
      navigateSameTab(config.url);
    });
  };

  const initLinks = () => {
    const candidates = document.querySelectorAll('[data-link-id]');
    if (!candidates.length) {
      return;
    }

    candidates.forEach((element) => {
      const linkId = element.getAttribute('data-link-id');
      const config = LINK_CONFIG[linkId];

      if (!config) {
        console.warn('[shared-links] Kein Link für', linkId);
        return;
      }

      applyLink(element, config);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLinks);
  } else {
    initLinks();
  }

  if (typeof window !== 'undefined') {
    window.portalLinks = Object.freeze({ ...LINK_CONFIG });
  }
})();
