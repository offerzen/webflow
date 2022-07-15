!function(){
  window.$loaded(function (window, document, $, undefined) {
    var form = $(".events-form");
    var originalButtonText = $(":input[type='submit']").val();

    var submissionSuccess = function(response) {
      form.submit();
      $(":input[type='submit']").val(originalButtonText);
    }

    var handleSubmissionFailure = function(response) {
      $(".w-form-fail").show();
      $(":input[type='submit']").val(originalButtonText);
    }

    var submitFormContent = function(e, token) {
    	$(".w-form-fail").hide();
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      var submitButton = $("#submit_button");

      // configured Growth Form values
      var form_id = submitButton.attr('data-form-id');
      var category = submitButton.attr("data-category");
      var action = submitButton.attr("data-action");
      var source = submitButton.attr("data-source");
      var label = submitButton.attr("data-label");
      var source_detail = submitButton.attr("data-source-detail");

      // Required form fields
      var email = document.querySelector("#email").value;
      var first_name = document.querySelector("#first_name").value;
      var last_name = document.querySelector("#last_name").value;

      var subscribe_to_company_newsletter = document.querySelector("#subscribe_to_company_newsletter").checked;
      var subscribe_to_hiring_insights = document.querySelector("#subscribe_to_company_newsletter").checked;

      // Extra fields which could be required per Webflow form
      var fields = ['company_name', 'job_title'];
      var emailSubscriptions = ['subscribe_to_company_newsletter', 'subscribe_to_blog', 'subscribe_to_hiring_insights', 'subscribe_to_events', 'subscribe_to_job_opportunities'];

      var payload = {
        form_id,
        category,
        action,
        source,
        label,
        source_detail,
        email,
        first_name,
        last_name,
        "g-recaptcha-response-data": { "webflow": token }
      };

      // Loop through optional fields and append them to the payload
      for(i = 0; i < fields.length; i++) {
        var textField = document.querySelector("#" + fields[i]);

        if (textField && typeof textField !== 'undefined') {
          payload[fields[i]] = textField.value;
        }
      }

      // Loop through email subscriptions and append them to the payload
      for(i = 0; i < emailSubscriptions.length; i++) {
        var emailSubscriptionCheckbox = document.querySelector("#" + emailSubscriptions[i]);

        if (emailSubscriptionCheckbox && typeof emailSubscriptionCheckbox !== 'undefined') {
          payload[emailSubscriptions[i]] = emailSubscriptionCheckbox.checked;
        }
      }

      $.ajax({
        accept: 'application/json',
        data: JSON.stringify(payload),
        contentType: 'application/json',
        type: 'POST',
        url: 'https://9fdf-41-71-3-15.ngrok.io/api/growth/forms/community_activities',
        success: submissionSuccess,
        error: handleSubmissionFailure
      });
    }

    $(document).on("click", ":input[type='submit']", function(e) {
    	e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      $(":input[type='submit']").val("Submitting...");

      grecaptcha.ready(function() {
        grecaptcha.execute('6Lf802weAAAAAHgxndx9NIZ3FTzdG3f7nBua2rRY', { action: 'webflow' }).then(function(token) {
          submitFormContent(e, token);
        });
      });
    });
  });
}();
