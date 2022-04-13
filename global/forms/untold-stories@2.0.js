$loaded(function (window, document, $, undefined) {
  function submitFormContent(formObject, formProperties, token, callback) {
    let subscribe_to_company_newsletter = $('#subscribe_to_newsletter').val()
    let formPayload = Object.assign({}, formProperties, {
      'g-recaptcha-response-data': token,
    })

    if ($('#subscribe_to_newsletter').is(':checked')) {
      formPayload = Object.assign({}, formPayload, {
        subscribe_to_company_newsletter: true,
      })
    }

    function findAndSetValueIfEmpty(paramObj, key, value) {
      if (!paramObj.hasOwnProperty(key)) {
        paramObj[key] = value
      }
    }

    let form = $('#untold_stories')
    var paramObj = {
      form_id: form.data('form_id'),
      livestorm_session_id: form.data('livestorm_session_id'),
      form_action: form.data('action'),
      source: form.data('source'),
      source_detail: form.data('source_detail'),
      label: form.data('label'),
      category: form.data('category'),
      referrer: location.href,
    }

    $.each(form.serializeArray(), function (_, kv) {
      if (kv.value === 'on' || kv.value === 'off') {
        paramObj[kv.name] = kv.value === 'on' ? 'true' : 'false'
      } else {
        paramObj[kv.name] = kv.value
      }
    })

    // set defaults
    findAndSetValueIfEmpty(paramObj, 'subscribe_to_company_newsletter', 'false')
    findAndSetValueIfEmpty(paramObj, 'privacy_policy', 'false')

    paramObj = Object.assign(paramObj, formProperties)

    $('#submit_button').text('Submitting...')
    // submit form
    $.post('/api/growth/forms/event_premiers', paramObj, function (res) {
      if (res.user_id) {
        dataLayer.push({
          event: 'Event Registration',
          label: 'untold stories',
          action: form.data('action'),
          source: form.data('source'),
          source_detail: form.data('source_detail'),
          category: form.data('category'),
        })
        window.location = form.data('redirect')
      }
      $('#submit_button').text('Submit')
    }).fail(function (e) {
      $('#submit_button').text('Submit')
    })
  }

  $('#untold_stories').on('submit', function (e) {
    let scope = this
    e.stopPropagation()
    e.preventDefault()
    let formObject = $(e.currentTarget)
    grecaptcha.ready(function () {
      grecaptcha
        .execute('6Lf802weAAAAAHgxndx9NIZ3FTzdG3f7nBua2rRY', {
          action: 'webflow',
        })
        .then(function (token) {
          const formData = new FormData(e.currentTarget)
          const formProperties = Object.fromEntries(formData.entries())
          submitFormContent(formObject, formProperties, token)
        })
    })
  })
})
