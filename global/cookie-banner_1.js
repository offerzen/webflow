!function(){
  const loadCookieBanner = () => $loaded(
    function (window, document, $, undefined) {
      var ready = function () {
        if (getCookie('_zadev_cb_acc')) { return }
        const $cookieBanner = $('.js-cookie-banner')
        const $acceptButton = $('.js-cookie-button')
        // if there is no auth cookie and no banner cookie call the endpoint
        isEuUser()
          .then(function (resp) {
            // if the endpoint says we should show the banner show the banner
            if (resp.show_cookie_banner) { $cookieBanner.show() }

            // if the banner is visible & user accepts the banner call the accept endpoint
            if ($cookieBanner.is(":visible")) {
              $acceptButton.on('click', this, function (e) {
                e.preventDefault()
                acceptCookies()
                  .then(function () {
                    // hide the banner
                    $cookieBanner.hide()
                  })
              })
            }
          })
          .catch(function (err) { throw new Error(err) })
      }
      // Functions
      // --------------------------------------------------



      function isEuUser() {
        return queryIpLocation()
      }

      function acceptCookies() {
        return queryIpLocation({ accepted: true })
      }

      function queryIpLocation(queryParams) {
        return $.ajax({
          url: `https://www.offerzen.com/api/cb`,
          headers: {
            'Accept': 'text/html',
          },
          contentType: 'text/plain',
          data: queryParams
        })
      }

      function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
      }

      $(document).ready(ready);
      $(document).on('page:load', ready);
    }
  )

  setTimeout(loadCookieBanner, 3000);
}();
