window.$loaded(function (window, document, $, undefined) {
  ;(function () {
    window.$parsleyLoaded = function (cb) {
      setTimeout(() => {
        if (window.Parsley && window.ParsleyValidator) {
          cb(window, document, parsley, undefined)
          return
        }
        $parsleyLoaded(cb)
      }, 50)
    }
  })()

  function getRoleTypes(formData, formProperties) {
    let fields = [
      'role_type[In-office]',
      'role_type[Fully-remote]',
      'role_type[Hybrid]',
    ]
    let role_types = []

    for (let key in formProperties) {
      if (fields.includes(key) && formProperties[key] === 'on') {
        if (key === 'role_type[Fully-remote]') {
          role_types.push(
            key.replace('role_type[', '').replace(']', '').replace('-', ' ')
          )
        } else {
          role_types.push(key.replace('role_type[', '').replace(']', ''))
        }
        delete formProperties[key]
      }
    }

    return role_types
  }

  function tracking() {
    dataLayer.push({
      event: 'Company Lead Form Submitted ',
      action: 'Lead Form Submitted',
      label: 'Company Sign Up / Employer Landing Page',
      category: 'Core',
      source: 'Demand Sign Up',
    })
  }

  window.onSubmitCompanyLeadForm = function (token, e) {
    window.$parsleyLoaded(function (window, document, parsley) {
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
      const uniqSkills = new Set(hiringSkills)
      const formData = new FormData(form[0])
      const formProperties = Object.fromEntries(formData.entries())
      const role_types = getRoleTypes(formData, formProperties)

      /*if (role_types.length < 1) {
          $('.role-type-error-container').html(
            '<ul class="parsley-errors-list filled js-missing-fields"><li class="parsley-required">This field is required</li></ul>'
          )
        } else {
          $('.role-type-error-container').html('')
        }*/
      if (form.parsley().validate() /* && role_types.length > 0 */) {
        $('.js-missing-fields').hide()
        tracking()
        $.ajax({
          type: 'POST',
          url: '/company/form_leads',
          data: JSON.stringify(
            Object.assign({}, formProperties, {
              workplace_policy: role_types.join(','),
              skills_hiring_for: Array.from(uniqSkills).join(', '),
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
        })
      } else {
        $('.js-missing-fields').show()
        form.find('input[type=submit]').attr('disabled', false)
        form.find('input[type=submit]').attr('value', initialButtonValue)
      }
    })
  }
  ;(function updateSubscribeToHiringInsightsField() {
    subscribeToCompanyNewsletter = $('#subscribe_to_company_newsletter')
    subscribeToCompanyNewsletter.on('change', function () {
      document.getElementById('subscribe_to_hiring_insights').value = this.value
    })
  })()

  //Intl-tel-input
  let input = document.querySelector('#phone-number'),
    dialCode = document.querySelector('#dial_code'),
    contact_phone = document.querySelector('#contact_phone')

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

  input.addEventListener('input', updateContactPhoneValue, false)
  input.addEventListener('countrychange', updateContactPhoneValue, false)

  window.$parsleyLoaded(function (window, document, parsley) {
    window.parsley.addValidator('phonenumber', function (value) {
      const dialCodeValue = '+' + iti.getSelectedCountryData().dialCode

      const cleanValue = value.replace(/[ ()\-]/g, ''); // ensure we only remove expected extras so other characters are shown as errors

      // Match will be slightly lenient due to multiple countries having different length formats
      // country code with 7-11 digits e.g. +27 21 123 1234
      // leading zero with 7-11 digits e.g. 0 21 123 1234
      // no leading zero with 7-11 digits e.g. 21 123 1234
      const dialCodeMatch = new RegExp(`^(\\${dialCodeValue}|0)?[0-9]{7,11}$`);
      let match = cleanValue.match(dialCodeMatch);

      return !!match
    })
  })

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

      const role_types = getRoleTypes(formData, formProperties)

      form.find('input[name=workplace_policy]').val(role_types.join(','))

      /*if (role_types.length < 1) {
          $('.role-type-error-container').html(
            '<ul class="parsley-errors-list filled js-missing-fields"><li class="parsley-required">This field is required</li></ul>'
          )
        } else {
          $('.role-type-error-container').html('')
        }*/
    }
  )

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

  showFullListofTechRoles()
})

// Skills fields
window.$loaded(function (window, document, $, undefined) {
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
              window.onSubmitCompanyLeadForm(token, e)
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
    }, 200)
  })

  let skillList = []
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
          skillList = skills
          $('.js-skills-results').remove()
          addSkillsToResults(skills)
        },
      })
    }
  })
})
