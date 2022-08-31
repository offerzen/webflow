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
    const originalLeadFormButton = originalLeadForm.find('input[type=submit]');

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
      originalLeadFormButton.attr('disabled', true);
      let initialButtonValue = originalLeadFormButton.attr('value');
      let dataWait = originalLeadFormButton.attr('data-wait');
      originalLeadFormButton.attr('value', dataWait);
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
              page_variant_meta: `${window.pageVariantMeasureStart}-optimize-meta-${pageVariantMeasureEnd}`,
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
            originalLeadFormButton.attr('disabled', false);
            originalLeadFormButton.attr('value', initialButtonValue);
          },
        });
      } else {
        $('.js-missing-fields').show();
        originalLeadFormButton.attr('disabled', false);
        originalLeadFormButton.attr('value', initialButtonValue);
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

    // ------------------------------------------------------------
    // Phone Number Input
    // ------------------------------------------------------------

    // Country Data Set
    const phoneNumberCountries = [
      {
        id: 'af',
        text: 'Afghanistan',
        code: '93',
      },
      {
        id: 'al',
        text: 'Albania',
        code: '355',
      },
      {
        id: 'dz',
        text: 'Algeria',
        code: '213',
      },
      {
        id: 'as',
        text: 'American Samoa',
        code: '1',
      },
      {
        id: 'ad',
        text: 'Andorra',
        code: '376',
      },
      {
        id: 'ao',
        text: 'Angola',
        code: '244',
      },
      {
        id: 'ai',
        text: 'Anguilla',
        code: '1',
      },
      {
        id: 'ag',
        text: 'Antigua and Barbuda',
        code: '1',
      },
      {
        id: 'ar',
        text: 'Argentina',
        code: '54',
        selected: true,
      },
      {
        id: 'am',
        text: 'Armenia',
        code: '374',
      },
      {
        id: 'aw',
        text: 'Aruba',
        code: '297',
      },
      {
        id: 'ac',
        text: 'Ascension Island',
        code: '247',
      },
      {
        id: 'au',
        text: 'Australia',
        code: '61',
      },
      {
        id: 'at',
        text: 'Austria',
        code: '43',
      },
      {
        id: 'az',
        text: 'Azerbaijan',
        code: '994',
      },
      {
        id: 'bs',
        text: 'Bahamas',
        code: '1',
      },
      {
        id: 'bh',
        text: 'Bahrain',
        code: '973',
      },
      {
        id: 'bd',
        text: 'Bangladesh',
        code: '880',
      },
      {
        id: 'bb',
        text: 'Barbados',
        code: '1',
      },
      {
        id: 'by',
        text: 'Belarus',
        code: '375',
      },
      {
        id: 'be',
        text: 'Belgium',
        code: '32',
      },
      {
        id: 'bz',
        text: 'Belize',
        code: '501',
      },
      {
        id: 'bj',
        text: 'Benin',
        code: '229',
      },
      {
        id: 'bm',
        text: 'Bermuda',
        code: '1',
      },
      {
        id: 'bt',
        text: 'Bhutan',
        code: '975',
      },
      {
        id: 'bo',
        text: 'Bolivia',
        code: '591',
      },
      {
        id: 'ba',
        text: 'Bosnia and Herzegovina',
        code: '387',
      },
      {
        id: 'bw',
        text: 'Botswana',
        code: '267',
      },
      {
        id: 'br',
        text: 'Brazil',
        code: '55',
      },
      {
        id: 'io',
        text: 'British Indian Ocean Territory',
        code: '246',
      },
      {
        id: 'vg',
        text: 'British Virgin Islands',
        code: '1',
      },
      {
        id: 'bn',
        text: 'Brunei',
        code: '673',
      },
      {
        id: 'bg',
        text: 'Bulgaria',
        code: '359',
      },
      {
        id: 'bf',
        text: 'Burkina Faso',
        code: '226',
      },
      {
        id: 'bi',
        text: 'Burundi',
        code: '257',
      },
      {
        id: 'kh',
        text: 'Cambodia',
        code: '855',
      },
      {
        id: 'cm',
        text: 'Cameroon',
        code: '237',
      },
      {
        id: 'ca',
        text: 'Canada',
        code: '1',
      },
      {
        id: 'cv',
        text: 'Cape Verde',
        code: '238',
      },
      {
        id: 'bq',
        text: 'Caribbean Netherlands',
        code: '599',
      },
      {
        id: 'ky',
        text: 'Cayman Islands',
        code: '1',
      },
      {
        id: 'cf',
        text: 'Central African Republic',
        code: '236',
      },
      {
        id: 'td',
        text: 'Chad',
        code: '235',
      },
      {
        id: 'cl',
        text: 'Chile',
        code: '56',
      },
      {
        id: 'cn',
        text: 'China',
        code: '86',
      },
      {
        id: 'cx',
        text: 'Christmas Island',
        code: '61',
      },
      {
        id: 'cc',
        text: 'Cocos Islands',
        code: '61',
      },
      {
        id: 'co',
        text: 'Colombia',
        code: '57',
      },
      {
        id: 'km',
        text: 'Comoros',
        code: '269',
      },
      {
        id: 'cd',
        text: 'Congo (DRC)',
        code: '243',
      },
      {
        id: 'cg',
        text: 'Congo (Republic)',
        code: '242',
      },
      {
        id: 'ck',
        text: 'Cook Islands',
        code: '682',
      },
      {
        id: 'cr',
        text: 'Costa Rica',
        code: '506',
      },
      {
        id: 'ci',
        text: 'Côte d’Ivoire',
        code: '225',
      },
      {
        id: 'hr',
        text: 'Croatia',
        code: '385',
      },
      {
        id: 'cu',
        text: 'Cuba',
        code: '53',
      },
      {
        id: 'cw',
        text: 'Curaçao',
        code: '599',
      },
      {
        id: 'cy',
        text: 'Cyprus',
        code: '357',
      },
      {
        id: 'cz',
        text: 'Czech Republic',
        code: '420',
      },
      {
        id: 'dk',
        text: 'Denmark',
        code: '45',
      },
      {
        id: 'dj',
        text: 'Djibouti',
        code: '253',
      },
      {
        id: 'dm',
        text: 'Dominica',
        code: '1',
      },
      {
        id: 'do',
        text: 'Dominican Republic',
        code: '1',
      },
      {
        id: 'ec',
        text: 'Ecuador',
        code: '593',
      },
      {
        id: 'eg',
        text: 'Egypt',
        code: '20',
      },
      {
        id: 'sv',
        text: 'El Salvador',
        code: '503',
      },
      {
        id: 'gq',
        text: 'Equatorial Guinea',
        code: '240',
      },
      {
        id: 'er',
        text: 'Eritrea',
        code: '291',
      },
      {
        id: 'ee',
        text: 'Estonia',
        code: '372',
      },
      {
        id: 'sz',
        text: 'Eswatini',
        code: '268',
      },
      {
        id: 'et',
        text: 'Ethiopia',
        code: '251',
      },
      {
        id: 'fk',
        text: 'Falkland Islands',
        code: '500',
      },
      {
        id: 'fo',
        text: 'Faroe Islands',
        code: '298',
      },
      {
        id: 'fj',
        text: 'Fiji',
        code: '679',
      },
      {
        id: 'fi',
        text: 'Finland',
        code: '358',
      },
      {
        id: 'fr',
        text: 'France',
        code: '33',
      },
      {
        id: 'gf',
        text: 'French Guiana',
        code: '594',
      },
      {
        id: 'pf',
        text: 'French Polynesia',
        code: '689',
      },
      {
        id: 'ga',
        text: 'Gabon',
        code: '241',
      },
      {
        id: 'gm',
        text: 'Gambia',
        code: '220',
      },
      {
        id: 'ge',
        text: 'Georgia',
        code: '995',
      },
      {
        id: 'de',
        text: 'Germany',
        code: '49',
      },
      {
        id: 'gh',
        text: 'Ghana',
        code: '233',
      },
      {
        id: 'gi',
        text: 'Gibraltar',
        code: '350',
      },
      {
        id: 'gr',
        text: 'Greece',
        code: '30',
      },
      {
        id: 'gl',
        text: 'Greenland',
        code: '299',
      },
      {
        id: 'gd',
        text: 'Grenada',
        code: '1',
      },
      {
        id: 'gp',
        text: 'Guadeloupe',
        code: '590',
      },
      {
        id: 'gu',
        text: 'Guam',
        code: '1',
      },
      {
        id: 'gt',
        text: 'Guatemala',
        code: '502',
      },
      {
        id: 'gg',
        text: 'Guernsey',
        code: '44',
      },
      {
        id: 'gn',
        text: 'Guinea',
        code: '224',
      },
      {
        id: 'gw',
        text: 'Guinea-Bissau',
        code: '245',
      },
      {
        id: 'gy',
        text: 'Guyana',
        code: '592',
      },
      {
        id: 'ht',
        text: 'Haiti',
        code: '509',
      },
      {
        id: 'hn',
        text: 'Honduras',
        code: '504',
      },
      {
        id: 'hk',
        text: 'Hong Kong',
        code: '852',
      },
      {
        id: 'hu',
        text: 'Hungary',
        code: '36',
      },
      {
        id: 'is',
        text: 'Iceland',
        code: '354',
      },
      {
        id: 'in',
        text: 'India',
        code: '91',
      },
      {
        id: 'id',
        text: 'Indonesia',
        code: '62',
      },
      {
        id: 'ir',
        text: 'Iran',
        code: '98',
      },
      {
        id: 'iq',
        text: 'Iraq',
        code: '964',
      },
      {
        id: 'ie',
        text: 'Ireland',
        code: '353',
      },
      {
        id: 'im',
        text: 'Isle of Man',
        code: '44',
      },
      {
        id: 'il',
        text: 'Israel',
        code: '972',
      },
      {
        id: 'it',
        text: 'Italy',
        code: '39',
      },
      {
        id: 'jm',
        text: 'Jamaica',
        code: '1',
      },
      {
        id: 'jp',
        text: 'Japan',
        code: '81',
      },
      {
        id: 'je',
        text: 'Jersey',
        code: '44',
      },
      {
        id: 'jo',
        text: 'Jordan',
        code: '962',
      },
      {
        id: 'kz',
        text: 'Kazakhstan',
        code: '7',
      },
      {
        id: 'ke',
        text: 'Kenya',
        code: '254',
      },
      {
        id: 'ki',
        text: 'Kiribati',
        code: '686',
      },
      {
        id: 'xk',
        text: 'Kosovo',
        code: '383',
      },
      {
        id: 'kw',
        text: 'Kuwait',
        code: '965',
      },
      {
        id: 'kg',
        text: 'Kyrgyzstan',
        code: '996',
      },
      {
        id: 'la',
        text: 'Laos',
        code: '856',
      },
      {
        id: 'lv',
        text: 'Latvia',
        code: '371',
      },
      {
        id: 'lb',
        text: 'Lebanon',
        code: '961',
      },
      {
        id: 'ls',
        text: 'Lesotho',
        code: '266',
      },
      {
        id: 'lr',
        text: 'Liberia',
        code: '231',
      },
      {
        id: 'ly',
        text: 'Libya',
        code: '218',
      },
      {
        id: 'li',
        text: 'Liechtenstein',
        code: '423',
      },
      {
        id: 'lt',
        text: 'Lithuania',
        code: '370',
      },
      {
        id: 'lu',
        text: 'Luxembourg',
        code: '352',
      },
      {
        id: 'mo',
        text: 'Macau',
        code: '853',
      },
      {
        id: 'mk',
        text: 'North Macedonia',
        code: '389',
      },
      {
        id: 'mg',
        text: 'Madagascar',
        code: '261',
      },
      {
        id: 'mw',
        text: 'Malawi',
        code: '265',
      },
      {
        id: 'my',
        text: 'Malaysia',
        code: '60',
      },
      {
        id: 'mv',
        text: 'Maldives',
        code: '960',
      },
      {
        id: 'ml',
        text: 'Mali',
        code: '223',
      },
      {
        id: 'mt',
        text: 'Malta',
        code: '356',
      },
      {
        id: 'mh',
        text: 'Marshall Islands',
        code: '692',
      },
      {
        id: 'mq',
        text: 'Martinique',
        code: '596',
      },
      {
        id: 'mr',
        text: 'Mauritania',
        code: '222',
      },
      {
        id: 'mu',
        text: 'Mauritius',
        code: '230',
      },
      {
        id: 'yt',
        text: 'Mayotte',
        code: '262',
      },
      {
        id: 'mx',
        text: 'Mexico',
        code: '52',
      },
      {
        id: 'fm',
        text: 'Micronesia',
        code: '691',
      },
      {
        id: 'md',
        text: 'Moldova',
        code: '373',
      },
      {
        id: 'mc',
        text: 'Monaco',
        code: '377',
      },
      {
        id: 'mn',
        text: 'Mongolia',
        code: '976',
      },
      {
        id: 'me',
        text: 'Montenegro',
        code: '382',
      },
      {
        id: 'ms',
        text: 'Montserrat',
        code: '1',
      },
      {
        id: 'ma',
        text: 'Morocco',
        code: '212',
      },
      {
        id: 'mz',
        text: 'Mozambique',
        code: '258',
      },
      {
        id: 'mm',
        text: 'Myanmar',
        code: '95',
      },
      {
        id: 'na',
        text: 'Namibia',
        code: '264',
      },
      {
        id: 'nr',
        text: 'Nauru',
        code: '674',
      },
      {
        id: 'np',
        text: 'Nepal',
        code: '977',
      },
      {
        id: 'nl',
        text: 'Netherlands',
        code: '31',
      },
      {
        id: 'nc',
        text: 'New Caledonia',
        code: '687',
      },
      {
        id: 'nz',
        text: 'New Zealand',
        code: '64',
      },
      {
        id: 'ni',
        text: 'Nicaragua',
        code: '505',
      },
      {
        id: 'ne',
        text: 'Niger',
        code: '227',
      },
      {
        id: 'ng',
        text: 'Nigeria',
        code: '234',
      },
      {
        id: 'nu',
        text: 'Niue',
        code: '683',
      },
      {
        id: 'nf',
        text: 'Norfolk Island',
        code: '672',
      },
      {
        id: 'kp',
        text: 'North Korea',
        code: '850',
      },
      {
        id: 'mp',
        text: 'Northern Mariana Islands',
        code: '1',
      },
      {
        id: 'no',
        text: 'Norway',
        code: '47',
      },
      {
        id: 'om',
        text: 'Oman',
        code: '968',
      },
      {
        id: 'pk',
        text: 'Pakistan',
        code: '92',
      },
      {
        id: 'pw',
        text: 'Palau',
        code: '680',
      },
      {
        id: 'ps',
        text: 'Palestine',
        code: '970',
      },
      {
        id: 'pa',
        text: 'Panama',
        code: '507',
      },
      {
        id: 'pg',
        text: 'Papua New Guinea',
        code: '675',
      },
      {
        id: 'py',
        text: 'Paraguay',
        code: '595',
      },
      {
        id: 'pe',
        text: 'Peru',
        code: '51',
      },
      {
        id: 'ph',
        text: 'Philippines',
        code: '63',
      },
      {
        id: 'pl',
        text: 'Poland',
        code: '48',
      },
      {
        id: 'pt',
        text: 'Portugal',
        code: '351',
      },
      {
        id: 'pr',
        text: 'Puerto Rico',
        code: '1',
      },
      {
        id: 'qa',
        text: 'Qatar',
        code: '974',
      },
      {
        id: 're',
        text: 'Réunion',
        code: '262',
      },
      {
        id: 'ro',
        text: 'Romania',
        code: '40',
      },
      {
        id: 'ru',
        text: 'Russia',
        code: '7',
      },
      {
        id: 'rw',
        text: 'Rwanda',
        code: '250',
      },
      {
        id: 'bl',
        text: 'Saint Barthélemy',
        code: '590',
      },
      {
        id: 'sh',
        text: 'Saint Helena',
        code: '290',
      },
      {
        id: 'kn',
        text: 'Saint Kitts and Nevis',
        code: '1',
      },
      {
        id: 'lc',
        text: 'Saint Lucia',
        code: '1',
      },
      {
        id: 'mf',
        text: 'Saint Martin)',
        code: '590',
      },
      {
        id: 'pm',
        text: 'Saint Pierre and Miquelon',
        code: '508',
      },
      {
        id: 'vc',
        text: 'Saint Vincent and the Grenadines',
        code: '1',
      },
      {
        id: 'ws',
        text: 'Samoa',
        code: '685',
      },
      {
        id: 'sm',
        text: 'San Marino',
        code: '378',
      },
      {
        id: 'st',
        text: 'São Tomé and Príncipe',
        code: '239',
      },
      {
        id: 'sa',
        text: 'Saudi Arabia',
        code: '966',
      },
      {
        id: 'sn',
        text: 'Senegal',
        code: '221',
      },
      {
        id: 'rs',
        text: 'Serbia',
        code: '381',
      },
      {
        id: 'sc',
        text: 'Seychelles',
        code: '248',
      },
      {
        id: 'sl',
        text: 'Sierra Leone',
        code: '232',
      },
      {
        id: 'sg',
        text: 'Singapore',
        code: '65',
      },
      {
        id: 'sx',
        text: 'Sint Maarten',
        code: '1',
      },
      {
        id: 'sk',
        text: 'Slovakia',
        code: '421',
      },
      {
        id: 'si',
        text: 'Slovenia',
        code: '386',
      },
      {
        id: 'sb',
        text: 'Solomon Islands',
        code: '677',
      },
      {
        id: 'so',
        text: 'Somalia',
        code: '252',
      },
      {
        id: 'za',
        text: 'South Africa',
        code: '27',
      },
      {
        id: 'kr',
        text: 'South Korea',
        code: '82',
      },
      {
        id: 'ss',
        text: 'South Sudan',
        code: '211',
      },
      {
        id: 'es',
        text: 'Spain',
        code: '34',
      },
      {
        id: 'lk',
        text: 'Sri Lanka',
        code: '94',
      },
      {
        id: 'sd',
        text: 'Sudan',
        code: '249',
      },
      {
        id: 'sr',
        text: 'Suritext',
        code: '597',
      },
      {
        id: 'sj',
        text: 'Svalbard and Jan Mayen',
        code: '47',
      },
      {
        id: 'se',
        text: 'Sweden',
        code: '46',
      },
      {
        id: 'ch',
        text: 'Switzerland',
        code: '41',
      },
      {
        id: 'sy',
        text: 'Syria',
        code: '963',
      },
      {
        id: 'tw',
        text: 'Taiwan',
        code: '886',
      },
      {
        id: 'tj',
        text: 'Tajikistan',
        code: '992',
      },
      {
        id: 'tz',
        text: 'Tanzania',
        code: '255',
      },
      {
        id: 'th',
        text: 'Thailand',
        code: '66',
      },
      {
        id: 'tl',
        text: 'Timor-Leste',
        code: '670',
      },
      {
        id: 'tg',
        text: 'Togo',
        code: '228',
      },
      {
        id: 'tk',
        text: 'Tokelau',
        code: '690',
      },
      {
        id: 'to',
        text: 'Tonga',
        code: '676',
      },
      {
        id: 'tt',
        text: 'Trinidad and Tobago',
        code: '1',
      },
      {
        id: 'tn',
        text: 'Tunisia',
        code: '216',
      },
      {
        id: 'tr',
        text: 'Turkey',
        code: '90',
      },
      {
        id: 'tm',
        text: 'Turkmenistan',
        code: '993',
      },
      {
        id: 'tc',
        text: 'Turks and Caicos Islands',
        code: '1',
      },
      {
        id: 'tv',
        text: 'Tuvalu',
        code: '688',
      },
      {
        id: 'vi',
        text: 'U.S. Virgin Islands',
        code: '1',
      },
      {
        id: 'ug',
        text: 'Uganda',
        code: '256',
      },
      {
        id: 'ua',
        text: 'Ukraine',
        code: '380',
      },
      {
        id: 'ae',
        text: 'United Arab Emirates',
        code: '971',
      },
      {
        id: 'gb',
        text: 'United Kingdom',
        code: '44',
      },
      {
        id: 'us',
        text: 'United States',
        code: '1',
      },
      {
        id: 'uy',
        text: 'Uruguay',
        code: '598',
      },
      {
        id: 'uz',
        text: 'Uzbekistan',
        code: '998',
      },
      {
        id: 'vu',
        text: 'Vanuatu',
        code: '678',
      },
      {
        id: 'va',
        text: 'Vatican City',
        code: '39',
      },
      {
        id: 've',
        text: 'Venezuela',
        code: '58',
      },
      {
        id: 'vn',
        text: 'Vietnam',
        code: '84',
      },
      {
        id: 'wf',
        text: 'Wallis and Futuna',
        code: '681',
      },
      {
        id: 'eh',
        text: 'Western Sahara',
        code: '212',
      },
      {
        id: 'ye',
        text: 'Yemen',
        code: '967',
      },
      {
        id: 'zm',
        text: 'Zambia',
        code: '260',
      },
      {
        id: 'zw',
        text: 'Zimbabwe',
        code: '263',
      },
      {
        id: 'ax',
        text: 'Åland Islands',
        code: '358',
      },
    ].map(({ id, text, code }) => ({
      id,
      text,
      code,
      search: normaliseCharacters(`${code} ${text}`),
    }));

    function normaliseCharacters(term) {
      return term
        .toLocaleLowerCase()
        .normalize('NFD') // Creates separate bytes for characters and diacritical marks
        .replace(/[\u0300-\u036f]/g, ''); // Replaces any diacritical marks in the string
    }

    // Search Functionality
    function matchCustom(params, data) {
      if (!params.term || params.term === '') {
        return data;
      }

      const term = normaliseCharacters(params.term)
        .replace(/[^a-z0-9 ]/gi, '') // Ignores everything that isn't a number or letter
        .trim();
      const search = data.search;
      let fuzzyTerm = term;

      // TODO: If the search is not a number, use looser matching criteria. Refine to weight letters in the same word higher
      // if (!term.match(/[0-9]/)) {
      //   fuzzyTerm = term.split("").join(".*");
      // }

      if (search?.match(fuzzyTerm)) {
        return data;
      }
      return null;
    }

    // Format Data for Dropdown
    function formatData(data) {
      if (!data.id) {
        return data.text;
      }
      let countryName = data.text;
      let countryCode = data.code;
      let $data = $(
        `<span class="country-text-container"><span class="country-code">+${countryCode} </span><span class="country-name">(${countryName})</span></span>`
      );
      return $data;
    }

    // Format Selected Country Code
    function formatCode(data) {
      if (!data.id) {
        return data.text;
      }
      let countryCode = data.code;
      let $data = $(`<span class="country-code">+${countryCode}</span>`);
      return $data;
    }

    const countryCodeSelector = originalLeadForm.find('.js-phone-country-code');
    const phoneNumberInput = originalLeadForm.find('.js-phone-number');

    function initializePhoneNumberField() {
      const countryCodeOverride = originalLeadForm
        .find('.js-default-country-code')
        .text()
        .toLowerCase();

      // Initialise Select2
      const select2 = countryCodeSelector.select2({
        data: phoneNumberCountries,
        templateResult: formatData,
        templateSelection: formatCode,
        matcher: matchCustom,
        dropdownParent: $('.js-country-code-dropdown'),
      });

      // Set selected country code based on Webflow symbol override field
      function setInitialCountryCode(countryCode) {
        countryCodeSelector.val(countryCode);
        countryCodeSelector.trigger('change');
      }

      setInitialCountryCode(countryCodeOverride);

      // Focus search input and set placeholder text
      select2.siblings('.select2').click(function () {
        $('.js-country-code-dropdown')
          .find('.select2-search__field')[0]
          .focus();

        originalLeadForm
          .find('.select2-search__field')
          .attr('placeholder', 'Search by country or code');
      });

      // Update phone number to hidden input
      countryCodeSelector.on('change', updatePhoneNumber);
      phoneNumberInput.on('keyup input blur', updatePhoneNumber);

      // Prevent symbols & letters from being inserted
      phoneNumberInput.on('keypress', function (e) {
        if (isNaN(e.key)) e.preventDefault();
      });

      // Trigger validation
      countryCodeSelector.on('blur', function () {
        $(phoneNumberInput).parsley().validate();
      });

      phoneNumberInput.on('blur', function () {
        $(phoneNumberInput).parsley().validate();
      });
    }

    // Extract selected country data & convert to object
    function selectedCountryCode(selector) {
      let countryCodeData = selector.select2('data');
      return countryCodeData.pop();
    }

    function updatePhoneNumber() {
      let selectedCountry = selectedCountryCode(countryCodeSelector);
      const phoneDialCode = selectedCountry.code;

      const phoneNumber = phoneNumberInput.val();
      updateContactPhoneField(phoneDialCode, phoneNumber);

      // TODO: Implement live formatting
      // const phoneRegionCode = selectedCountry.id.toUpperCase();
      // const formattedNumber = new libphonenumber.AsYouType(phoneRegionCode).input(
      //   phoneNumberInput.val()
      // );
      // phoneNumberInput.val(formattedNumber);
    }

    function cleanPhoneNumber(phoneNumber) {
      const cleanNumber = phoneNumber.replace(/[^0-9]/g, '').replace(/^0/, '');
      return cleanNumber;
    }

    function updateContactPhoneField(countryCode, phoneNumber) {
      const cleanNumber = cleanPhoneNumber(phoneNumber);
      originalLeadForm
        .find('input[name=contact_phone]')
        .val(`+${countryCode}${cleanNumber}`);
    }

    function addPhoneValidation(onPhoneFieldReady) {
      window.parsley.addValidator('phonenumber', function (value) {
        const selectedCountry = selectedCountryCode(countryCodeSelector);
        const phoneDialCode = `+${selectedCountry.code}`;
        const cleanPhoneNumberValue = cleanPhoneNumber(phoneNumberInput.val());

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
        if (phoneDialCode.match(/\+(27|31)/)) {
          match = cleanPhoneNumberValue.match(/^[0-9]{9}$/);

          if (cleanPhoneNumberValue.length <= 8) {
            return $.Deferred().reject(
              'Phone number is invalid. Please enter your full number.'
            );
          }
        }
        // Loose for others, NSN=7..11, with 1 extra in case on either side i.e. 6..12
        else {
          match = cleanPhoneNumberValue.match(/^[0-9]{6,12}$/);

          if (cleanPhoneNumberValue.length <= 5) {
            return $.Deferred().reject(
              'Phone number is invalid. Please enter your full number.'
            );
          }
        }

        return !!match;
      });

      onPhoneFieldReady();
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
      originalLeadForm.find('.w-checkbox').each(function () {
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

      originalLeadForm
        .find('#in-office-checkbox, #fully-remote-checkbox, #hybrid-checkbox')
        .on('change', function (e) {
          const formData = new FormData(originalLeadForm[0]);
          const formProperties = Object.fromEntries(formData.entries());

          formProperties[e.target.name] = e.target.checked ? 'on' : 'off';

          const role_types = getRoleTypes(formProperties);

          originalLeadForm
            .find('input[name=workplace_policy]')
            .val(role_types.join(','));
        });

      // Load testing
      let isFormReady = false;
      let isPhoneReady = false;

      function onFormReady() {
        if (!isPhoneReady || !isFormReady) return;

        // Form is ready, but might still be waiting for recaptcha. That has it's own check in submit, so can be ignored
        originalLeadFormButton.attr('disabled', false);

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
      initializePhoneNumberField();
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
