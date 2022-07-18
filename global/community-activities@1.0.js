!function(){
  window.$loaded(function (window, document, $, undefined) {
    var form = $(".events-form");
    const submitButton = form.find(":input[type='submit']");
    const originalButtonText = submitButton.val();

    var submissionSuccess = function(response) {
      form.submit();
      submitButton.val(originalButtonText);
    }

    var handleSubmissionFailure = function(response) {
      $(".w-form-fail").show();
      submitButton.val(originalButtonText);
    }

    var submitFormContent = function(e, token) {
    	$(".w-form-fail").hide();
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      // configured Growth Form values
      var formId = submitButton.attr('data-form-id');
      var category = submitButton.attr("data-category");
      var action = submitButton.attr("data-action");
      var source = submitButton.attr("data-source");
      var label = submitButton.attr("data-label");
      var source_detail = submitButton.attr("data-source-detail");

      // Required form fields
      var email = document.querySelector("#email").value;
      var firstName = document.querySelector("#first_name").value;
      var lastName = document.querySelector("#last_name").value;

      // Extra fields which could be required per Webflow form
      var fields = ['company_name', 'job_title'];
      var email_subscriptions = ['subscribe_to_company_newsletter', 'subscribe_to_blog', 'subscribe_to_hiring_insights', 'subscribe_to_events', 'subscribe_to_job_opportunities'];

      var payload = {
        form_id: formId,
        category,
        action,
        source,
        label,
        source_detail,
        email,
        first_name: firstName,
        last_name: lastName,
        "g-recaptcha-response-data": { "webflow": token }
      };

      // Loop through optional fields and append them to the payload
      for(i = 0; i < fields.length; i++) {
        var textField = document.querySelector(`input[name='${fields[i]}']`);// document.querySelector("#" + fields[i]);

        if (textField != null) {
          payload[fields[i]] = textField.value;
        }
      }

      // Loop through email subscriptions and append them to the payload
      for(i = 0; i < email_subscriptions.length; i++) {
        var email_subscription_checkbox = document.querySelector("#" + email_subscriptions[i]);

        if (email_subscription_checkbox && typeof email_subscription_checkbox !== 'undefined') {
          payload[email_subscriptions[i]] = email_subscription_checkbox.checked;
        }
      }

      $.ajax({
        accept: 'application/json',
        data: JSON.stringify(payload),
        contentType: 'application/json',
        type: 'POST',
        url: '/api/growth/forms/community_activities',
        success: submissionSuccess,
        error: handleSubmissionFailure
      });
    }

    $(document).on("click", submitButton[0], function(e) {
    	e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      submitButton.val("Submitting...");

      grecaptcha.ready(function() {
        grecaptcha.execute('6Lf802weAAAAAHgxndx9NIZ3FTzdG3f7nBua2rRY', { action: 'webflow' }).then(function(token) {
          submitFormContent(e, token);
        });
      });
    });
  });
}();
