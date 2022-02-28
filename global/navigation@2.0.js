!function () {
  window.$loaded(function (window, document, $, undefined) {
    $('.js-nav-mobile-menu-button').on('click', function (event) {
      if ($('.js-nav-mobile-menu').hasClass('open-nav-menu')) {
        $('.js-body').removeClass('no-scroll');
        $('.js-primary-nav-bar').removeClass('fixed');
        $('.js-nav-mobile-menu').removeClass('open-nav-menu');
        $('.js-nav-mobile-menu').addClass('close-nav-menu');
      } else {
        $('.js-body').addClass('no-scroll');
        $('.js-primary-nav-bar').addClass('fixed');
        $('.js-nav-mobile-menu').removeClass('close-nav-menu');
        $('.js-nav-mobile-menu').addClass('open-nav-menu').scrollTop(0);
      }
    });

    var ready = function () {
      (function trackAnalytics() {
        function trackElement () {
          var link = $(this);
          var name = link.attr('data-name');
          var category = link.attr('data-category');
          var action = link.attr('data-action');
          var source = link.attr('data-source');
          var label = link.attr('data-label');
          var source_detail = link.attr('data-source-detail');
          var href = link.attr('href');

          var properties = { category, action, source, label, source_detail };

          link.one('click', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();

            analytics.track(
              name,
              properties,
              { integrations: { Intercom: false } },
              function () {
                return window.location.href = href;
              }
            );
          });
        }

        // Some pages use -cta, some use -nav
        $('[data-js="track-nav"]').each(trackElement);
        $('[data-js="track-cta"]').each(trackElement);
      })();
    };

    $(document).ready(ready);
    $(document).on('page:load', ready);
  });
}();
