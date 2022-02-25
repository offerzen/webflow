// Run callback when jQuery is ready
(function () {
  console.log('loader')

  window.$loaded = function (cb) {
    setTimeout(() => {
      if (window.jQuery) {
        cb(window, document, $, undefined)
        return
      }
      console.log('loader run', cb.name)
      $loaded(cb)
    }, 50)
  };
})();
