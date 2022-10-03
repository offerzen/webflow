!function () {
  window.$loaded(function (window, document, $, undefined) {
    var ready = function () {
      (function trackCTAAnalytics() {
        function trackCTAElement() {
          var link = $(this);
          var name = link.attr('data-name');
          var category = link.attr('data-category');
          var action = link.attr('data-action');
          var source = link.attr('data-source');
          var label = link.attr('data-label');
          var source_detail = link.attr('data-source-detail');

          var properties = { category, action, source, label, source_detail };

          link.on('click', function (e) {
            //disable clicks
            link.attr('style', 'pointer-events: none');

            analytics.track(
              name,
              properties,
              { integrations: { Intercom: false } },
              function () {
                //enable clicks
                link.attr('style', 'pointer-events: auto');
              }
            );
          });
        }

        // Some pages use -cta, some use -nav
        $('[data-js="track-nav"]').each(trackCTAElement);
        $('[data-js="track-cta"]').each(trackCTAElement);
      })();
    };

    $(document).ready(ready);
    $(document).on('page:load', ready);
  });
}();
