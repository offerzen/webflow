!(function () {
  window.$loaded(function (window, document, $, undefined) {
    var ready = function () {
      const searchParams = new URLSearchParams(window.location.search);

      function checkParam(paramKey) {
        const paramValue = searchParams.get(paramKey);
        return paramValue !== null && paramValue !== 'undefined';
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
        if (checkParam('__hssc') && checkParam('__hstc') && checkParam('__hsfp')) {
          var name = 'Company: Call Booked';
          var category = 'Core';
          var action = 'demo call booked';
          var source = 'demand landing page';
          var label = 'call booking success page';
  
          var properties = { category, action, source, label };
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
