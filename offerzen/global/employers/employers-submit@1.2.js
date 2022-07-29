;(function () {
  const button = document.querySelector('.js-lead-submission-multi-step-button')
  button.setAttribute('disabled', 'disabled')
  const label = button.value;
  button.value = 'Loading...';

  window.companyMultiStepFormLoaded = function () {
    button.value = label;
  }
})();
