!(function () {
  window.$loaded(function (window, document, $, undefined) {
    // ------------------
    // Fast Track Access Success Analytics
    // ------------------
    const ready = function () {
      (function trackAnalytics() {
        analyticsBlock = $('#js-analytics-block');
        var name = analyticsBlock.attr('data-name');
        var category = analyticsBlock.attr('data-category');
        var action = analyticsBlock.attr('data-action');
        var source = analyticsBlock.attr('data-source');
        var label = analyticsBlock.attr('data-label');

        let properties = { category, action, label, source };

        analytics.track(name, properties, {
          integrations: { Intercom: false },
        });
      })();
    };

    $(document).ready(ready);
    $(document).on('page:load', ready);
  });
})();
