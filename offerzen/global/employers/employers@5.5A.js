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
    const originalLeadForm = $('#Original-Company-Lead-Form');

    function getRoleTypes(formProperties) {
      let fields = [
        'role_type[In-office]',
        'role_type[Fully-remote]',
        'role_type[Hybrid]',
      ];
      let roleTypes = [];
      originalLeadForm.find('.js-val-msg-roles').hide();

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
        originalLeadForm.find('.js-val-msg-roles').show();
      }

      return roleTypes;
    }

    function trackSubmission() {
      var event = originalLeadForm.find('.js-analytics-event').text();
      var action = originalLeadForm.find('.js-analytics-action').text();
      var label = originalLeadForm.find('.js-analytics-label').text();
      var category = originalLeadForm.find('.js-analytics-category').text();
      var source = originalLeadForm.find('.js-analytics-source').text();

      dataLayer.push({
        event: event || 'Company Lead Form Submitted',
        action: action || 'Lead Form Submitted',
        label: label || 'Company Sign Up / Employer Landing Page',
        category: category || 'Core',
        source: source || 'Demand Sign Up',
      });
    }

    function onSubmitOriginalCompanyLeadForm(token, e) {
      originalLeadForm.find('input[type=submit]').attr('disabled', true);
      let initialButtonValue = originalLeadForm
        .find('input[type=submit]')
        .attr('value');
      let dataWait = originalLeadForm
        .find('input[type=submit]')
        .attr('data-wait');
      originalLeadForm.find('input[type=submit]').attr('value', dataWait);
      // get the value of the report_source query parameter should it be present and forward it onto form lead submission for analytics
      let searchParams = new URLSearchParams(window.location.search);
      const formData = new FormData(originalLeadForm[0]);
      const formProperties = Object.fromEntries(formData.entries());
      const roleTypes = getRoleTypes(formProperties);

      if (originalLeadForm.parsley().validate()) {
        originalLeadForm.find('.js-missing-fields').hide();
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
            })
          ),
          contentType: 'application/json',
          headers: {
            Accept: 'application/json',
          },
          success: function (data) {
            if (data.user_id) {
              window.location.href = data.redirect_url;
            }
          },
          // Reset form
          error: function (data) {
            originalLeadForm.find('input[type=submit]').attr('disabled', false);
            originalLeadForm
              .find('input[type=submit]')
              .attr('value', initialButtonValue);
          },
        });
      } else {
        $('.js-missing-fields').show();
        originalLeadForm.find('input[type=submit]').attr('disabled', false);
        originalLeadForm
          .find('input[type=submit]')
          .attr('value', initialButtonValue);
      }
    }

    function updateSubscribeToHiringInsightsField() {
      subscribeToCompanyNewsletter = originalLeadForm.find(
        '#subscribe_to_company_newsletter'
      );
      subscribeToCompanyNewsletter.on('change', function () {
        originalLeadForm.find('#subscribe_to_hiring_insights').val(this.value);
      });
    }

    function addPhoneValidation(onPhoneFieldReady) {
      //Intl-tel-input
      let input = originalLeadForm.find('#phone-number')[0],
        dialCode = originalLeadForm.find('#dial_code')[0],
        contact_phone = originalLeadForm.find('#contact_phone')[0];

      let canValidate = false;

      const iti = intlTelInput(input, {
        initialCountry: 'za',
        placeholderNumberType: 'FIXED_LINE',
        autoPlaceholder: 'polite',
        preferredCountries: ['za', 'nl', 'de'],
        autoHideDialCode: false,
        separateDialCode: true,
        dropdownContainer: originalLeadForm.find('#js-phone-dropdown')[0],
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

      window.parsley.addValidator('phonenumber', function (value) {
        const dialCodeValue = '+' + iti.getSelectedCountryData().dialCode;

        const cleanValue = value.replace(/[ ()\-]/g, ''); // ensure we only remove expected extras so other characters are shown as errors

        // simplify the lower regex by removing leading dial code or zero
        // nsn are the digits after international dial code
        const matchDialCode = new RegExp(`^(\\${dialCodeValue}|0)`);
        const nsnValue = cleanValue.replace(matchDialCode, '');

        let match = null;

        // FORMATS (+<country code> <NSN length>) to consider based on expansion plans March 2022:
        // South Africa:           +27 <9>       https://en.wikipedia.org/wiki/Telephone_numbers_in_South_Africa
        // Netherlands:            +31 <9>       https://en.wikipedia.org/wiki/Telephone_numbers_in_the_Netherlands
        // Germany:                +49 <7-11>    https://en.wikipedia.org/wiki/Telephone_numbers_in_Germany
        // Portugal:               +351 <9>      https://en.wikipedia.org/wiki/Telephone_numbers_in_Portugal
        // Spain:                  +34 <8-9>     https://en.wikipedia.org/wiki/Telephone_numbers_in_Spain
        // Italy:                  +39 <8-10>    https://en.wikipedia.org/wiki/Telephone_numbers_in_Italy
        // Ireland:                +353 <7-9>    https://en.wikipedia.org/wiki/Telephone_numbers_in_the_Republic_of_Ireland
        // Northern Ireland / UK:  +44 <7,9,10>  https://en.wikipedia.org/wiki/Telephone_numbers_in_the_United_Kingdom

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

    // This is not part of the form
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
        originalLeadForm.find('.recaptcha-error').show();
      }

      $('#in-office-checkbox, #fully-remote-checkbox, #hybrid-checkbox').on(
        'change',
        function (e) {
          const formData = new FormData(form[0]);
          const formProperties = Object.fromEntries(formData.entries());

          formProperties[e.target.name] = e.target.checked ? 'on' : 'off';

          const role_types = getRoleTypes(formProperties);

          originalLeadForm
            .find('input[name=workplace_policy]')
            .val(role_types.join(','));
        }
      );

      // Load testing
      let isFormReady = false;
      let isPhoneReady = false;

      function onFormReady() {
        if (!isPhoneReady || !isFormReady) return;

        // Form is ready, but might still be waiting for recaptcha. That has it's own check in submit, so can be ignored
        const submitButton = originalLeadForm.find('input[type=submit]');
        submitButton.attr('disabled', false);

        originalLeadForm.on('submit', function (e) {
          e.preventDefault();
          grecaptcha.ready(function () {
            grecaptcha
              .execute('6Lf802weAAAAAHgxndx9NIZ3FTzdG3f7nBua2rRY', {
                action: 'webflow',
              })
              .then(function (token) {
                onSubmitOriginalCompanyLeadForm(token, e);
              });
          });
        });
        originalCompanyLeadFormLoaded();
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
      window.onSubmitOriginalCompanyLeadForm = onSubmitOriginalCompanyLeadForm;

      isFormReady = true;
      onFormReady();
    })();
  });
});
