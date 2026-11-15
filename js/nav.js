/* Меню на смартфоні (aria-expanded) і позначка поточного розділу (aria-current="true"). */
(function () {
  'use strict';

  var menuBtn = document.querySelector('.scm-menu-btn');
  var mobileNav = document.getElementById('mobile-nav');

  function setMenu(open) {
    if (!menuBtn || !mobileNav) return;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileNav.hidden = !open;
  }

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    // Пункт меню обрано — закриваємо меню
    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    // Escape закриває меню й повертає фокус на кнопку
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuBtn.focus();
      }
    });
    // Перехід на ширину планшета — меню не потрібне
    var wide = window.matchMedia('(min-width: 768px)');
    var onWide = function () { if (wide.matches) setMenu(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide); else wide.addListener(onWide);
  }

  // Поточний розділ
  var ids = ['tours', 'exhibits', 'courses', 'contacts'];
  var links = Array.prototype.slice.call(
    document.querySelectorAll('.scm-nav a[href^="#"], .mus-mobile-nav a[href^="#"]')
  );

  function setCurrent(id) {
    links.forEach(function (a) {
      if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  var sections = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var visible = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { visible[entry.target.id] = entry.isIntersecting; });
      // Найнижчий видимий розділ у верхній частині екрана
      var current = '';
      ids.forEach(function (id) { if (visible[id]) current = id; });
      setCurrent(current);
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(function (s) { observer.observe(s); });
  }
})();
