/* =========================================================
   DESTRIER — Scroll Driven 360°
   O carro acompanha a posição do scroll dentro da seção.
   ========================================================= */

(function () {
  'use strict';

  function initTopbar() {
    var bar = document.getElementById('topbar');
    if (!bar) return;
    function onScroll() {
      bar.classList.toggle('solid', window.scrollY > 60);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* =======================================================
     BUGATTI-STYLE SCROLL DRIVEN VIDEO
     O scroll controla diretamente o currentTime do turntable.
     ======================================================= */
  function initScrollDriven360() {
    var section = document.querySelector('[data-scroll-video]');
    if (!section) return;

    var viewer = section.querySelector('.destrier-video-frame');
    var video = section.querySelector('[data-destrier-video]');
    var button = section.querySelector('[data-video-toggle]');
    if (!viewer || !video) return;

    var raf = null;
    var targetTime = 0;
    var renderedTime = -1;
    var auto = false;
    var autoProgress = 0;

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function progress() {
      var rect = section.getBoundingClientRect();
      var scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return 0;
      return clamp(-rect.top / scrollable, 0, 1);
    }

    function updateButton() {
      if (!button) return;
      button.innerHTML = auto
        ? '<span class="play-icon">Ⅱ</span> PARAR 360'
        : '<span class="play-icon">▶</span> AUTO 360';
      button.classList.toggle('active', auto);
    }

    function render() {
      raf = null;
      if (!video.duration || !isFinite(video.duration)) {
        requestUpdate();
        return;
      }

      var p = auto ? autoProgress : progress();
      targetTime = p * Math.max(0, video.duration - 0.05);

      // Suavização leve para o movimento ficar cinematográfico.
      var delta = targetTime - renderedTime;
      if (renderedTime < 0) renderedTime = targetTime;
      else renderedTime += delta * 0.28;

      if (Math.abs(video.currentTime - renderedTime) > 0.018) {
        try { video.currentTime = renderedTime; } catch (e) {}
      }

      viewer.style.setProperty('--scroll-progress', p.toFixed(4));
      viewer.style.setProperty('--car-scale', (1 + Math.sin(p * Math.PI) * 0.025).toFixed(4));

      var label = section.querySelector('[data-video-progress]');
      if (label) label.style.transform = 'scaleX(' + p + ')';

      var status = section.querySelector('[data-video-status]');
      if (status) status.textContent = String(Math.round(p * 360)).padStart(3, '0') + '° / 360°';

      if (auto) {
        autoProgress += 0.0015;
        if (autoProgress > 1) autoProgress = 0;
        requestUpdate();
      }
    }

    function requestUpdate() {
      if (raf === null) raf = requestAnimationFrame(render);
    }

    video.addEventListener('loadedmetadata', requestUpdate);
    video.addEventListener('canplay', requestUpdate);
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });

    if (button) {
      button.addEventListener('click', function () {
        auto = !auto;
        autoProgress = progress();
        updateButton();
        requestUpdate();
      });
    }

    // Não deixamos o navegador reproduzir sozinho: o scroll é o controlador.
    video.pause();
    video.currentTime = 0;
    updateButton();
    requestUpdate();
  }

  function initMobileMenu() {
    var button = document.querySelector('.menu');
    var nav = document.querySelector('#topbar nav');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      nav.classList.toggle('mobile-open');
      button.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('mobile-open');
        button.classList.remove('open');
      });
    });
  }

  function init() {
    initTopbar();
    initReveal();
    initScrollDriven360();
    initMobileMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

