!(function () {
  window.$loaded(function (window, document, $, undefined) {
    const params = new URLSearchParams(window.location.search);
    $('.js-member-alert-message').val('');

    if (params.has('member')) {
      const alert = params.get('member');
      //show the relevant message based on alert
      switch (alert) {
        case 'invalid_token':
          $('.js-member-alert-message').text('This invite has been used already.');
          $('.js-member-alert').show();
          break;
        case 'already_exists':
          $('.js-member-alert-message').text("You've already been added as a member.");
          $('.js-member-alert').show();
          break;
        default:
          return;
      }

      //clean url
      var cleanSearch = window.location.search
        .replace(/member[^&]+&?/g, '')
        .replace(/&$/, '')
        .replace(/^\?$/, '');

      window.history.replaceState(
        {},
        '',
        window.location.pathname + cleanSearch
      );
    }

    //handle close alert icon
    $('.js-close-alert').on('click', this, function (e) {
      e.preventDefault();
      $('.js-member-alert').hide();
    });
  });
})();
