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
    const multiStepLeadForm = $('#Multi-Step-Company-Lead-Form');
    const multiStepLeadFormButton = multiStepLeadForm.find('input[type=submit]');

    function getRoleTypes(formProperties) {
      let fields = [
        'role_type[In-office]',
        'role_type[Fully-remote]',
        'role_type[Hybrid]',
      ];
      let roleTypes = [];
      multiStepLeadForm.find('.js-val-msg-roles').hide();

      for (let key in formProperties) {
        if (fields.includes(key) && formProperties[key] === 'on') {
          if (key === 'role_type[Fully-remote]') {
            roleTypes.push(
              key.replace('role_type[', '').replace(']', '').replace('-', ' ')
            );
          } else {
            roleTypes.push(key.replace('role_type[', '').replace(']', ''));
          }
          delete formProperties[key];
        }
      }
      if (roleTypes.length < 1) {
        multiStepLeadForm.find('.js-val-msg-roles').show();
      }

      return roleTypes;
    }

    function trackSubmission() {
      var event = multiStepLeadForm.find('.js-analytics-event').text();
      var action = multiStepLeadForm.find('.js-analytics-action').text();
      var label = multiStepLeadForm.find('.js-analytics-label').text();
      var category = multiStepLeadForm.find('.js-analytics-category').text();
      var source = multiStepLeadForm.find('.js-analytics-source').text();

      dataLayer.push({
        event: event || 'Company Lead Form Submitted',
        action: action || 'Lead Form Submitted',
        label: label || 'Company Sign Up / Employer Landing Page',
        category: category || 'Core',
        source: source || 'Demand Sign Up',
      });
    }

    function onSubmitMultiStepCompanyLeadForm(token, e) {
      multiStepLeadFormButton.attr('disabled', true);
      pageVariantMeasureEnd = btoa((new Date().getTime() / 1000));

      let initialButtonValue = multiStepLeadFormButton.attr('value');
      let dataWait = multiStepLeadFormButton.attr('data-wait');
      multiStepLeadFormButton.attr('value', dataWait);
      // get the value of the report_source query parameter should it be present and forward it onto form lead submission for analytics
      let searchParams = new URLSearchParams(window.location.search);
      const formData = new FormData(multiStepLeadForm[0]);
      const formProperties = Object.fromEntries(formData.entries());
      const roleTypes = getRoleTypes(formProperties);

      if (multiStepLeadForm.parsley().validate()) {
        multiStepLeadForm.find('.js-missing-fields').hide();
        trackSubmission();
        $.ajax({
          type: 'POST',
          url: '/company/form_leads',
          data: JSON.stringify(
            Object.assign({}, formProperties, {
              workplace_policy: roleTypes.join(','),
              referrer: location.href,
              report_source: searchParams.get('report_source'),
              'g-recaptcha-response-data': {
                webflow: token,
              },
              page_variant_meta: `${window.pageVariantMeasureStart}-optimize-meta-${pageVariantMeasureEnd}`
            })
          ),
          contentType: 'application/json',
          headers: {
            Accept: 'application/json',
          },
          success: function (data) {
            if (data.user_id) {
              localStorage.clear();
              window.location.href = data.redirect_url;
            }
          },
          // Reset form
          error: function (data) {
            multiStepLeadFormButton.attr('disabled', false);
            multiStepLeadFormButton.attr('value', initialButtonValue);
          },
        });
      } else {
        multiStepLeadForm.find('.js-missing-fields').show();
        multiStepLeadFormButton.attr('disabled', false);
        multiStepLeadFormButton.attr('value', initialButtonValue);
      }
    }

    function updateSubscribeToHiringInsightsField() {
      subscribeToCompanyNewsletter = multiStepLeadForm.find(
        '#subscribe_to_company_newsletter'
      );
      subscribeToCompanyNewsletter.on('change', function () {
        multiStepLeadForm.find('#subscribe_to_hiring_insights').val(this.value);
      });
    }

    function addPhoneValidation(onPhoneFieldReady) {
      //Intl-tel-input
      let input = multiStepLeadForm.find('.js-phone-number-multi-step')[0],
        dialCode = multiStepLeadForm.find('#dial_code')[0],
        contact_phone = multiStepLeadForm.find('#contact_phone')[0];

      let canValidate = false;

      const iti = intlTelInput(input, {
        initialCountry: 'za',
        placeholderNumberType: 'FIXED_LINE',
        autoPlaceholder: 'polite',
        preferredCountries: ['za', 'nl', 'de'],
        autoHideDialCode: false,
        separateDialCode: true,
        dropdownContainer: multiStepLeadForm.find(
          '#js-phone-dropdown-multi-step-form'
        )[0],
      });
      iti.promise.then(onPhoneFieldReady);

      const updateContactPhoneValue = function (event) {
        dialCode.value = '+' + iti.getSelectedCountryData().dialCode;
        const dialCodeValue = dialCode.value;

        const matchDialCode = new RegExp(`^(\\${dialCodeValue}|0)`); // only search start of string for matching code
        const justDigits = input.value.replace(/[^\d\+]/g, '');
        const withoutDialCode = justDigits.replace(matchDialCode, '');

        contact_phone.value = dialCode.value + withoutDialCode;
      };

      const forceValidate = function () {
        if (!canValidate) return;

        $(input).parsley().validate();
      };

      function setAllowValidation() {
        canValidate = true;
      }

      input.addEventListener('input', updateContactPhoneValue, false);
      input.addEventListener('countrychange', updateContactPhoneValue, false);
      input.addEventListener('countrychange', forceValidate, false);
      input.addEventListener('input', forceValidate, false);
      window.Parsley.on('field:error', setAllowValidation);

      window.parsley.addValidator('phonenumber2', function (value) {
        const dialCodeValue = '+' + iti.getSelectedCountryData().dialCode;

        const cleanValue = value.replace(/[ ()\-]/g, ''); // ensure we only remove expected extras so other characters are shown as errors

        // simplify the lower regex by removing leading dial code or zero
        // nsn are the digits after international dial code
        const matchDialCode = new RegExp(`^(\\${dialCodeValue}|0)`);
        const nsnValue = cleanValue.replace(matchDialCode, '');

        let match = null;

        // FORMATS (+<country code> <NSN length>) to consider based on expansion plans March 2022:

        // Strict for core countries with 9 NSN: South Africa, Netherlands
        if (dialCodeValue.match(/\+(27|31)/)) {
          match = nsnValue.match(/^[0-9]{9}$/);
        }
        // Loose for others, NSN=7..11, with 1 extra in case on either side i.e. 6..12
        else {
          match = nsnValue.match(/^[0-9]{6,12}$/);
        }

        return !!match;
      });
    }

    //This is not part of the form
    function showFullListofTechRoles() {
      showMoreLink = $('.js-show-more');
      faidingList = $('.fading-list');
      fullList = $('.full-list');

      showMoreLink.one('click', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        faidingList.hide();
        fullList.show();
        showMoreLink.hide();
      });
    }

    function matchCheckboxStates() {
      multiStepLeadForm.find('.w-checkbox').each(function () {
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
        multiStepLeadForm.find('.recaptcha-error').show();
      }

      multiStepLeadForm
        .find('#in-office-checkbox, #fully-remote-checkbox, #hybrid-checkbox')
        .on('change', function (e) {
          const formData = new FormData(multiStepLeadForm[0]);
          const formProperties = Object.fromEntries(formData.entries());

          formProperties[e.target.name] = e.target.checked ? 'on' : 'off';

          const role_types = getRoleTypes(formProperties);

          multiStepLeadForm
            .find('input[name=workplace_policy]')
            .val(role_types.join(','));
        });

      // Load testing
      let isFormReady = false;
      let isPhoneReady = false;

      function onFormReady() {
        if (!isPhoneReady || !isFormReady) return;

        // Form is ready, but might still be waiting for recaptcha. That has it's own check in submit, so can be ignored
        multiStepLeadFormButton.attr('disabled', false);

        multiStepLeadForm.on('submit', function (e) {
          e.preventDefault();
          grecaptcha.ready(function () {
            grecaptcha
              .execute('6Lf802weAAAAAHgxndx9NIZ3FTzdG3f7nBua2rRY', {
                action: 'webflow',
              })
              .then(function (token) {
                onSubmitMultiStepCompanyLeadForm(token, e);
              });
          });
        });
        multiStepCompanyLeadFormLoaded();
      }

      function onPhoneFieldReady() {
        isPhoneReady = true;
        onFormReady();
      }

      updateSubscribeToHiringInsightsField();
      addPhoneValidation(onPhoneFieldReady);
      showFullListofTechRoles();
      matchCheckboxStates();

      // Still needed for other parts of the page
      window.onSubmitMultiStepCompanyLeadForm =
        onSubmitMultiStepCompanyLeadForm;

      isFormReady = true;
      onFormReady();
    })();
  });
});
