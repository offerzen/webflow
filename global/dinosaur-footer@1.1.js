!function(){
  console.log('dino')

  const dino = window.$loaded(function(window, document, $, undefined) {
    console.log('dino run')
    $('.footer__dinosaur').on('click', function(event) {
      $('.footer__dinosaur').removeClass('dino-run');

      var dinoSvg1 = $('.dino-step-1');
      var dinoSvg2 = $('.dino-step-2');

      dinoSvg1.addClass('dino-step-1-animation');
      dinoSvg2.addClass('dino-step-2-animation');

      setTimeout(function () {
        $('.footer__dinosaur').addClass('dino-run');
      }, 100)
    });
  });

  setTimeout(dino, 4000);
}();
