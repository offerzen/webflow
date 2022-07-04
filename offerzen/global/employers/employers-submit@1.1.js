;(function () {
  const button = document.querySelector('.js-lead-submission-button')
  button.setAttribute('disabled', 'disabled')
  const label = button.value;
  button.value = 'Loading...';

  window.companyLeadFormLoaded = function () {
    button.value = label;
  }
})();
