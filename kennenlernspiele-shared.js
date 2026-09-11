// Cookie-Consent-Banner und Impressum-Panel für die Kennenlernspiele-Seitenfamilie.
(function () {
    const banner = document.getElementById('cookieBanner');
    if (banner) {
        const accept = document.getElementById('cookieAccept');
        const decline = document.getElementById('cookieDecline');

        const hideBanner = () => banner.classList.remove('is-visible');
        const storeConsent = (value) => {
            try {
                localStorage.setItem('cookieConsent', value);
            } catch (error) {
                console.warn('Cookie consent could not be saved', error);
            }
            hideBanner();
        };

        const existingConsent = (() => {
            try {
                return localStorage.getItem('cookieConsent');
            } catch (error) {
                console.warn('Cookie consent could not be read', error);
                return null;
            }
        })();

        if (!existingConsent) {
            banner.classList.add('is-visible');
        }

        accept?.addEventListener('click', () => storeConsent('accepted'));
        decline?.addEventListener('click', () => storeConsent('declined'));
    }

    const panel = document.getElementById('impressumPanel');
    const toggle = document.getElementById('impressumToggle');
    const closeBtn = document.getElementById('impressumClose');
    if (panel && toggle) {
        const applyState = (open) => {
            panel.classList.toggle('is-visible', open);
            panel.setAttribute('aria-hidden', String(!open));
            toggle.setAttribute('aria-expanded', String(open));
            toggle.textContent = open ? 'Impressum verbergen' : 'Impressum anzeigen';
        };

        applyState(false);
        const handleToggle = () => {
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            applyState(!expanded);
        };

        toggle.addEventListener('click', handleToggle);
        closeBtn?.addEventListener('click', () => applyState(false));
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                applyState(false);
            }
        });
    }

    // Klappt beim Drucken alle Akkordeon-Karten auf, damit der vollständige
    // Inhalt (nicht nur die Überschrift) im Ausdruck erscheint, und stellt
    // danach den vorherigen Zustand wieder her.
    const detailsElements = () => document.querySelectorAll('details.item-card');
    let previousOpenStates = null;

    window.addEventListener('beforeprint', () => {
        const items = detailsElements();
        previousOpenStates = Array.from(items).map((el) => el.open);
        items.forEach((el) => { el.open = true; });
    });

    window.addEventListener('afterprint', () => {
        if (!previousOpenStates) { return; }
        const items = detailsElements();
        items.forEach((el, index) => { el.open = previousOpenStates[index]; });
        previousOpenStates = null;
    });

    // Bettet YouTube-Videos erst dann ein, wenn die zugehörige Spielkarte
    // tatsächlich aufgeklappt wird (spart Ladezeit und lädt keine
    // Drittanbieter-Inhalte, bevor sie wirklich gebraucht werden). Wird die
    // Karte wieder eingeklappt, wird der iframe komplett entfernt, damit ein
    // laufendes Video sofort stoppt statt im Hintergrund weiterzulaufen.
    const fallbackLinkHtml = (videoId) =>
        `<a class="video-fallback-link" href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener noreferrer">▶ Video auf YouTube ansehen</a>`;

    document.querySelectorAll('details.item-card').forEach((details) => {
        details.addEventListener('toggle', () => {
            const wrapper = details.querySelector('.video-embed-wrapper[data-yt-id]');
            if (!wrapper) { return; }
            const videoId = wrapper.getAttribute('data-yt-id');

            if (details.open) {
                if (wrapper.dataset.loaded === 'true') { return; }
                const videoTitle = wrapper.getAttribute('data-yt-title') || 'YouTube-Video';

                const iframe = document.createElement('iframe');
                iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
                iframe.title = videoTitle;
                iframe.loading = 'lazy';
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
                iframe.referrerPolicy = 'strict-origin-when-cross-origin';
                iframe.allowFullscreen = true;

                wrapper.innerHTML = '';
                wrapper.appendChild(iframe);
                wrapper.dataset.loaded = 'true';
            } else {
                if (wrapper.dataset.loaded !== 'true') { return; }
                wrapper.innerHTML = fallbackLinkHtml(videoId);
                wrapper.dataset.loaded = 'false';
            }
        });
    });
})();
