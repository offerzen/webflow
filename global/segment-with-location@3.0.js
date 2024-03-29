!function(){
  function loadSegment(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}
    // Fallback callback
    function n(name){var g=analytics.factory(name);return function(e,t,n,a){a&&a();return g.apply(null,arguments)}}
    function x(name){var g=analytics.factory(name);return function(e,t,n,a,i){i&&i();return g.apply(null,arguments)}}
    ;['identify','alias','track'].map(function(name){analytics[name]=n(name)})
    ;['page'].map(function(name){analytics[name]=x(name)});
    // Load analytics if possible
    analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics._writeKey="WGk0NXmhoqH5OVjoaJUU6Tmj9Ge6fFY6";analytics.SNIPPET_VERSION="4.13.2";
    analytics.load('WGk0NXmhoqH5OVjoaJUU6Tmj9Ge6fFY6');
    // Custom code
    // Get and Set Location Details for Page Load event
    $.ajax({
      type: 'GET',
      url: '/api/user_location',
      content_type: 'application/json',
      success: function (properties) {
        window.analytics.page('landing', properties);
      },
      error: function () {
        window.analytics.page('landing');
      },
    });
    // end of Custom code
  }}
  loadSegment()
}()
