(function () {
  const button = document.querySelector('.js-original-lead-submission-button');
  button.setAttribute('disabled', 'disabled');
  const label = button.value;
  button.value = 'Loading...';

  window.originalCompanyLeadFormLoaded = function () {
    button.value = label;
  };
})();
