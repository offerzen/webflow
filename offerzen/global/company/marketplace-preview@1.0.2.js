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
      let elementContent = $(this).text();
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

        if(elementContent === 'Europe') {
          item.push('Netherlands', 'Germany', 'Ireland', 'Spain')
        }else {
          items.push(elementContent);
        }
        $(this).addClass('js-filter-selected');
      }
    });
  }

  function onSubmit(event) {
    event.preventDefault();
    const marketplaceUrl = new URL('https://offerzen.com' + $(this).attr('href'));
    if (filters.locations.length > 0) {
      marketplaceUrl.searchParams.append('locations', filters.locations);
    }
    if (filters.roles.length > 0) {
      marketplaceUrl.searchParams.append('roles', filters.roles);
    }
    if (filters.skills.length > 0) {
      marketplaceUrl.searchParams.append('skills', filters.skills);
    }
    window.location = marketplaceUrl.href;
  }

  onFilterToggle(locationItems, filters.locations);
  onFilterToggle(roleItems, filters.roles, 1, '.js-filter-roles-error');
  onFilterToggle(skillItems, filters.skills, 3, '.js-filter-skill-error');

  $('#submit-filters').on('click', onSubmit);
});
