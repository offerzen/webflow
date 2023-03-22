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
    const setTimeToInteract = function() {
      if (window.pageVariantMeasureStart == null) {        

        window.pageVariantMeasureStart = btoa((new Date().getTime() / 1000));
      }
    }

    const setTimeToSubmit = function() {
      window.pageVariantMeasureEnd = btoa((new Date().getTime() / 1000));
    }

    $("input, select").on("click focus", setTimeToInteract);
    $(".company-form-email-only form, .js-company-signup-original form, .js-company-prospect-form form").on("submit", setTimeToSubmit);
  });
}();
