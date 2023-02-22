!(function() {
  let counter = 0;
  const cb = function(e) {
    if (rx && window.location.pathname.includes('/area-roles')) {
      rx.trigger('apply');
      return
    }
    if (counter++ < 50) { // 4 minutes
      setTimeout(cb, 5000)
    }
  }
  cb()
})();
