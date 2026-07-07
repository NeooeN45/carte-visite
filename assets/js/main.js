/**
 * Camille Perraudeau — Carte de visite numérique
 * Script principal — édition Premium Néon/Cyber
 * Aucune dépendance obligatoire (QR code chargé à la demande).
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
      if (isLight) {
        root.removeAttribute('data-theme');          /* → sombre */
        try { localStorage.setItem('theme', 'dark'); } catch (e) {}
      } else {
        root.setAttribute('data-theme', 'light');    /* → clair */
        try { localStorage.setItem('theme', 'light'); } catch (e) {}
      }
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
      panel.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Ouvrir le menu');
    }
    function open() {
      panel.dataset.open = 'true';
      panel.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Fermer le menu');
    }
    toggle.addEventListener('click', function () {
      panel.dataset.open === 'true' ? close() : open();
    });
    panel.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.dataset.open === 'true') { close(); toggle.focus(); }
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
    links.forEach(function (link) { map[link.getAttribute('href').slice(1)] = link; });
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

  /* ============ 4. Header — effet scroll ============ */
  function initHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;
    var onScroll = function () {
      if (window.scrollY > 20) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ============ 5. Révélations au scroll ============ */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-visible');
        obs.unobserve(el);
        /* Libère le layer GPU will-change une fois l'animation terminée */
        el.addEventListener('transitionend', function () {
          el.style.willChange = 'auto';
        }, { once: true });
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ============ 6. Canvas particules — supprimé (remplacé par vidéo de fond) ============ */
  function initParticles() { /* no-op — remplacé par vidéo de fond */ }

  /* ============ 7. Curseur custom — supprimé ============ */
  function initCursor() { /* no-op */ }

  /* ============ 8. Effet parallaxe hero — supprimé (backdrop/aurora supprimés) ============ */
  function initParallax() { /* no-op */ }

  /* ============ 9. Titre hero — effet typewriter ============ */
  function initTypewriter() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var el = document.getElementById('hero-title');
    if (!el) return;

    var text = el.textContent.trim();
    el.textContent = '';
    el.style.opacity = '1';
    var i = 0;
    /* Plus rapide sur mobile pour ne pas faire attendre */
    var isMobile = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    var delay = isMobile ? 40 : 80;
    var startDelay = isMobile ? 300 : 600;

    function type() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(type, delay);
      }
    }
    setTimeout(type, startDelay);
  }

  /* ============ 10. Compteurs animés (facts) ============ */
  function initCounters() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var facts = document.querySelectorAll('.about__fact-value');
    if (!facts.length) return;

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        var el = entry.target;
        var rawText = el.textContent.trim();
        var num = parseFloat(rawText.replace(/[^0-9.]/g, ''));
        if (isNaN(num)) return;
        var suffix = rawText.replace(/[0-9.]/g, '');
        var start = 0;
        var duration = 1200;
        var startTime = null;
        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var ease = 1 - Math.pow(1 - progress, 3);
          var current = Math.round(start + (num - start) * ease);
          el.textContent = current + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = rawText;
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });

    facts.forEach(function (el) { observer.observe(el); });
  }

  /* ============ 11. Glitch effect au hover du titre ============ */
  function initGlitch() {
    var title = document.getElementById('hero-title');
    if (!title) return;

    var glitchChars = '!<>-_\\/[]{}—=+*^?#________';

    title.addEventListener('mouseenter', function () {
      var orig = title.textContent;
      var iterations = 0;
      var interval = setInterval(function () {
        title.textContent = orig.split('').map(function (char, idx) {
          if (char === ' ') return ' ';
          if (idx < iterations) return orig[idx];
          return glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }).join('');
        if (iterations >= orig.length) {
          clearInterval(interval);
          title.textContent = orig;
        }
        iterations += 1.5;
      }, 40);
    });
  }

  /* ============ 12. Année dynamique ============ */
  function initYear() {
    var el = document.getElementById('current-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ============ 13. vCard ============ */
  function readConfig() {
    var el = document.getElementById('contact-config');
    if (!el) return {};
    try { return JSON.parse(el.textContent); } catch (e) { return {}; }
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

  /* ============ 14. Toast ============ */
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
    toastEl._timer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2600);
  }

  /* ============ 15. Partage ============ */
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
        navigator.share(shareData).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareData.url).then(function () {
          showToast('Lien copié dans le presse-papiers');
        });
      } else {
        showToast(shareData.url);
      }
    });
  }

  /* ============ 16. QR code ============ */
  var qrLibPromise = null;
  function loadQrLibrary() {
    if (qrLibPromise) return qrLibPromise;
    qrLibPromise = new Promise(function (resolve, reject) {
      if (window.QRCode) return resolve();
      var script = document.createElement('script');
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
          canvasHost.textContent = 'Génération…';
          loadQrLibrary().then(function () {
            canvasHost.textContent = '';
            /* QR vert forêt sur fond blanc — lisible et dans la palette */
            new window.QRCode(canvasHost, {
              text: config.url || window.location.href,
              width: 200, height: 200,
              colorDark: '#1a4a28',
              colorLight: '#ffffff'
            });
            generated = true;
          }).catch(function () {
            canvasHost.textContent = 'Impossible de charger le générateur de QR code.';
          });
        }
      } else {
        box.setAttribute('hidden', '');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ============ 17. Dépôts GitHub — auto-actualisés ============ */
  /* Couleurs par langage */
  var LANG_COLORS = {
    'Kotlin': '#A97BFF', 'Python': '#3572A5', 'TypeScript': '#2b7489',
    'JavaScript': '#f1e05a', 'Java': '#b07219', 'HTML': '#e34c26',
    'CSS': '#563d7c', 'Bash': '#89e051', 'Shell': '#89e051'
  };

  function initGithubRepos() {
    var grid = document.getElementById('repos-grid');
    var status = document.getElementById('repos-status');
    var username = config.github;
    if (!grid || !username) return;

    /* Supprimer les skeletons après 8s si l'API ne répond pas */
    var skeletonTimeout = setTimeout(function () {
      grid.querySelectorAll('.repo-card--skeleton').forEach(function (s) { s.remove(); });
      if (status) { status.removeAttribute('hidden'); }
    }, 8000);

    fetch('https://api.github.com/users/' + encodeURIComponent(username) + '/repos?sort=updated&per_page=12')
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (repos) {
        clearTimeout(skeletonTimeout);
        /* Supprimer les skeletons */
        grid.querySelectorAll('.repo-card--skeleton').forEach(function (s) { s.remove(); });

        /* Filtrer les forks, trier par updated */
        var filtered = repos
          .filter(function (r) { return !r.fork; })
          .sort(function (a, b) { return new Date(b.updated_at) - new Date(a.updated_at); })
          .slice(0, 6);

        if (!filtered.length) {
          if (status) { status.textContent = 'Aucun dépôt public pour le moment.'; status.removeAttribute('hidden'); }
          return;
        }

        renderRepos(filtered);
      })
      .catch(function () {
        clearTimeout(skeletonTimeout);
        grid.querySelectorAll('.repo-card--skeleton').forEach(function (s) { s.remove(); });
        if (status) status.removeAttribute('hidden');
      });

    function timeAgo(dateStr) {
      var diff = Date.now() - new Date(dateStr).getTime();
      var days = Math.floor(diff / 86400000);
      if (days === 0) return 'aujourd\'hui';
      if (days === 1) return 'hier';
      if (days < 30) return 'il y a ' + days + ' j';
      var months = Math.floor(days / 30);
      if (months < 12) return 'il y a ' + months + ' mois';
      return 'il y a ' + Math.floor(months / 12) + ' an' + (Math.floor(months / 12) > 1 ? 's' : '');
    }

    function renderRepos(repos) {
      var frag = document.createDocumentFragment();
      repos.forEach(function (repo, idx) {
        var card = document.createElement('article');
        card.className = 'repo-card reveal';
        card.style.transitionDelay = (idx * 60) + 'ms';

        /* Nom + lien */
        var link = document.createElement('a');
        link.href = repo.html_url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.innerHTML = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg> ' + repo.name;
        card.appendChild(link);

        /* Description */
        var desc = document.createElement('p');
        desc.textContent = repo.description || 'Pas de description.';
        card.appendChild(desc);

        /* Méta : langage + étoiles + date */
        var meta = document.createElement('div');
        meta.className = 'repo-card__meta';

        if (repo.language) {
          var langDot = document.createElement('span');
          var color = LANG_COLORS[repo.language] || 'var(--moss)';
          langDot.innerHTML = '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + color + ';margin-right:4px;box-shadow:0 0 6px ' + color + '"></span>' + repo.language;
          meta.appendChild(langDot);
        }

        if (repo.stargazers_count > 0) {
          var stars = document.createElement('span');
          stars.textContent = '★ ' + repo.stargazers_count;
          meta.appendChild(stars);
        }

        var updated = document.createElement('span');
        updated.textContent = timeAgo(repo.updated_at);
        updated.style.marginLeft = 'auto';
        meta.appendChild(updated);

        card.appendChild(meta);
        frag.appendChild(card);
      });

      grid.appendChild(frag);

      /* Déclencher les révélations avec délai en cascade */
      setTimeout(function () {
        grid.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) {
          el.classList.add('is-visible');
        });
      }, 50);
    }
  }

  /* ============ 18. Effet hover 3D sur les cartes ============ */
  function initCardTilt() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;

    /* gsie-pillar est le nom réel dans le HTML (gsie-feature = alias CSS) */
    document.querySelectorAll('.project-card, .skill-group, .gsie-feature, .gsie-pillar').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        var tiltX = ((y - cy) / cy) * -6;
        var tiltY = ((x - cx) / cx) * 6;
        card.style.transform = 'translateY(-5px) perspective(600px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
        card.style.transition = 'transform 0.08s linear, box-shadow 0.3s, border-color 0.15s';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = '';
      });
    });
  }

  /* ============ 19. Section Terrain — masquage auto si aucune photo ============ */
  function initTerrain() {
    var section = document.getElementById('terrain');
    var imgs = section ? section.querySelectorAll('[data-terrain-img]') : [];
    if (!imgs.length) return;

    var failed = 0;
    var total = imgs.length;

    function onError() {
      /* Affiche le placeholder de la figure */
      var fig = this.closest('figure');
      if (fig) {
        var ph = fig.querySelector('.terrain-photo__placeholder');
        if (ph) ph.style.display = 'flex';
        this.style.display = 'none';
      }
      failed++;
      /* Toutes les photos ont échoué : masquer la section entière */
      if (failed === total) {
        section.hidden = true;
        /* Retirer aussi le lien "Terrain" de la nav */
        document.querySelectorAll('a[href="#terrain"]').forEach(function (a) {
          var li = a.closest('li');
          if (li) li.style.display = 'none';
          else a.style.display = 'none';
        });
      }
    }

    imgs.forEach(function (img) {
      img.addEventListener('error', onError);
      /* Si l'image est déjà en erreur (cached) */
      if (img.complete && img.naturalWidth === 0) onError.call(img);
    });
  }

  /* ============ 20. Ligne de scan animée (section GSIE) ============ */
  function initScanLine() {
    var illus = document.querySelector('.gsie__illustration');
    if (!illus) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return; /* inutile sur mobile */

    var line = document.createElement('div');
    line.style.cssText = [
      'position:absolute', 'left:0', 'right:0', 'height:1.5px',
      'background:linear-gradient(90deg,transparent,rgba(93,184,122,0.7),transparent)',
      'box-shadow:0 0 8px rgba(93,184,122,0.4)',
      'pointer-events:none', 'top:0',
      'animation:scan-line 3s linear infinite'
    ].join(';');
    illus.style.position = 'relative';
    illus.appendChild(line);

    /* keyframe injecté dynamiquement */
    var styleTag = document.createElement('style');
    styleTag.textContent = '@keyframes scan-line { from { top: 0%; } to { top: 100%; } }';
    document.head.appendChild(styleTag);
  }

  /* ============ 20. Service worker — désactivé, nettoyage forcé ============ */
  function initServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    /* Désenregistre tous les SW et vide tous les caches, puis recharge */
    navigator.serviceWorker.getRegistrations().then(function (regs) {
      var hadSW = regs.length > 0;
      regs.forEach(function (r) { r.unregister(); });
      caches.keys().then(function (keys) {
        keys.forEach(function (k) { caches.delete(k); });
        if (hadSW) window.location.reload();
      });
    });
  }

  /* ============ Initialisation ============ */
  document.addEventListener('DOMContentLoaded', function () {
    /* Révèle le contenu hero — supprime le masque anti-flash */
    document.documentElement.classList.remove('hero-loading');
    document.documentElement.classList.add('hero-ready');

    initTheme();
    initMobileNav();
    initSmoothScroll();
    initActiveNav();
    initHeader();
    initReveal();
    initParticles();
    initCursor();
    initParallax();
    initTypewriter();
    initCounters();
    initGlitch();
    initYear();
    initVCard();
    initShare();
    initQrCode();
    initGithubRepos();
    initCardTilt();
    initTerrain();
    initScanLine();
    initServiceWorker();
  });

})();
