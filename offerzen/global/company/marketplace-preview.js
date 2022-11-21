$loaded(function () {
  let locationItems = $('.js-filter-location');
  let roleItems = $('.js-filter-role');
  let skillItems = $('.js-filter-skill');
  let filters = {
    locations: [],
    roles: [],
    skills: [],
  };

  function onFilterToggle(
    elements,
    items,
    limit = null,
    limitErrorSelector = null
  ) {
    elements.on('click', function () {
      const elementContent = $(this).text();
      if (items.includes(elementContent)) {
        let index = items.findIndex(function (filterItem) {
          return filterItem === elementContent;
        });
        if (index > -1) {
          items.splice(index, 1);
          $(this).removeClass('js-filter-selected');
          if (limit !== null && items.length < limit) {
            $(limitErrorSelector).hide();
          }
        }
      } else {
        if (limit !== null && items.length >= limit) {
          $(limitErrorSelector).show();
          return;
        }
        items.push(elementContent);
        $(this).addClass('js-filter-selected');
      }
    });
  }

  function onSubmit(event) {
    event.preventDefault();
    const params = new URLSearchParams(filters).toString();
    window.location = $(this).attr('href') + '?' + params;
  }

  onFilterToggle(locationItems, filters.locations);
  onFilterToggle(roleItems, filters.roles);
  onFilterToggle(skillItems, filters.skills, 3, '.js-filter-skill-error');

  $('#submit-filters').on('click', onSubmit);
});
