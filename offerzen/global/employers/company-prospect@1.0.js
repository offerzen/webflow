(function () {
  // FORM TARGETTING
  const leadFormId = '#Company-Prospect-Form';
  const pageRef = 'onSubmitCompanyProspectForm';
  const formSubmitButtonSelector = 'input[type=submit]';
  const formContainerClass = '.js-company-prospect-form';
  let timeout_interval = 1000;
  // END FORM TARGETING

  // This needs to run regardless of whether JQuery has loaded
  // Disable button
  const button = document.querySelector(
    `${leadFormId} ${formSubmitButtonSelector}`
  );
  button.setAttribute('disabled', 'disabled');
  const label = button.value;
  button.value = 'Loading...';

  function enableSubmitButton() {
    button.value = label;
    button.removeAttribute('disabled');
  }

  // ------------------------------------------------------------------------------------------
  window.$loaded(function () {
    window.hasLoadedSelect2 = window.hasLoadedSelect2 ?? false;

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
      const form = $(leadFormId);
      const formContainer = $(formContainerClass)

      const formSubmitButton = form.find(formSubmitButtonSelector);

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
          });
        }
      }

      function onSubmitForm(token, e) {
        formSubmitButton.attr('disabled', true);
        window.pageVariantMeasureEnd = btoa(new Date().getTime() / 1000);
        let initialButtonValue = formSubmitButton.attr('value');
        let dataWait = formSubmitButton.attr('data-wait');
        formSubmitButton.attr('value', dataWait);
        // get the value of the report_source query parameter should it be present and forward it onto form lead submission for analytics
        let searchParams = new URLSearchParams(window.location.search);
        const formData = new FormData(form[0]);
        const formProperties = Object.fromEntries(formData.entries());

        form.find('.recaptcha-error').hide();
        form.find('.js-submit-error').hide();

        if (form.parsley().validate()) {
          form.find('.js-missing-fields').hide();

          const prospectProperties = Object.assign({}, formProperties, {
            referrer: location.href,
            report_source: searchParams.get('report_source'),
            'g-recaptcha-response-data': {
              webflow: token,
            },
            page_variant_meta: `${window.pageVariantMeasureStart}-optimize-meta-${pageVariantMeasureEnd}`,
          });

          $.ajax({
            type: 'POST',
            url: '/api/company/prospects',
            data: JSON.stringify({ company_prospect: prospectProperties }),
            contentType: 'application/json',
            headers: {
              Accept: 'application/json',
            },
            success: function (data) {
                setTimeout(() => {
                  if (data.id) {
                    $.ajax({
                      type: 'GET',
                      url: `/api/company/prospects/${data.id}`,
                      contentType: 'application/json',
                      headers: {
                        Accept: 'application/json',
                      },
                      success: function (data) {
                        switch (data.status) {
                          case 401:
                            formSubmitButton.attr('disabled', false);
                            formSubmitButton.attr('value', initialButtonValue);
                            const errorText = formContainer.find('.js-form-error')
                            if (data.error == 'invalid_address') {
                              errorText.text('Oops! We couldn’t validate your email. Please check that you are using your work email, then try again.')
                              errorText.show();
                            } else {
                              errorText.text('This looks like a personal email address. Please use your work email address.')
                              errorText.show();
                            }
                            break;
                          case 200:
                            //localStorage.setItem('prospect_id', .prospectId);
                            trackSubmission();
                            window.location.pathname = '/hire-developers/get-started';
                            break;
                          case 304:
                          default:
                            setPolling({
                              ...polling,
                              timeEllapsed: polling.timeEllapsed + pollingIntervalTime,
                            });
                        }
                      },
                    });
                    
                    return
                  }
                }, timeout_interval)
                
              }
            },
            // Reset form
            error: function (data) {
              formSubmitButton.attr('disabled', false);
              formSubmitButton.attr('value', initialButtonValue);

              if (data.recaptcha_verify) {
                form.find('.recaptcha-error').show();
              } else {
                form.find('.js-submit-error').show();
              }
            },
          });
        } else {
          form.find('.js-missing-fields').show();
          formSubmitButton.attr('disabled', false);
          formSubmitButton.attr('value', initialButtonValue);
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
