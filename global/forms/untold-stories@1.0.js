$loaded(function (window, document, $, undefined) {
  let topCountries = ['South Africa', 'Netherlands', 'Germany']
  let countries = [
    'United States',
    'Canada',
    'Afghanistan',
    'Albania',
    'Algeria',
    'American Samoa',
    'Andorra',
    'Angola',
    'Anguilla',
    'Antarctica',
    'Antigua and/or Barbuda',
    'Argentina',
    'Armenia',
    'Aruba',
    'Australia',
    'Austria',
    'Azerbaijan',
    'Bahamas',
    'Bahrain',
    'Bangladesh',
    'Barbados',
    'Belarus',
    'Belgium',
    'Belize',
    'Benin',
    'Bermuda',
    'Bhutan',
    'Bolivia',
    'Bosnia and Herzegovina',
    'Botswana',
    'Bouvet Island',
    'Brazil',
    'British Indian Ocean Territory',
    'Brunei Darussalam',
    'Bulgaria',
    'Burkina Faso',
    'Burundi',
    'Cambodia',
    'Cameroon',
    'Cape Verde',
    'Cayman Islands',
    'Central African Republic',
    'Chad',
    'Chile',
    'China',
    'Christmas Island',
    'Cocos (Keeling) Islands',
    'Colombia',
    'Comoros',
    'Congo',
    'Cook Islands',
    'Costa Rica',
    'Croatia (Hrvatska)',
    'Cuba',
    'Cyprus',
    'Czech Republic',
    'Denmark',
    'Djibouti',
    'Dominica',
    'Dominican Republic',
    'East Timor',
    'Ecudaor',
    'Egypt',
    'El Salvador',
    'Equatorial Guinea',
    'Eritrea',
    'Estonia',
    'Ethiopia',
    'Falkland Islands (Malvinas)',
    'Faroe Islands',
    'Fiji',
    'Finland',
    'France',
    'France, Metropolitan',
    'French Guiana',
    'French Polynesia',
    'French Southern Territories',
    'Gabon',
    'Gambia',
    'Georgia',
    'Germany',
    'Ghana',
    'Gibraltar',
    'Greece',
    'Greenland',
    'Grenada',
    'Guadeloupe',
    'Guam',
    'Guatemala',
    'Guinea',
    'Guinea-Bissau',
    'Guyana',
    'Haiti',
    'Heard and Mc Donald Islands',
    'Honduras',
    'Hong Kong',
    'Hungary',
    'Iceland',
    'India',
    'Indonesia',
    'Iran (Islamic Republic of)',
    'Iraq',
    'Ireland',
    'Israel',
    'Italy',
    'Ivory Coast',
    'Jamaica',
    'Japan',
    'Jordan',
    'Kazakhstan',
    'Kenya',
    'Kiribati',
    "Korea, Democratic People's Republic of",
    'Korea, Republic of',
    'Kosovo',
    'Kuwait',
    'Kyrgyzstan',
    "Lao People's Democratic Republic",
    'Latvia',
    'Lebanon',
    'Lesotho',
    'Liberia',
    'Libyan Arab Jamahiriya',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg',
    'Macau',
    'Macedonia',
    'Madagascar',
    'Malawi',
    'Malaysia',
    'Maldives',
    'Mali',
    'Malta',
    'Marshall Islands',
    'Martinique',
    'Mauritania',
    'Mauritius',
    'Mayotte',
    'Mexico',
    'Micronesia, Federated States of',
    'Moldova, Republic of',
    'Monaco',
    'Mongolia',
    'Montserrat',
    'Morocco',
    'Mozambique',
    'Myanmar',
    'Namibia',
    'Nauru',
    'Nepal',
    'Netherlands',
    'Netherlands Antilles',
    'New Caledonia',
    'New Zealand',
    'Nicaragua',
    'Niger',
    'Nigeria',
    'Niue',
    'Norfork Island',
    'Northern Mariana Islands',
    'Norway',
    'Oman',
    'Pakistan',
    'Palau',
    'Panama',
    'Papua New Guinea',
    'Paraguay',
    'Peru',
    'Philippines',
    'Pitcairn',
    'Poland',
    'Portugal',
    'Puerto Rico',
    'Qatar',
    'Reunion',
    'Romania',
    'Russian Federation',
    'Rwanda',
    'Saint Kitts and Nevis',
    'Saint Lucia',
    'Saint Vincent and the Grenadines',
    'Samoa',
    'San Marino',
    'Sao Tome and Principe',
    'Saudi Arabia',
    'Senegal',
    'Serbia',
    'Seychelles',
    'Sierra Leone',
    'Singapore',
    'Slovakia',
    'Slovenia',
    'Solomon Islands',
    'Somalia',
    'South Africa',
    'South Georgia South Sandwich Islands',
    'South Sudan',
    'Spain',
    'Sri Lanka',
    'St. Helena',
    'St. Pierre and Miquelon',
    'Sudan',
    'Suriname',
    'Svalbarn and Jan Mayen Islands',
    'Swaziland',
    'Sweden',
    'Switzerland',
    'Syrian Arab Republic',
    'Taiwan',
    'Tajikistan',
    'Tanzania, United Republic of',
    'Thailand',
    'Togo',
    'Tokelau',
    'Tonga',
    'Trinidad and Tobago',
    'Tunisia',
    'Turkey',
    'Turkmenistan',
    'Turks and Caicos Islands',
    'Tuvalu',
    'Uganda',
    'Ukraine',
    'United Arab Emirates',
    'United Kingdom',
    'United States minor outlying islands',
    'Uruguay',
    'Uzbekistan',
    'Vanuatu',
    'Vatican City State',
    'Venezuela',
    'Vietnam',
    'Virigan Islands (British)',
    'Virgin Islands (U.S.)',
    'Wallis and Futuna Islands',
    'Western Sahara',
    'Yemen',
    'Zaire',
    'Zambia',
    'Zimbabwe',
  ]
  let country_dropdown = $('#country_dropdown')

  let topOptions = $("<optgroup label='Top Countries'></optgroup>")
  for (let key in topCountries) {
    let country = topCountries[key]
    let ele = $('<option></option>').attr('value', country).text(country)
    topOptions.append(ele)
  }

  country_dropdown.append(topOptions)

  let restOptions = $("<optgroup label='All Countries'></optgroup>")
  for (let key in countries) {
    let country = countries[key]
    let ele = $('<option></option>').attr('value', country).text(country)
    restOptions.append(ele)
  }
  country_dropdown.append(restOptions)

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
        // analytics.identify(res.user_id)
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
        .execute('6LdyT_MUAAAAAIodzZ8Ty-ZV-_1PGFmV2M70eMY-', {
          action: 'community_activity_submission',
        })
        .then(function (token) {
          const formData = new FormData(e.currentTarget)
          const formProperties = Object.fromEntries(formData.entries())
          submitFormContent(formObject, formProperties, token)
        })
    })
  })
})
