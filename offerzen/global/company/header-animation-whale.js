window.$loaded(function(window, document, $, undefined) {
  const animation = document.querySelector('[data-js="header-animation"]');
  animation.style.setProperty("--animation-state", "play");
})
