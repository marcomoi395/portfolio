function onLoad() {
  setupExternalLinks();
}

document.addEventListener('DOMContentLoaded', setupPageTransitions);

function setupExternalLinks() {
  document.querySelectorAll('a[href]').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('/') || href.startsWith('./') || href.startsWith('../') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });
}

function setupPageTransitions() {
  document.querySelectorAll('a[href]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target || link.hasAttribute('download')) return;

      var url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.hash) return;

      event.preventDefault();
      document.body.classList.add('is-leaving');
      var delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 120;

      window.setTimeout(function () {
        window.location.href = url.href;
      }, delay);
    });
  });
}