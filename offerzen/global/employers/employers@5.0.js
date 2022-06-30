window.$loaded(function () {
  window.$parsleyLoaded = function (cb) {
    setTimeout(() => {
      if (window.Parsley && window.ParsleyValidator) {
        cb(window, document, parsley, undefined)
        return
      }
      $parsleyLoaded(cb)
    }, 50)
  }

  window.$parsleyLoaded(function (window, document, parsley) {
    function getRoleTypes(formProperties) {
      let fields = [
        'role_type[In-office]',
        'role_type[Fully-remote]',
        'role_type[Hybrid]',
      ]
      let roleTypes = []

      for (let key in formProperties) {
        if (fields.includes(key) && formProperties[key] === 'on') {
          if (key === 'role_type[Fully-remote]') {
            roleTypes.push(
              key.replace('role_type[', '')
                .replace(']', '')
                .replace('-', ' ')
            )
          } else {
            roleTypes.push(key.replace('role_type[', '').replace(']', ''))
          }
          delete formProperties[key]
        }
      }

      return roleTypes;
    }

    function trackSubmission() {
      var event = $(".js-analytics-event").text();
      var action = $(".js-analytics-action").text();
      var label = $(".js-analytics-label").text();
      var category = $(".js-analytics-category").text();
      var source = $(".js-analytics-source").text();

      dataLayer.push({
        event: event || 'Company Lead Form Submitted',
        action: action || 'Lead Form Submitted',
        label: label || 'Company Sign Up / Employer Landing Page',
        category: category || 'Core',
        source: source || 'Demand Sign Up',
      })
    }

    function onSubmitCompanyLeadForm(token, e) {
      const form = $('#wf-Company-Lead-Form')
      form.find('input[type=submit]').attr('disabled', true)
      let initialButtonValue = form.find('input[type=submit]').attr('value')
      let dataWait = form.find('input[type=submit]').attr('data-wait')
      form.find('input[type=submit]').attr('value', dataWait)
      // get the value of the report_source query parameter should it be present and forward it onto form lead submission for analytics
      let searchParams = new URLSearchParams(window.location.search)
      // Set skills_hiring_for
      let hiringSkills = []
      $('.text-span-skills').each(function () {
        hiringSkills.push($(this).text())
      })
      const uniqueSkills = new Set(hiringSkills)
      const formData = new FormData(form[0])
      const formProperties = Object.fromEntries(formData.entries())
      const roleTypes = getRoleTypes(formProperties)

      if (form.parsley().validate()) {
        $('.js-missing-fields').hide()
        trackSubmission();
        $.ajax({
          type: 'POST',
          url: '/company/form_leads',
          data: JSON.stringify(
            Object.assign({}, formProperties, {
              workplace_policy: roleTypes.join(','),
              skills_hiring_for: Array.from(uniqueSkills).join(', '),
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
              window.location.href = data.redirect_url
            }
          },
          // Reset form
          error: function (data) {
            form.find('input[type=submit]').attr('disabled', false)
            form.find('input[type=submit]').attr('value', initialButtonValue)
          },
        })
      } else {
        $('.js-missing-fields').show()
        form.find('input[type=submit]').attr('disabled', false)
        form.find('input[type=submit]').attr('value', initialButtonValue)
      }

    }

    function updateSubscribeToHiringInsightsField() {
      subscribeToCompanyNewsletter = $('#subscribe_to_company_newsletter')
      subscribeToCompanyNewsletter.on('change', function () {
        document.getElementById('subscribe_to_hiring_insights').value = this.value
      })
    }

    function addPhoneValidation() {
      //Intl-tel-input
      let input = document.querySelector('#phone-number'),
        dialCode = document.querySelector('#dial_code'),
        contact_phone = document.querySelector('#contact_phone')

      let canValidate = false;

      const iti = intlTelInput(input, {
        initialCountry: 'za',
        placeholderNumberType: 'FIXED_LINE',
        autoPlaceholder: 'polite',
        preferredCountries: ['za', 'nl', 'de'],
        autoHideDialCode: false,
        separateDialCode: true,
        dropdownContainer: document.getElementById('js-phone-dropdown'),
      })

      const updateContactPhoneValue = function (event) {
        dialCode.value = '+' + iti.getSelectedCountryData().dialCode;
        const dialCodeValue = dialCode.value;

        const matchDialCode = new RegExp(`^(\\${dialCodeValue}|0)`); // only search start of string for matching code
        const justDigits = input.value.replace(/[^\d\+]/g, '');
        const withoutDialCode = justDigits.replace(matchDialCode, '');

        contact_phone.value = dialCode.value + withoutDialCode;
      }

      const forceValidate = function () {
        if (!canValidate) return;

        $(input).parsley().validate();
      }

      function setAllowValidation() {
        canValidate = true;
      }

      input.addEventListener('input', updateContactPhoneValue, false)
      input.addEventListener('countrychange', updateContactPhoneValue, false)
      input.addEventListener("countrychange", forceValidate, false);
      input.addEventListener("input", forceValidate, false);
      window.Parsley.on('field:error', setAllowValidation);


      window.parsley.addValidator('phonenumber', function (value) {
        const dialCodeValue = '+' + iti.getSelectedCountryData().dialCode

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

        return !!match
      })
    }

    function showFullListofTechRoles() {
      showMoreLink = $('.js-show-more')
      faidingList = $('.fading-list')
      fullList = $('.full-list')

      showMoreLink.one('click', function (e) {
        e.preventDefault()
        e.stopImmediatePropagation()
        faidingList.hide()
        fullList.show()
        showMoreLink.hide()
      })
    }

    // ------------------------------------------------------------
    // Skills fields
    // ------------------------------------------------------------

    function initSkillsField() {
      function removeSkillItem(e) {
        $(e.currentTarget).parent().parent().remove()
      }

      function addSkillToSelected(skill, e) {
        $('.js-skills-selected').show()

        let listItem = $(document.createElement('li')).addClass('list-item-skills')
        listItem.data('id', skill.id)
        let itemContainer = $(document.createElement('div')).addClass(
          'list-item-container'
        )
        let textSpan = $(document.createElement('span')).text(skill.text)
        textSpan.addClass('text-span-skills')
        let innerContainer = $(document.createElement('div')).addClass(
          'list-item-inner-container'
        )
        innerContainer.on('click', removeSkillItem)
        let closeSpan = $(document.createElement('span')).addClass('close-span')
        let svg = $(
          "<svg class='close-button-svg' fill='#5EA5EE' width='1024' height='1024' viewBox='0 0 1024 1024' preserveAspectRatio='xMidYMid meet'><path d='M776.851 695.153c16.64 16.619 16.64 43.733 0 60.373-8.32 8.32-19.179 12.587-30.080 12.587-10.88 0-21.952-4.267-30.293-12.587l-193.707-193.707-193.92 193.707c-8.32 8.32-19.179 12.587-30.080 12.587-10.88 0-21.952-4.267-30.293-12.587-16.64-16.64-16.64-43.755 0-60.373l193.941-193.707-193.941-193.92c-16.64-16.64-16.64-43.733 0-60.373s43.733-16.64 60.373 0l193.92 193.92 193.707-193.92c16.64-16.64 43.733-16.64 60.373 0s16.64 43.733 0 60.373l-193.707 193.92 193.707 193.707z'></path></svg>"
        )

        closeSpan.append(svg)
        innerContainer.append(closeSpan)
        itemContainer.append(textSpan)
        itemContainer.append(innerContainer)
        listItem.append(itemContainer)
        $('.js-skills-selected').append(listItem)
      }

      function addSkillsToResults(skills) {
        var skillsResultsUl = $(document.createElement('ul')).addClass(
          'js-skills-results'
        )
        let skillsItem
        for (var i = 0; i < skills.length; i++) {
          skillsItem = $(document.createElement('li')).text(skills[i].text)
          skillsItem.addClass('js-skills-item-result')
          if (i === 0) {
            skillsItem.addClass('js-skills-item-hover')
          } else {
            skillsItem.removeClass('js-skills-item-hover')
          }
          const skill = skills[i]

          $(skillsItem).on('mouseover', function (e) {
            $('.js-skills-item-result').removeClass('js-skills-item-hover')
            $(this).addClass('js-skills-item-hover')
          })

          $(skillsItem).on('mouseout', function (e) {
            $(this).removeClass('js-skills-item-hover')
          })

          skillsItem.on('click', function (e) {
            addSkillToSelected(skill, e)
            $('.js-skills-results').remove()
            $('.js-skills-search').val('')
          })
          skillsResultsUl.append(skillsItem)
        }

        skillsItem = $(document.createElement('li')).text(
          "Add '" + $('.js-skills-search').val() + "'"
        )

        skillsItem.addClass('js-skills-item-result')

        $(skillsItem).on('mouseover', function (e) {
          $('.js-skills-item-result').removeClass('js-skills-item-hover')
          $(this).addClass('js-skills-item-hover')
        })

        $(skillsItem).on('mouseout', function (e) {
          $(this).removeClass('js-skills-item-hover')
        })

        skillsItem.on('click', function (e) {
          addSkillToSelected(
            {
              id: -1,
              text: $('.js-skills-search').val(),
            },
            e
          )
          $('.js-skills-results').remove()
          $('.js-skills-search').val('')
        })
        skillsResultsUl.append(skillsItem)

        $('.skills-top-container').prepend(skillsResultsUl)
      }

      var submitWithEnter = false
      $('#wf-Company-Lead-Form').on('keyup', function (e) {
        if (e.keyCode === 13) {
          submitWithEnter = true
        } else {
          submitWithEnter = false
        }
      })

      $('#wf-Company-Lead-Form').on('submit', function (e) {
        e.preventDefault()
        $('.js-skills-results').remove()
        setTimeout(function () {
          if (!submitWithEnter) {
            grecaptcha.ready(function () {
              grecaptcha
                .execute('6Lf802weAAAAAHgxndx9NIZ3FTzdG3f7nBua2rRY', {
                  action: 'webflow',
                })
                .then(function (token) {
                  onSubmitCompanyLeadForm(token, e)
                })
            })
          } else {
            submitWithEnter = false
          }
        }, 100)
      })

      $('.js-skills-search').focusout(function () {
        setTimeout(function () {
          $('.js-skills-results').remove()
        }, 1)
      })

      let skillList = []
      $('.js-skills-search').attr('autocomplete', 'off')
      $('.js-skills-search').on('keyup', function (e) {
        let input = $(e.currentTarget)
        let inputValue = input.val()
        if (e.keyCode == 13 && inputValue.length > 0) {
          if (skillList.length > 0) {
            addSkillToSelected(skillList[0], e)
          } else {
            addSkillToSelected(
              {
                id: -1,
                text: inputValue,
              },
              e
            )
          }
          $('.js-skills-search').val('')
          $('.js-skills-results').remove()
          input.focus()
          skillList = []
        } else {
          $('.js-skills-results').remove()
          $.ajax({
            type: 'GET',
            url: '/search/skills?term=' + inputValue + '',
            contentType: 'application/json',
            success: function (skills) {
              skillList = skills.sort(function (a, b) {
                return a.text.localeCompare(b.text)
              })
              $('.js-skills-results').remove()
              addSkillsToResults(skillList)
            },
            // TODO: error handling
          })
        }
      })
    }

    // ------------------------------------------------------------
    // Setup form
    // ------------------------------------------------------------

    ; (function init() {
      //Check Recaptcha error
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.has('r')) {
        $('.recaptcha-error').show()
      }

      $('#in-office-checkbox, #fully-remote-checkbox, #hybrid-checkbox').on(
        'change',
        function (e) {
          let form = $('#wf-Company-Lead-Form')
          const formData = new FormData(form[0])
          const formProperties = Object.fromEntries(formData.entries())

          formProperties[e.target.name] = e.target.checked ? 'on' : 'off'

          const role_types = getRoleTypes(formProperties)

          form.find('input[name=workplace_policy]').val(role_types.join(','))
        }
      )

      updateSubscribeToHiringInsightsField();
      addPhoneValidation();
      showFullListofTechRoles();
      initSkillsField();

      // TODO: Not sure if this is still needed for other parts of the page? Remove if not
      window.onSubmitCompanyLeadForm = onSubmitCompanyLeadForm;
    })();
  });
})
