;(function () {
  const button = document.querySelector('input[type=submit]')
  button.setAttribute('disabled', 'disabled')
  const label = button.value;
  button.value = 'Loading...';

  $loaded(function () {
    button.value = label;
  });
})();
