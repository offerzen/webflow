!(function () {
  window.$loaded(function (window, document, $, undefined) {
    let optionParam = '';
    const hubspotCallUrl = 'https://meetings.hubspot.com/nickreid/sdr-eu-booking';
    $('#complete-form').click(function () {
      optionParam = 'complete-form';
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('prospect_id')) {
        const prospectId = urlParams.get('prospect_id');
        window.location = `/hire/get-started/role?prospect_id=${prospectId}?option=${optionParam}`;
      }
    });
    
    $('#book-call').click(function () {
      optionParam = 'book-call';
      window.location = `${hubspotCallUrl}?prospect_id=${prospectId}?option=${optionParam}`;
    });

    $(document).ready(ready);
    $(document).on('page:load', ready);
  });
})();
