;(function () {
  const button = document.querySelector('input[type=submit]')
  button.setAttribute('disabled', 'disabled')
  const label = button.value;
  button.value = 'Loading...';

  window.companyLeadFormLoaded = function () {
    button.value = label;
  }
})();
