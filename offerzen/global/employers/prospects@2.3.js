(function () {
  // FORM TARGETTING
  const leadFormId = '#wf-Company-Prospect-Form';
  const pageRef = 'onSubmitMultiStepProspectForm';
  const formSubmitButtonSelector = 'input[type=submit]';
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
      const form = $(leadFormId);
      const formSubmitButton = form.find(formSubmitButtonSelector);
      function loadFormStep() {
        //emailValueC represents variant C lead journey
        if (!('emailValueC' in localStorage)) {
          //emailValueB represents variant B lead journey
          if ('emailValueB' in localStorage) {
            // Showing correct step
            $('#form-2').show();
            $('#form-1').hide();

            // Setting email value
            $('#form-2 #contact_email').val(
              localStorage.getItem('emailValueB')
            );
          } else {
            $('#form-1').show();
            $('#form-2').hide();
          }
        }
      }

      function storeEmailValuePreLead() {
        // Store email
        let emailValue = $('#form-1 #contact_email').val();
        localStorage.setItem('emailValueB', emailValue);
      }

      function onSubmitForm(token, e) {
        window.pageVariantMeasureEnd = btoa(new Date().getTime() / 1000);
        formSubmitButton.attr('disabled', true);
        let initialButtonValue = formSubmitButton.attr('value');
        let dataWait = formSubmitButton.attr('data-wait');
        formSubmitButton.attr('value', dataWait);

        // get the value of the report_source query parameter should it be present and forward it onto form lead submission for analytics
        let searchParams = new URLSearchParams(window.location.search);
        const formData = new FormData(form[0]);
        const formProperties = Object.fromEntries(formData.entries());
        if (form.parsley().validate()) {
          form.find('.js-missing-fields').hide();
          $.ajax({
            type: 'POST',
            url: '/company/form_prospects',
            data: JSON.stringify(
              Object.assign({}, formProperties, {
                referrer: location.href,
                lead_form_type: form.find('.js-analytics-label').text(),
                report_source: searchParams.get('report_source'),
                'g-recaptcha-response-data': {
                  webflow: token,
                },
                page_variant_meta: `${window.pageVariantMeasureStart}-optimize-meta-${pageVariantMeasureEnd}`,
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

                // Store email
                storeEmailValuePreLead();

                // Set email on next step
                if ('emailValueB' in localStorage) {
                  $('#form-2 #contact_email').val(
                    localStorage.getItem('emailValueB')
                  );
                }
              }
            },
            // Reset form
            error: function (data) {
              formSubmitButton.attr('disabled', false);
              formSubmitButton.attr('value', initialButtonValue);
            },
          });
        } else {
          form.find('.js-missing-fields').show();
          formSubmitButton.attr('disabled', false);
          formSubmitButton.attr('value', initialButtonValue);
        }
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
        //Check Recaptcha error
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('r')) {
          $('.recaptcha-error').show();
        }

        function onFormReady() {
          formSubmitButton.on('click', function (e) {
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

        loadFormStep();
        matchCheckboxStates();
        // Still needed for other parts of the page
        window[pageRef] = onSubmitForm;
        onFormReady();
      })();
    });
  });
})();
