(function () {
  const button = document.querySelector(
    '.js-multi-step-lead-submission-button'
  );
  button.setAttribute('disabled', 'disabled');
  const label = button.value;
  button.value = 'Loading...';

  window.multiStepCompanyLeadFormLoaded = function () {
    button.value = label;
  };
})();