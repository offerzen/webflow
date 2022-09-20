window.$loaded(function (window, document, $, undefined) {
  const body = $(document.body);
  const nav = $('.js-navbar');
  const menuButton = nav.find('.js-menu-button');

  const conversionContainer = nav.find('.js-conversion-dropdown');
  const conversionButton = nav.find('.js-sign-up-button');
  const conversionCloseButton = nav.find('.js-conversion-dropdown-close');
  const dropdownToggle = nav.find('.nav-dropdown-toggle');

  const menuOpenIcon = nav.find('.open-icon');
  const menuCloseIcon = nav.find('.close-icon');

  function showOpenIcon() {
    menuOpenIcon.show();
    menuCloseIcon.hide();
  }

  function showCloseIcon() {
    menuCloseIcon.show();
    menuOpenIcon.hide();
  }

  //is menu open function
  // use aria-expanded
  //return state of open icon (is visible?)

  function isMenuOpen() {
    if (menuButton.attr('aria-expanded') === 'true') {
      menuCloseIcon.show();
      menuOpenIcon.hide();
      $('.intercom-lightweight-app').hide();
    } else {
      menuOpenIcon.show();
      menuCloseIcon.hide();
      $('.intercom-lightweight-app').show();
    }
  }

  // ------------------
  // Actions when hamburger button is clicked
  // ------------------

  menuButton.on('click', function (event) {
    // Close conversion mega menu when mobile menu is open
    if (conversionContainer.css('display') === 'block') {
      conversionContainer.hide();
    }

    // Check if menu is open and set appropriate icon
    isMenuOpen();

    setTimeout(() => {
      if (menuButton.attr('aria-expanded') === 'true') {
        body.addClass('no-scroll');
      } else {
        body.removeClass('no-scroll');
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
    isMenuOpen();
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

  // if (conversionContainer.hasClass('w--open')) {
  //   conversionContainer.trigger('w-close');
  // }
});
