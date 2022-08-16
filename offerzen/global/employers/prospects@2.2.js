window.$loaded(function () {
  window.$parsleyLoaded = function (cb) {
    setTimeout(() => {
      if (window.Parsley && window.ParsleyValidator) {
        cb(window, document, parsley, undefined);
        return;
      }
      $parsleyLoaded(cb);
    }, 50);
  };

  window.$parsleyLoaded(function (window, document, parsley) {
    const emailOnlyProspectForm = $('#Company-Lead-Form-Email-Only');

    function retrieveProspectJourney() {
      if ('emailValueC' in localStorage) {
        // Redirect to book a call
        window.location.href = '/employers/book-a-call';
      }
    }

    function storeEmailValuePreBookCall() {
      // Store email
      let emailValue = emailOnlyProspectForm.find('#contact_email').val();
      localStorage.setItem('emailValueC', emailValue);
    }

    function onSubmitEmailOnlyProspectForm(token, e) {
      const formSubmitButton = emailOnlyProspectForm.find('input[type=submit]');
      formSubmitButton.attr('disabled', true);

      let initialButtonValue = formSubmitButton.attr('value');
      let dataWait = formSubmitButton.attr('data-wait');
      formSubmitButton.attr('value', dataWait);

      // get the value of the report_source query parameter should it be present and forward it onto form lead submission for analytics
      let searchParams = new URLSearchParams(window.location.search);
      const formData = new FormData(emailOnlyProspectForm[0]);
      const formProperties = Object.fromEntries(formData.entries());
      if (emailOnlyProspectForm.parsley().validate()) {
        emailOnlyProspectForm.find('.js-missing-fields').hide();
        $.ajax({
          type: 'POST',
          url: '/company/form_prospects',
          data: JSON.stringify(
            Object.assign({}, formProperties, {
              referrer: location.href,
              lead_form_type: emailOnlyProspectForm
                .find('.js-label-analytics')
                .text(),
              report_source: searchParams.get('report_source'),
              'g-recaptcha-response-data': {
                webflow: token,
              },
            })
          ),
          contentType: 'application/json',
          headers: {
            Accept: 'application/json',
          },
          success: function (data) {
            if (data.user_id) {
              // Store email
              storeEmailValuePreBookCall();

              // Redirect to book a call
              window.location.href = '/employers/book-a-call';
            }
          },
          // Reset form
          error: function (data) {
            formSubmitButton.attr('disabled', false);
            formSubmitButton.attr('value', initialButtonValue);
          },
        });
      } else {
        emailOnlyProspectForm.find('.js-missing-fields').show();
        formSubmitButton.attr('disabled', false);
        formSubmitButton.attr('value', initialButtonValue);
      }
    }

    function matchCheckboxStates() {
      emailOnlyProspectForm.find('.w-checkbox').each(function () {
        const el = $(this);
        const inputField = el.find('.w-checkbox-input');
        if (el.find('input[type=checkbox]').is(':checked')) {
          inputField.addClass('w--redirected-checked');
        } else {
          inputField.removeClass('w--redirected-checked');
        }
      });
    }
    // ------------------------------------------------------------
    // Setup form
    // ------------------------------------------------------------
    (function init() {
      //Check Recaptcha error
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('r')) {
        $('.recaptcha-error').show();
      }

      // Load testing
      let isFormReady = false;

      function onFormReady() {
        if (!isFormReady) return;
        // Form is ready, but might still be waiting for recaptcha. That has it's own check in submit, so can be ignored
        const submitButton = emailOnlyProspectForm.find('#continue-button');
        submitButton.attr('disabled', false);
        submitButton.on('click', function (e) {
          e.preventDefault();
          grecaptcha.ready(function () {
            grecaptcha
              .execute('6Lf802weAAAAAHgxndx9NIZ3FTzdG3f7nBua2rRY', {
                action: 'webflow',
              })
              .then(function (token) {
                onSubmitEmailOnlyProspectForm(token, e);
              });
          });
        });
      }

      retrieveProspectJourney();
      matchCheckboxStates();
      // Still needed for other parts of the page
      window.onSubmitEmailOnlyProspectForm = onSubmitEmailOnlyProspectForm;
      isFormReady = true;
      onFormReady();
    })();
  });
});
