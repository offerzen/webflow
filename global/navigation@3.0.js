!function () {
  window.$loaded(function (window, document, $, undefined) {
    const body = $(document.body);
    const nav = $('.js-navbar');
    const menuButton = nav.find('.js-menu-button');

    const conversionContainer = nav.find('.js-conversion-dropdown');
    const conversionButton = nav.find('.js-sign-up-button');
    const conversionCloseButton = nav.find('.js-conversion-dropdown-close');

    const menuOpenIcon = nav.find('.open-icon');
    const menuCloseIcon = nav.find('.close-icon');

    function showOpenIcon() {
      menuOpenIcon.show();
      menuCloseIcon.hide();
      $('.intercom-lightweight-app').show();
    }

    function showCloseIcon() {
      menuCloseIcon.show();
      menuOpenIcon.hide();
      $('.intercom-lightweight-app').hide();
    }

    // ------------------
    // Actions when hamburger button is clicked
    // ------------------

    menuButton.on('click', function (event) {
      // Close conversion mega menu when mobile menu is open
      if (conversionContainer.css('display') === 'block') {
        conversionContainer.hide();
      }

      // Delay actions to make sure Webflow has finished it's click event
      setTimeout(() => {
        if (menuButton.hasClass('w--open')) {
          body.addClass('no-scroll');
          showCloseIcon();
        } else {
          body.removeClass('no-scroll');
          showOpenIcon();
        }
      }, 1);
    });

    // ------------------
    // Custom 'sign up' conversion mega menu
    // ------------------

    conversionButton.add(conversionCloseButton).on('click', function (event) {
      if (conversionContainer.css('display') === 'none') {
        conversionContainer.show();
      } else {
        conversionContainer.hide();
      }

      // Check if menu is open and set appropriate icon
      if (menuButton.hasClass('w--open')) {
        showOpenIcon();
      }
    });

    // Close conversion mega menu if click anywhere outside
    document.addEventListener('click', function (event) {
      if (
        event.target.closest('.js-conversion-dropdown') ||
        event.target.closest('.js-sign-up-button')
      ) {
        return;
      }
      conversionContainer.hide();
    });

    $(document).ready(ready);
    $(document).on('page:load', ready);
  });
}();
