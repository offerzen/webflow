$loaded(
  function(window, document, $, undefined){
    var ready = function(){
      // Init
      // --------------------------------------------------
      const $buttonLoader = $('.js-button-loader')
      const $formContainer = $('.js-form-container');
      const $form = $formContainer.find('.newsletter-form');
      $form.parsley();
      const $formError = $formContainer.find('.js-form-error');
      const $formSuccess = $formContainer.find('.js-form-success');
      const $submitBtn = $form.find('input[type=\'submit\']');

      $buttonLoader.hide();
      $submitBtn.show();

      function submitForm () {
        const data = formToJSON($form.serializeArray());
        $submitBtn.prop('disabled', true);
        $submitBtn.text('Subscribing...');
        $formError.hide();

        var oldRecaptchaValue = data["g-recaptcha-response-data[webflow]"]
        data["g-recaptcha-response-data"]= { "webflow": oldRecaptchaValue }
        delete data["g-recaptcha-response-data[webflow]"]

        // This submit will only run if the parsley validation defined in the HTML passed
        $.ajax({
          url: `/blog/subscribe`,
          contentType: 'application/json',
          data: JSON.stringify(data),
          type:'POST',
          headers: {
            // Forces JSON return type otherwise it's responded to as HTML
            Accept: 'application/json',
          }
        })
        .done(data => {
          $formSuccess.show();
          $form.hide();
          analytics.identify(data.subscriber_id, {}, { integrations: { Clearbit: false }});
        })
        .fail((request, status, error) => {
          var notice = '';
          var responseBody = request.responseJSON
          if (responseBody && responseBody.recaptcha_verify) {
            var recaptchaPart = error.part
            grecaptcha.execute('6Lf802weAAAAAHgxndx9NIZ3FTzdG3f7nBua2rRY', {action: `webflow`}).then(function(token) {
              var element = document.getElementById('g-recaptcha-response-data-webflow');
              element.value = token;
            });
            notice = 'ReCAPTCHA failed. Please try again.';
          }
          else {
            notice = 'Unfortunately something has gone wrong.';
          }
          $formError.text(notice);
          $formError.show();
        })
        .always(() => {
          $submitBtn.prop('disabled', false);
          $submitBtn.text('Subscribe');
        });
      }

      $form.on('submit', e => {
        // todo: only stop do these if any required fields are missing
        e.preventDefault();
        e.stopPropagation()
        e.stopImmediatePropagation()

        grecaptcha.ready(function() {
          grecaptcha.execute('6Lf802weAAAAAHgxndx9NIZ3FTzdG3f7nBua2rRY', {action: 'webflow'}).then(function(token) {
            var element = document.getElementById('g-recaptcha-response-data-webflow');
            element.value = token;
            submitForm();
          });
        });
      });
    }

    // Functions
    // --------------------------------------------------
    // takes a serialised array and transforms it into a object that can be stringified
    function formToJSON (formOutputArr) {
      return formOutputArr.reduce((acc, element) => {
        acc[element.name] = element.value;
        return acc;
      }, {})
    }

    $(document).ready(ready);
    $(document).on('page:load', ready);
  }
)
