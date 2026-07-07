/**
 * Camille Perraudeau — Carte de visite numérique
 * Script principal. Aucune dépendance obligatoire :
 * la génération de QR code charge une petite bibliothèque à la demande
 * uniquement (voir generateQrCode), le reste est du JavaScript natif.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var config = readConfig();

  /* ============ 1. Thème clair / sombre ============ */
  function initTheme() {
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    updateToggleLabel();

    toggle.addEventListener('click', function () {
      var isLight = root.getAttribute('data-theme') === 'light';
      var next = isLight ? 'dark' : 'light';

      if (next === 'dark') {
        root.removeAttribute('data-theme');
      } else {
        root.setAttribute('data-theme', 'light');
      }

      try { localStorage.setItem('theme', next); }
      catch (e) { /* stockage indisponible : le choix ne sera pas mémorisé */ }

      updateToggleLabel();
    });

    function updateToggleLabel() {
      var isLight = root.getAttribute('data-theme') === 'light';
      toggle.setAttribute('aria-pressed', String(isLight));
      toggle.setAttribute('aria-label', isLight ? 'Activer le thème sombre' : 'Activer le thème clair');
    }
  }

  /* ============ 2. Navigation mobile ============ */
  function initMobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var panel = document.getElementById('mobile-nav');
    if (!toggle || !panel) return;

    function close() {
      panel.dataset.open = 'false';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Ouvrir le menu');
    }
    function open() {
      panel.dataset.open = 'true';
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Fermer le menu');
    }

    toggle.addEventListener('click', function () {
      panel.dataset.open === 'true' ? close() : open();
    });

    panel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.dataset.open === 'true') {
        close();
        toggle.focus();
      }
    });
  }

  /* ============ 3. Défilement doux + lien actif ============ */
  function initSmoothScroll() {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        history.pushState(null, '', id);
      });
    });
  }

  function initActiveNav() {
    var sections = document.querySelectorAll('main section[id]');
    var links = document.querySelectorAll('.nav__link');
    if (!sections.length || !links.length) return;

    var map = {};
    links.forEach(function (link) {
      map[link.getAttribute('href').slice(1)] = link;
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = map[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('is-active'); });
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ============ 4. Révélations au défilement ============ */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ============ 5. Année dynamique ============ */
  function initYear() {
    var el = document.getElementById('current-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ============ 6. Génération et téléchargement de vCard ============ */
  function readConfig() {
    var el = document.getElementById('contact-config');
    if (!el) return {};
    try { return JSON.parse(el.textContent); }
    catch (e) { return {}; }
  }

  function buildVCard(cfg) {
    var lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:' + (cfg.lastName || '') + ';' + (cfg.firstName || '') + ';;;',
      'FN:' + (cfg.name || ''),
      'TITLE:' + (cfg.title || ''),
      cfg.email ? 'EMAIL;TYPE=INTERNET:' + cfg.email : '',
      cfg.tel ? 'TEL;TYPE=CELL:' + cfg.tel : '',
      cfg.url ? 'URL:' + cfg.url : '',
      cfg.github ? 'X-SOCIALPROFILE;TYPE=github:https://github.com/' + cfg.github : '',
      cfg.linkedin ? 'X-SOCIALPROFILE;TYPE=linkedin:https://www.linkedin.com/in/' + cfg.linkedin : '',
      'END:VCARD'
    ].filter(Boolean);
    return lines.join('\r\n');
  }

  function downloadVCard() {
    var vcard = buildVCard(config);
    var blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (config.name || 'contact').replace(/\s+/g, '-').toLowerCase() + '.vcf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    showToast('Contact téléchargé (' + a.download + ')');
  }

  function initVCard() {
    ['add-contact-btn', 'add-contact-btn-2'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', downloadVCard);
    });
  }

  /* ============ 7. Toast de confirmation ============ */
  var toastEl = null;
  function showToast(message) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    requestAnimationFrame(function () { toastEl.classList.add('is-visible'); });
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 2600);
  }

  /* ============ 8. Partage ============ */
  function initShare() {
    var btn = document.getElementById('share-btn');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var shareData = {
        title: config.name || document.title,
        text: config.title || '',
        url: config.url || window.location.href
      };

      if (navigator.share) {
        navigator.share(shareData).catch(function () { /* annulé par l'utilisateur */ });
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareData.url).then(function () {
          showToast('Lien copié dans le presse-papiers');
        });
      } else {
        showToast(shareData.url);
      }
    });
  }

  /* ============ 9. QR code à la demande ============ */
  var qrLibPromise = null;
  function loadQrLibrary() {
    if (qrLibPromise) return qrLibPromise;
    qrLibPromise = new Promise(function (resolve, reject) {
      if (window.QRCode) return resolve();
      var script = document.createElement('script');
      // Bibliothèque légère (~5 Ko), sans dépendance, chargée uniquement au clic.
      // Pour un fonctionnement 100% hors-ligne, téléchargez ce fichier et
      // placez-le dans /assets/js/vendor/qrcode.min.js, puis changez le src ci-dessous.
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return qrLibPromise;
  }

  function initQrCode() {
    var btn = document.getElementById('qr-btn');
    var box = document.getElementById('qr-box');
    var canvasHost = document.getElementById('qr-canvas');
    if (!btn || !box || !canvasHost) return;

    var generated = false;

    btn.addEventListener('click', function () {
      var willOpen = box.hasAttribute('hidden');

      if (willOpen) {
        box.removeAttribute('hidden');
        btn.setAttribute('aria-expanded', 'true');

        if (!generated) {
          canvasHost.textContent = 'Génération du QR code…';
          loadQrLibrary().then(function () {
            canvasHost.textContent = '';
            new window.QRCode(canvasHost, {
              text: config.url || window.location.href,
              width: 160,
              height: 160,
              colorDark: '#0A0D0B',
              colorLight: '#F4F6F4'
            });
            generated = true;
          }).catch(function () {
            canvasHost.textContent = 'Impossible de charger le générateur de QR code pour le moment.';
          });
        }
      } else {
        box.setAttribute('hidden', '');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ============ 10. Dépôts GitHub récents ============ */
  function initGithubRepos() {
    var grid = document.getElementById('repos-grid');
    var status = document.getElementById('repos-status');
    var username = config.github;
    if (!grid || !username) return;

    fetch('https://api.github.com/users/' + encodeURIComponent(username) + '/repos?sort=updated&per_page=6')
      .then(function (res) {
        if (!res.ok) throw new Error('GitHub API error ' + res.status);
        return res.json();
      })
      .then(function (repos) {
        if (!Array.isArray(repos) || repos.length === 0) {
          if (status) status.textContent = 'Aucun dépôt public pour le moment.';
          return;
        }
        if (status) status.remove();
        renderRepos(repos.slice(0, 6));
      })
      .catch(function () {
        if (status) status.textContent = 'Dépôts GitHub indisponibles pour le moment — voir le profil directement sur GitHub.';
      });

    function renderRepos(repos) {
      var frag = document.createDocumentFragment();
      repos.forEach(function (repo) {
        var card = document.createElement('article');
        card.className = 'repo-card';

        var link = document.createElement('a');
        link.href = repo.html_url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = repo.name;
        card.appendChild(link);

        var desc = document.createElement('p');
        desc.textContent = repo.description || 'Pas de description fournie.';
        card.appendChild(desc);

        var meta = document.createElement('div');
        meta.className = 'repo-card__meta';
        if (repo.language) {
          var lang = document.createElement('span');
          lang.textContent = repo.language;
          meta.appendChild(lang);
        }
        var stars = document.createElement('span');
        stars.textContent = '★ ' + (repo.stargazers_count || 0);
        meta.appendChild(stars);
        card.appendChild(meta);

        frag.appendChild(card);
      });
      grid.appendChild(frag);
    }
  }

  /* ============ 11. Service worker (PWA) ============ */
  function initServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    if (window.location.protocol === 'file:') return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {
        /* échec silencieux : le site fonctionne normalement sans le mode hors-ligne */
      });
    });
  }

  /* ============ Initialisation ============ */
  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initMobileNav();
    initSmoothScroll();
    initActiveNav();
    initReveal();
    initYear();
    initVCard();
    initShare();
    initQrCode();
    initGithubRepos();
    initServiceWorker();
  });
})();
