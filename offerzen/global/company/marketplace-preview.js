$loaded(function() {
  let locationItems = $('.js-filter-location');
  let roleItems = $('.js-filter-role');
  let skillItems = $('.js-filter-skill');
  let filters = {
    locations: [],
    roles: [],
    skills: [],
  };

  function onFilterToggle(elements, items) {
    elements.on('click', function() {
      const elementContent = $(this).text();
      console.log(elementContent, items, items.includes(elementContent))
      if (items.includes(elementContent)) {
        let index = items.findIndex(function(filterItem) {
          return filterItem === elementContent;
        });
        if (index > -1) {
          items.splice(index, 1);
          $(this).removeClass("js-filter-selected")
        }
      } else {
        items.push(elementContent);
        $(this).addClass("js-filter-selected")
      }
    });
  }

  function onSubmit() {
    event.preventDefault();
    const params = new URLSearchParams(filters).toString();
    console.log(filters)
    window.location = $(this).attr('href') + "?" + params
  }

  onFilterToggle(locationItems, filters.locations);
  onFilterToggle(roleItems, filters.roles);
  onFilterToggle(skillItems, filters.skills);

  $('#submit-filters').on('click', onSubmit)
})
