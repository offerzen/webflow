// This is to initialize the gtag script, which is required in order to run A/B test experiments using Google Optimize
// This is used in both employers pages, on the za page, as well as the nl page
!function(){
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-68966060-1');


  window.$loaded(function (window, document, $, undefined) {
    window.pageVariantMeasureStart = null;
    window.pageVariantMeasureEnd = null;
    let inputInteracted = false;

    const setTimeToInteract = function() {
      if (!inputInteracted) {
        inputInteracted = true;

        pageVariantMeasureStart = btoa((new Date().getTime() / 1000));
      }
    }

    const setTimeToSubmit = function() {
      pageVariantMeasureEnd = btoa((new Date().getTime() / 1000));
    }

    $("input, select").on("click focus", setTimeToInteract);
    $("form").on("submit", setTimeToSubmit);
  });
}();
