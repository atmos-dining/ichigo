(function () {
  'use strict';

  // body の data-page 属性で現在ページを識別（例: data-page="menu"）
  const currentPage = document.body.dataset.page || 'home';

  // common.js の src パスから ROOT（ルートへの相対パス）を計算
  function getRootPath() {
    const scripts = document.querySelectorAll('script[src]');
    for (const s of scripts) {
      const src = s.getAttribute('src');
      if (src && src.includes('common.js')) {
        const ups = (src.match(/\.\.\//g) || []).length;
        return '../'.repeat(ups);
      }
    }
    return './';
  }
  const ROOT = getRootPath();

  // ===== ヘッダー読み込み =====
  function loadHeader() {
    const mount = document.getElementById('shared-header');
    if (!mount) return;
    fetch(ROOT + 'partials/header.html')
      .then(r => r.text())
      .then(html => {
        // "./" プレフィックスを ROOT に書き換え（サブフォルダでも正しいパスに）
        html = html.replace(/href="\.\//g, 'href="' + ROOT);
        mount.outerHTML = html;
        initNav();
        initDrawer();
      })
      .catch(function () {});
  }

  // ===== 共通下部（予約・アクセス・フッター）読み込み =====
  function loadBottom() {
    const mount = document.getElementById('shared-bottom');
    if (!mount) return;
    fetch(ROOT + 'partials/bottom.html')
      .then(r => r.text())
      .then(html => {
        // "./" プレフィックスを ROOT に書き換え
        html = html.replace(/href="\.\//g, 'href="' + ROOT);
        mount.innerHTML = html;
        // 差し込まれたセクションを即表示
        mount.querySelectorAll('.section').forEach(function (sec) {
          sec.classList.add('is-inview');
        });
        // ホームページでは「トップに戻る」ボタンを非表示
        if (currentPage === 'home') {
          mount.querySelectorAll('.js-hide-on-home').forEach(function (el) {
            el.style.display = 'none';
          });
        }
        // ハッシュアンカースクロール（#reserve / #access など）
        var hash = location.hash;
        if (hash) {
          setTimeout(function () {
            var target = document.querySelector(hash);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          }, 400);
        }
      })
      .catch(function () {});
  }

  // ===== ナビアクティブ状態を設定 =====
  function initNav() {
    if (currentPage === 'home') return;
    document.querySelectorAll('.global-nav a, .drawer a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (
        (currentPage === 'menu'   && href.includes('menu.html')) ||
        (currentPage === 'course' && href.includes('course.html')) ||
        (currentPage === 'drink'  && href.includes('drink.html')) ||
        (currentPage === 'blog'   && href.includes('index.html#blog'))
      ) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  // ===== ドロワーメニュー（スマホ） =====
  function initDrawer() {
    var navBtn  = document.querySelector('.nav-toggle');
    var drawer  = document.querySelector('#drawerMenu');
    var overlay = document.querySelector('#drawerOverlay');
    if (!navBtn || !drawer || !overlay) return;

    function openDrawer() {
      drawer.classList.add('is-open');
      overlay.classList.add('is-open');
      navBtn.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
      drawer.classList.remove('is-open');
      overlay.classList.remove('is-open');
      navBtn.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    navBtn.addEventListener('click', function () {
      drawer.classList.contains('is-open') ? closeDrawer() : openDrawer();
    });
    document.querySelectorAll('[data-close="drawer"]').forEach(function (el) {
      el.addEventListener('click', closeDrawer);
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeDrawer);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  // ===== ページトップボタン（右下固定） =====
  function initPageTop() {
    var pageTop = document.querySelector('.page-top');
    if (!pageTop) return;
    function toggle() {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (y > 480) pageTop.classList.add('is-show');
      else pageTop.classList.remove('is-show');
    }
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
  }

  // ===== スクロールリビール（.section → is-inview） =====
  function initScrollReveal() {
    var sections = document.querySelectorAll('.section');
    if (!sections.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
    sections.forEach(function (sec) { io.observe(sec); });
  }

  // ===== 初期化 =====
  document.addEventListener('DOMContentLoaded', function () {
    loadHeader();
    loadBottom();
    initPageTop();
    initScrollReveal();
  });

})();
