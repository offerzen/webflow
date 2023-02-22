!(function() {
  const cb = function(e) {
    if (rx && window.location.includes('area-roles')) {
      rx.trigger('apply');
    }
  }
  window.addEventListener('popstate', cb, { once: true });
})();
