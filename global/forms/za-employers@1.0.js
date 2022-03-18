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

  window.onSubmitCompanyLeadForm = function (token) {
    window.$parsleyLoaded(function (window, document, parsley) {
      form = $('#wf-Company-Lead-Form')
      form.find('input[type=submit]').attr('disabled', true)
      var initialButtonValue = form.find('input[type=submit]').attr('value')
      var dataWait = form.find('input[type=submit]').attr('data-wait')
      form.find('input[type=submit]').attr('value', dataWait)

      // get the value of the report_source query parameter should it be present and forward it onto form lead submission for analytics
      var searchParams = new URLSearchParams(window.location.search)
      form
        .find('input[name=report_source]')
        .val(searchParams.get('report_source'))

      // Set the referrer value to the current URL so the rails form handler knows where to redirect you
      form.find('input[name=referrer]').val(location.href)

      // Set skills_hiring_for
      var hiringSkills = []
      $('.text-span-skills').each(function () {
        hiringSkills.push($(this).text())
      })
      var uniqSkills = new Set(hiringSkills)
      form
        .find('input[name=skills_hiring_for]')
        .val(Array.from(uniqSkills).join(', '))

      const formData = new FormData(form[0])
      const formProperties = Object.fromEntries(formData.entries())
      const role_types = getRoleTypes(formData, formProperties)

      form.find('input[name=workplace_policy]').val(role_types.join(','))

      /*if (role_types.length < 1) {
          $('.role-type-error-container').html(
            '<ul class="parsley-errors-list filled js-missing-fields"><li class="parsley-required">This field is required</li></ul>'
          )
        } else {
          $('.role-type-error-container').html('')
        }*/

      if (form.parsley().validate() /* && role_types.length > 0 */) {
        $('.js-missing-fields').hide()
        form.submit()
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
  var input = document.querySelector('#phone-number'),
    dialCode = document.querySelector('#dial_code'),
    contact_phone = document.querySelector('#contact_phone')

  var iti = intlTelInput(input, {
    initialCountry: 'za',
    placeholderNumberType: 'FIXED_LINE',
    autoPlaceholder: 'polite',
    preferredCountries: ['za', 'nl', 'de'],
    autoHideDialCode: false,
    separateDialCode: true,
    dropdownContainer: document.getElementById('js-phone-dropdown'),
  })

  var updateContactPhoneValue = function (event) {
    dialCode.value = '+' + iti.getSelectedCountryData().dialCode
    contact_phone.value =
      dialCode.value +
      input.value.replace(/[ \-\(\)]/g, '').replace(/\+([0-9]{2})|([0])/g, '')
  }

  input.addEventListener('input', updateContactPhoneValue, false)
  input.addEventListener('countrychange', updateContactPhoneValue, false)

  window.$parsleyLoaded(function (window, document, parsley) {
    window.parsley.addValidator('phonenumber', function (value) {
      var code = '+' + iti.getSelectedCountryData().dialCode
      var cleanValue = value.replace(code, '0')
      var match = cleanValue
        .replace(/[^0-9]/g, '')
        .match(/^(\+[0-9]{2,3})?([0-9]){9,10}$/)
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
  function clearPreviousResults() {
    var skillsParent = $('.js-skills-results-container')
    var dataBlocks = skillsParent.find('.data-card')
    if (dataBlocks.length > 1) {
      for (i = 0; i < dataBlocks.length; i++) {
        if (i > 0) {
          $(dataBlocks[i]).remove()
        }
      }
    }
  }

  function removeSkillItem(e) {
    $(e.currentTarget).parent().parent().remove()
  }

  function addSkillToSelected(skill, e) {
    $('.js-skills-selected').show()

    var listItem = $(document.createElement('li')).addClass('list-item-skills')
    listItem.data('id', skill.id)
    var itemContainer = $(document.createElement('div')).addClass(
      'list-item-container'
    )
    var textSpan = $(document.createElement('span')).text(skill.text)
    textSpan.addClass('text-span-skills')
    var innerContainer = $(document.createElement('div')).addClass(
      'list-item-inner-container'
    )
    innerContainer.on('click', removeSkillItem)
    var closeSpan = $(document.createElement('span')).addClass('close-span')
    var svg = $(
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
    for (let i = 0; i < skills.length; i++) {
      var skillsItem = $(document.createElement('li')).text(skills[i].text)
      skillsItem.addClass('js-skills-item-result')
      skillsItem.on('click', function (e) {
        addSkillToSelected(skills[i], e)
        $('.js-skills-results').remove()
        $('.js-skills-search').val('')
      })
      skillsResultsUl.append(skillsItem)
    }

    if (skills.length === 0) {
      var skillsItem = $(document.createElement('li')).text(
        "Add '" + $('.js-skills-search').val() + "'"
      )
      skillsItem.addClass('js-skills-item-result')
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
    }

    $('.skills-top-container').prepend(skillsResultsUl)
  }

  $('#wf-Company-Lead-Form').on('keyup', function (e) {
    if (e.keyCode == 13) {
      e.preventDefault()
      e.stopImmediatePropagation()
      e.stopPropagation()
      return false
    }
  })

  $('.js-skills-search').focusout(function () {
    setTimeout(function () {
      $('.js-skills-results').remove()
    }, 500)
  })
  
  let skillResults = []
  $('.js-skills-search').on('keyup', function (e) {
    var input = $(e.currentTarget)
    var inputValue = input.val()
    if (e.keyCode == 13) {
      addSkillToSelected(
        {
          id: -1,
          text: $('.js-skills-search').val(),
        },
        e
      )
      $('.js-skills-search').val('')
      $('.js-skills-results').remove()
      input.focus()
    } else {
      $('.js-skills-results').remove()
      $.ajax({
        type: 'GET',
        url:
          'https://f470-102-132-191-60.ngrok.io/zadev/search/skills?term=' +
          inputValue +
          '',
        contentType: 'application/json',
        success: function (skills) {
          $('.js-skills-results').remove()
          addSkillsToResults(skills)
        },
      })
    }
  })
})
