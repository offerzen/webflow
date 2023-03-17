!(function () {
  window.$loaded(function (window, document, $, undefined) {
    const body = $(document.body);
    const nav = $('.js-navbar');

    const conversionContainer = nav.find('.js-conversion-dropdown');
    const conversionButton = nav.find('.js-conversion-button');
    const conversionSignUpButton = nav.find('.js-sign-up-button');

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
        conversionContainer.attr('data-visible', 'false');
        conversionSignUpButton.removeClass('active-conversion-button');
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
        conversionSignUpButton.addClass('active-conversion-button');
        conversionContainer.attr('data-visible', 'true');
      } else {
        conversionSignUpButton.removeClass('active-conversion-button');
        conversionContainer.attr('data-visible', 'false');
      }

      // Check if menu is open, close it and open conversion
      if (menuButton.hasClass('w--open')) {
        showOpenIcon();
        menuButton.triggerHandler('tap');
        conversionSignUpButton.addClass('active-conversion-button');
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
      conversionSignUpButton.removeClass('active-conversion-button');
      conversionContainer.attr('data-visible', 'false');
    });

    // ------------------
    // Nav breadcrumbs / highlight
    // ------------------

    // Check if the link contains offerzen.com
    function isOnDomain(href) {
      let isValid = href.match(/^https:\/\/www\.offerzen\.com/) != null;

      isValid ||= href.match(/^\//) != null;

      return isValid;
    }

    function checkLinkMatch(linkHref) {
      if (!isOnDomain(linkHref)) {
        return false;
      }

      // Add domain if URL starts with forward slash
      if (linkHref.match(/^\//)) {
        linkHref = `https://www.offerzen.com${linkHref}`;
      }
      
      // Remove trailing forward slash in URL
      if (linkHref.match(/\/$/)) {
        linkHref = linkHref.replace(/\/$/, '');
      }
      
      // Removes search params or UTMs
      const pageHref = `${window.location.origin}${window.location.pathname}`;

      return pageHref === linkHref;
    }

    function highlightCurrentLink() {
      const navLinks = $('[data-js="nav-dropdown-container"]').find('a');

      navLinks.each(function () {
        const link = $(this);
        const linkURL = link.attr('href');

        if (checkLinkMatch(linkURL)) {
          link
            .closest('[data-js="nav-dropdown"]')
            .find('[data-js="nav-dropdown-toggle"]')
            .addClass('current-parent');
          link.addClass('current-link');
        }
      });
    }

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

        $('[data-js="navigation-tracking"]').each(trackElement);
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

      highlightCurrentLink();
    };

    $(document).ready(ready);
    $(document).on('page:load', ready);
  });
})();
