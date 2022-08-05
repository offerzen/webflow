!(function () {
  window.$loaded(function (window, document, $, undefined) {
    var ready = function () {
      const searchParams = new URLSearchParams(window.location.search);

      function checkParam(paramKey) {
        if (searchParams.has(paramKey)) {
          const paramValue = searchParams.get(paramKey);
          return paramValue !== 'undefined';
        }
      }

      function cleanSuccessUrl() {
        const url = new URL(window.location);
        // deleting HubSpot params from searchParams
        url.searchParams.delete('__hssc');
        url.searchParams.delete('__hstc');
        url.searchParams.delete('__hsfp');
        window.history.replaceState(null, null, url);
      }

      function trackBookACall() {
        // checking if HubSpot params are valid
        if (checkParam('__hssc') && checkParam('__hstc') &&checkParam('__hsfp')) {
          var name = 'Lead: Booked a call';
          var category = 'marketing pages';
          var action = 'page load after booking a call';
          var source = 'demand landing page';
          var label = 'booked a call success page';
          var source_detail = 'success page';
  
          var properties = { category, action, source, label, source_detail };
          analytics.track(name, properties, {
            integrations: { Intercom: false },
          });
        }
        cleanSuccessUrl();
      }

      trackBookACall();
    };

    $(document).ready(ready);
    $(document).on('page:load', ready);
  });
})();
