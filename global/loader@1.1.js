// Run callback when jQuery is ready
(function () {
  console.log('loader')

  window.$loaded = function (cb) {
    setTimeout(() => {
      if (window.jQuery) {
        console.log('loader run')
        cb(window, document, $, undefined)
        return
      }
      $loaded(cb)
    }, 50)
  };
})();
