// Run callback when jQuery is ready
(function () {
  window.$loaded = function (cb) {
    setTimeout(() => {
      if (window.jQuery) {
        cb(window, document, $, undefined);
        return;
      }
      $loaded(cb);
    }, 50);
  };
})();
