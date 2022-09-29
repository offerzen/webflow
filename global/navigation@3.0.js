!(function () {
  window.$loaded(function (window, document, $, undefined) {
    const body = $(document.body);
    const nav = $('.js-navbar');

    const conversionContainer = nav.find('.js-conversion-dropdown');
    const conversionButton = nav.find('.js-conversion-button');

    const menu = nav.find('.items-container');
    const menuButton = nav.find('.js-menu-button');
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

    function setMenuHeight() {
      if ($(window).width() <= 991) {
        menu.css('height', window.innerHeight - 61);
      } else {
        menu.css('height', 'auto');
      }
    }

    // ------------------
    // Actions when hamburger button is clicked
    // ------------------

    menuButton.on('click', function () {
      // Close conversion mega menu when mobile menu is open
      if (conversionContainer.attr('data-visible') === 'true') {
        conversionContainer.attr('data-visible', 'false')
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
        setMenuHeight();
      }, 30);
    });

    // ------------------
    // Custom 'sign up' conversion mega menu
    // ------------------

    conversionButton.on('click', function () {
       if (conversionContainer.attr('data-visible') === 'false') {
         conversionContainer.attr('data-visible', 'true');
       } else {
         conversionContainer.attr('data-visible', 'false');
       }
       
      // Check if menu is open, close it and open conversion
      if (menuButton.hasClass('w--open')) {
        showOpenIcon();
        menuButton.triggerHandler('tap');
        conversionContainer.attr('data-visible', 'true');
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
      conversionContainer.attr('data-visible', 'false');
    });

    // ------------------
    // Analytics
    // ------------------

    const ready = function () {
      (function trackAnalytics() {
        function onElementClick() {
          let name = nav.find('.js-analytics-props-name-full-nav').text();
          let category = nav
            .find('.js-analytics-props-category-full-nav')
            .text();
          let source_detail = nav
            .find('.js-analytics-props-source-detail-full-nav')
            .text();
          let link = $(this);
          let action =
            link.attr('data-action') ??
            link.find('.js-analytics-props-data-action').text();
          let label = window.location.href;

          let properties = { category, action, label, source_detail };

          analytics.track(name, properties, {
            integrations: { Intercom: false },
          });
        }

        function trackElement() {
          let link = $(this);
          link.on('click', onElementClick);
        }

        $('[data-js="track-nav"]').each(trackElement);
      })();

      function debounce(func, timeout = 10) {
        let timer;
        return (...args) => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            func.apply(this, args);
          }, timeout);
        };
      }

      setMenuHeight();
      $(window).on('resize', debounce(setMenuHeight, 40));
    };

    $(document).ready(ready);
    $(document).on('page:load', ready);
  });
})();
