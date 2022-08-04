!(function () {
  window.$loaded(function (window, document, $, undefined) {
    const searchParams = new URLSearchParams(window.location.search);
    $('.js-member-alert-message').val('');

    if (searchParams.has('member')) {
      const memberAlert = searchParams.get('member');
      //show the relevant message based on alert
      switch (memberAlert) {
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
      searchParams.delete('member');
      const url = new URL(window.location);
      url.searchParams = searchParams;
      window.history.replaceState({}, '', url.pathname + url.search); // includes `?`
    }

    //handle close alert icon
    $('.js-close-alert').on('click', this, function (e) {
      e.preventDefault();
      $('.js-member-alert').hide();
    });
  });
})();
