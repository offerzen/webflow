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
    function loadFormStep() {
      if ('emailValue' in localStorage) {
        // Showing correct step
        $('#form-2').show();
        $('#form-1').hide();

        // Setting email value
        $('#form-2 #contact_email').val(localStorage.getItem('emailValue'));

        // Set value of accepted terms
        $('.second-form-terms-of-service').val(
          localStorage.getItem('acceptedTerms')
        );
      } else {
        $('#form-1').show();
        $('#form-2').hide();
      }
    }

    function storeEmailAndTermsOfServiceValues() {
      // Store email
      let emailValue = $('#form-1 #contact_email').val();
      localStorage.setItem('emailValue', emailValue);

      // Store terms of service
      if ($('#accepted_terms_of_service').is(':checked')) {
        localStorage.setItem('acceptedTerms', 'on');
      } else {
        localStorage.setItem('acceptedTerms', 'off');
      }
    }

    function onSubmitCompanyLeadForm(token, e) {
      const form = $('#wf-Company-Prospect-Form');
      form.find('input[type=submit]').attr('disabled', true);
      let initialButtonValue = form.find('input[type=submit]').attr('value');
      let dataWait = form.find('input[type=submit]').attr('data-wait');
      form.find('input[type=submit]').attr('value', dataWait);

      // get the value of the report_source query parameter should it be present and forward it onto form lead submission for analytics
      let searchParams = new URLSearchParams(window.location.search);
      const formData = new FormData(form[0]);
      const formProperties = Object.fromEntries(formData.entries());
      if (form.parsley().validate()) {
        $('.js-missing-fields').hide();
        $.ajax({
          type: 'POST',
          url: '/company/form_prospects',
          data: JSON.stringify(
            Object.assign({}, formProperties, {
              referrer: location.href,
              lead_form_type: $('.js-label-analytics').text(),
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
              // Show & Hide steps
              $('#form-2').show();
              $('#form-1').hide();

              // Store email and accepted T&Cs
              storeEmailAndTermsOfServiceValues();

              // Set email on next step
              if ('emailValue' in localStorage) {
                $('#form-2 #contact_email').val(
                  localStorage.getItem('emailValue')
                );
              }

              if (localStorage.getItem('acceptedTerms') === 'on') {
                $('.second-form-terms-of-service').val(
                  localStorage.getItem('acceptedTerms')
                );
              }
            }
          },
          // Reset form
          error: function (data) {
            form.find('input[type=submit]').attr('disabled', false);
            form.find('input[type=submit]').attr('value', initialButtonValue);
          },
        });
      } else {
        $('.js-missing-fields').show();
        form.find('input[type=submit]').attr('disabled', false);
        form.find('input[type=submit]').attr('value', initialButtonValue);
      }
    }

    function matchCheckboxStates() {
      $('.w-checkbox').each(function () {
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
        const submitButton = $('#continue-button');
        submitButton.attr('disabled', false);
        submitButton.on('click', function (e) {
          e.preventDefault();
          grecaptcha.ready(function () {
            grecaptcha
              .execute('6Lf802weAAAAAHgxndx9NIZ3FTzdG3f7nBua2rRY', {
                action: 'webflow',
              })
              .then(function (token) {
                onSubmitCompanyLeadForm(token, e);
              });
          });
        });
        companyLeadFormLoaded();
      }

      loadFormStep();
      matchCheckboxStates();
      // Still needed for other parts of the page
      window.onSubmitCompanyLeadForm = onSubmitCompanyLeadForm;
      isFormReady = true;
      onFormReady();
    })();
  });
});
