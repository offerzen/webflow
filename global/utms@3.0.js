// UTM tracking
(function() {
  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  function trackUtm(query) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "/utms" + query, true);
    xmlHttp.setRequestHeader('Content-Type', 'text/plain');
    xmlHttp.setRequestHeader('Accept', 'text/html');
    xmlHttp.withCredentials = true;
    xmlHttp.send(null);
  }

  function formatUtmParameters(url) {
    var campaign = getParameterByName('utm_campaign', url);
    var content = getParameterByName('utm_content', url);
    var medium = getParameterByName('utm_medium', url);
    var source = getParameterByName('utm_source', url);
    var term = getParameterByName('utm_term', url);

    if (campaign == null && content == null && medium == null && source == null && term == null) {
      return null;
    }

    return "?utm_campaign=" + campaign + "&utm_content=" + content + "&utm_medium=" + medium + "&utm_source=" + source + "&utm_term=" + term;
  }

  function setLandingPage() {
    var cookieString = "landing_page=" + location.pathname.replace(/\//g, '') + ";path=/";
    document.cookie = cookieString;
  }

  window.addEventListener("load", function () {
    url = window.location.href;
    formattedUtmParams = formatUtmParameters(url);
    if (formattedUtmParams !== null) {
      trackUtm(formattedUtmParams);
    }
    setLandingPage();
  })
})();
