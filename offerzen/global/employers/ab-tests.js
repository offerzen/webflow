// This is to initialize the gtag script, which is required in order to run A/B test experiments using Google Optimize
// This is used in both employers pages, on the za page, as well as the nl page
!function(){
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-68966060-1');
}();
