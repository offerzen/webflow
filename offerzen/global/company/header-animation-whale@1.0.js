window.$loaded(function(window, document, $, undefined) {
  const animation = document.querySelector('[data-js="header-animation"]');
  animation.classList.add('js-intro-play');
  const rainbow = document.querySelector('[data-js="rainbow"]');
  rainbow.addEventListener('click', () => {
    animation.classList.remove('js-intro-play');
    requestAnimationFrame(() => {
      animation.classList.add('js-intro-play');
    });
  });
});
