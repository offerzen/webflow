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
    function retrieveProspectJourney() {
      if ('emailValue' in localStorage && 'acceptedTerms' in localStorage) {
        // Redirect to book a call
        window.location.href = '/employers/book-a-call';
      }
    }

    function storeEmailAndTermsOfServiceValues() {
      // Store email
      localStorage.setItem('emailValue', emailValue);

      // Store terms of service
      if ($('#accepted_terms_of_service').is(':checked')) {
        localStorage.setItem('acceptedTerms', 'on');
      } else {
        localStorage.setItem('acceptedTerms', 'off');
      }
    }

    function onSubmitSingleStepProspectForm(token, e) {
      const singleStepProspectForm = $('#Company-Lead-Form-Email-Only');
      singleStepProspectForm.find('input[type=submit]').attr('disabled', true);
      let initialButtonValue = singleStepProspectForm
        .find('input[type=submit]')
        .attr('value');
      let dataWait = singleStepProspectForm
        .find('input[type=submit]')
        .attr('data-wait');
      singleStepProspectForm.find('input[type=submit]').attr('value', dataWait);

      // get the value of the report_source query parameter should it be present and forward it onto form lead submission for analytics
      let searchParams = new URLSearchParams(window.location.search);
      const formData = new FormData(singleStepProspectForm[0]);
      const formProperties = Object.fromEntries(formData.entries());
      if (singleStepProspectForm.parsley().validate()) {
        singleStepProspectForm.find('.js-missing-fields').hide();
        $.ajax({
          type: 'POST',
          url: '/company/form_prospects',
          data: JSON.stringify(
            Object.assign({}, formProperties, {
              referrer: location.href,
              lead_form_type: singleStepProspectForm
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
              // Store email and accepted T&Cs
              storeEmailAndTermsOfServiceValues();

              // Redirect to book a call
              window.location.href = '/employers/book-a-call';
            }
          },
          // Reset form
          error: function (data) {
            singleStepProspectForm
              .find('input[type=submit]')
              .attr('disabled', false);
            singleStepProspectForm
              .find('input[type=submit]')
              .attr('value', initialButtonValue);
          },
        });
      } else {
        singleStepProspectForm.find('.js-missing-fields').show();
        singleStepProspectForm
          .find('input[type=submit]')
          .attr('disabled', false);
        singleStepProspectForm
          .find('input[type=submit]')
          .attr('value', initialButtonValue);
      }
    }

    function matchCheckboxStates() {
      singleStepProspectForm.find('.w-checkbox').each(function () {
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
        const submitButton = singleStepProspectForm.find('#continue-button');
        submitButton.attr('disabled', false);
        submitButton.on('click', function (e) {
          e.preventDefault();
          grecaptcha.ready(function () {
            grecaptcha
              .execute('6Lf802weAAAAAHgxndx9NIZ3FTzdG3f7nBua2rRY', {
                action: 'webflow',
              })
              .then(function (token) {
                onSubmitSingleStepProspectForm(token, e);
              });
          });
        });
      }

      retrieveProspectJourney();
      matchCheckboxStates();
      // Still needed for other parts of the page
      window.onSubmitSingleStepProspectForm = onSubmitSingleStepProspectForm;
      isFormReady = true;
      onFormReady();
    })();
  });
});
