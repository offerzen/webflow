(function () {
  // FORM TARGETTING
  const prospectFormId = '#Company-Prospect-Form';
  const pageRef = 'onSubmitCompanyProspectForm';
  const formSubmitButtonSelector = '#submit-button';
  const formContainerClass = '.js-company-prospect-form';
  // END FORM TARGETING
  // This needs to run regardless of whether JQuery has loaded
  // Disable button
  const formSubmitButton = document.querySelector(
    `${prospectFormId} ${formSubmitButtonSelector}`
  );

  // Store button labels for state changes
  let initialButtonValue = formSubmitButton.value;
  let dataWait = formSubmitButton.getAttribute('data-wait');
  let dataBusy = formSubmitButton.getAttribute('data-busy');

  function disableSubmitButton(buttonLabel) {
    formSubmitButton.setAttribute('disabled', 'disabled');
    formSubmitButton.value = buttonLabel;
  }

  function enableSubmitButton() {
    formSubmitButton.removeAttribute('disabled');
    formSubmitButton.value = initialButtonValue;
  }

  disableSubmitButton('Loading...');
  // ------------------------------------------------------------------------------------------
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
      const form = $(prospectFormId);
      const formContainer = $(formContainerClass);
      const option = form.find('.js-access-option').text();
      const errorText = formContainer.find('.js-form-error');

      function trackSubmission() {
        var emailValue = form.find('#email').val();
        var isPlaywrightTest =
          emailValue.match(/^\s*playwrighttest@offerzen\.com\s*$/i) != null;
        if (!isPlaywrightTest) {
          var event = form.find('.js-analytics-event').text();
          var action = form.find('.js-analytics-action').text();
          var label = form.find('.js-analytics-label').text();
          var category = form.find('.js-analytics-category').text();
          var source = form.find('.js-analytics-source').text();
          dataLayer.push({
            event: event || 'Company Lead Form Submitted',
            action: action || 'Lead Form Submitted',
            label: label || 'Company Sign Up / Employer Landing Page',
            category: category || 'Core',
            source: source || 'Demand Sign Up',
            email: emailValue
          });
        }
      }

      function startProspectPolling(prospectId, buttonLabelTimer) {
        function poll() {
          $.ajax({
            type: 'GET',
            url: `/farsight/api/v1/company/prospects/${prospectId}`,
            contentType: 'application/json',
            headers: {
              Accept: 'application/json',
            },
            statusCode: {
              304: function () {
                setTimeout(poll, 1000);
              },
              200: function (data) {
                clearTimeout(buttonLabelTimer);
                trackSubmission();
                if (option === 'call_booked') {
                  window.location.href = `https://meetings.hubspot.com/nickreid/chat-with-sales`;
                } else {
                  window.location.href = `/hire/get-access?prospect_id=${prospectId}`;
                }
              },
              401: function (data) {
                const responseData = data.responseJSON;
                enableSubmitButton();
                if (responseData.error == 'invalid_address') {
                  errorText.text(
                    "Oops! We couldn't validate your email. Please check that you are using your work email, then try again."
                  );
                  errorText.show();
                } else {
                  errorText.text(
                    'This looks like a personal email address. Please use your work email address.'
                  );
                  errorText.show();
                }
                clearTimeout(buttonLabelTimer);
              },
              404: function () {
                enableSubmitButton();
                errorText.text(
                  'Oops! Something went wrong while submitting the form.'
                );
                errorText.show();
                clearTimeout(buttonLabelTimer);
              },
              // 400 is returned if user company exists on OfferZen and is new user
              400: function () {
                enableSubmitButton();
                errorText.text(
                  "It seems like your company already exists on OfferZen. We've sent you an email with next steps to help you get set up."
                );
                errorText.show();
                clearTimeout(buttonLabelTimer);
              },
              422: function () {
                enableSubmitButton();
                errorText.text(
                  'Check your email. Looks like there’s been an error.'
                );
                errorText.show();
                clearTimeout(buttonLabelTimer);
              },
            },
          });
        }

        setTimeout(poll, 1000);
      }

      function onSubmitForm(token, e) {
        disableSubmitButton(dataWait);
        window.pageVariantMeasureEnd = btoa(new Date().getTime() / 1000);

        // get the value of the report_source and pricing_option query parameter should it be present and forward it onto form lead submission for analytics
        let searchParams = new URLSearchParams(window.location.search);
        const formData = new FormData(form[0]);
        const formProperties = Object.fromEntries(formData.entries());
        form.find('.recaptcha-error').hide();
        formContainer.find('.js-form-error').hide();
        if (form.parsley().validate()) {
          // Setting submit button label
          let buttonLabelTimer = setTimeout(function () {
            disableSubmitButton(dataBusy);
          }, 5000);

          // Hide errors
          form.find('.js-missing-fields').hide();
          const prospectProperties = Object.assign({}, formProperties, {
            referrer: location.href,
            report_source: searchParams.get('report_source'),
            page_variant_meta: `${window.pageVariantMeasureStart}-optimize-meta-${pageVariantMeasureEnd}`,
            access_option: `${option}`,
            selected_pricing_option: searchParams.get('pricing_option')
          });
          $.ajax({
            type: 'POST',
            url: '/farsight/api/v1/company/prospects/',
            data: JSON.stringify({
              company_prospect: prospectProperties,
              'g-recaptcha-response-data': {
                webflow: token,
              },
            }),
            contentType: 'application/json',
            headers: {
              Accept: 'application/json',
            },
            success: function (data) {
              if (data.id) {
                startProspectPolling(data.id, buttonLabelTimer);
              }
            },
            // Reset form
            error: function (data) {
              enableSubmitButton();
              clearTimeout(buttonLabelTimer);

              if (data.recaptcha_verify) {
                form.find('.recaptcha-error').show();
              } else {
                errorText.show();
              }
            },
          });
        } else {
          form.find('.js-missing-fields').show();
          enableSubmitButton();
        }
      }

      function updateSubscribeToHiringInsightsField() {
        subscribeToCompanyNewsletter = form.find(
          '#subscribe_to_company_newsletter'
        );
        subscribeToCompanyNewsletter.on('change', function () {
          form.find('#subscribe_to_hiring_insights').val(this.value);
        });
      }

      function matchCheckboxStates() {
        form.find('.w-checkbox').each(function () {
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
        // Check Recaptcha error
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('r')) {
          form.find('.recaptcha-error').show();
        }
        function onFormReady() {
          form.on('submit', function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            grecaptcha.ready(function () {
              grecaptcha
                .execute('6Lf802weAAAAAHgxndx9NIZ3FTzdG3f7nBua2rRY', {
                  action: 'webflow',
                })
                .then(function (token) {
                  onSubmitForm(token, e);
                });
            });
          });
          enableSubmitButton();
        }
        updateSubscribeToHiringInsightsField();
        matchCheckboxStates();
        // Still needed for other parts of the page
        window[pageRef] = onSubmitForm;
        onFormReady();
      })();
    });
  });
})();
