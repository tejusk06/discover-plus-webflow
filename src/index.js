// import type { CMSFilters } from '../../types/CMSFilters';
// import type { Product } from './types';

import { doc } from 'prettier';

/**
 * Populate CMS Data from an external API.
 */
window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
  'cmsfilter',
  async (filtersInstances) => {
    // Get the filters instance
    const [filtersInstance] = filtersInstances;

    // Get the list instance
    const { listInstance } = filtersInstance;

    // Save a copy of the template
    const [firstItem] = listInstance.items;
    const oppTemplateElement = firstItem.element;

    // Fetch external data
    const opportunities = await fetchOpportunities();
    // console.log('opportunities', opportunities);

    // Remove existing items
    listInstance.clearItems();

    // Create the new items
    const newOpportunities = opportunities.map((eachOpp) =>
      createItem(eachOpp, oppTemplateElement)
    );

    // Populate the list
    await listInstance.addItems(newOpportunities);

    // Move fields into their field categories
    moveFields();

    // Add logic to clear all tags when "Clear filters" is clicked
    const clearFiltersLink = document.querySelector('[discover-element="clear-filters"]');

    clearFiltersLink.addEventListener('click', () => {
      const tagCloseLinks = document.querySelectorAll('[fs-cmsfilter-element="tag-remove"]');
      tagCloseLinks.forEach((eachTagClose) => {
        eachTagClose.click();
      });
    });

    // Sync the CMSFilters instance with the new created filters
    filtersInstance.storeFiltersData();
  },
]);

/**
 * Fetches opportunities from airtable
 * @returns An array of {@link opportunities}.
 */

const fetchOpportunities = async () => {
  try {
    const response = await fetch('https://discover-plus-server.herokuapp.com/api/v1/opportunities');
    const data = await response.json();
    return data.allOpportunities;
  } catch (error) {
    console.log(error);
    return [];
  }
};

/**
 * Creates an item from the template element.
 * @param opportunity The opportunity data to create the item from.
 * @param templateElement The template element.
 *
 * @returns A new Collection Item element.
 */
const createItem = (eachOpp, templateElement) => {
  // Clone the template element
  const newItem = templateElement.cloneNode(true);

  // Query inner elements
  const itemWrap = newItem.querySelector('[discover-element="item-wrap"]');
  const image = newItem.querySelector('[discover-element="item-image"]');
  const fieldCategory = newItem.querySelector('[discover-element="item-field-category"]');
  const name = newItem.querySelector('[discover-element="item-name"]');
  const locationType = newItem.querySelector('[discover-element="location-type"]');
  const amountValues = newItem.querySelector('[discover-element="amount-values"]');
  const gradeValues = newItem.querySelector('[discover-element="grade-values"]');

  // CMS filters values start here
  const typeFilter = newItem.querySelector('[fs-cmsfilter-field="type"]');
  const fieldCategoryFilter = newItem.querySelector('[fs-cmsfilter-field="field-category"]');
  const fieldFilter = newItem.querySelector('[fs-cmsfilter-field="field"]');
  const ageFilter = newItem.querySelector('[fs-cmsfilter-field="age"]');
  const gradeFilter = newItem.querySelector('[fs-cmsfilter-field="grade"]');
  const timetableFilter = newItem.querySelector('[fs-cmsfilter-field="timetable"]');
  const locationTypeFilter = newItem.querySelector('[fs-cmsfilter-field="location-type"]');
  const locationCategoryFilter = newItem.querySelector('[fs-cmsfilter-field="location-category"]');
  const locationFilter = newItem.querySelector('[fs-cmsfilter-field="location"]');
  const deadlineFilter = newItem.querySelector('[fs-cmsfilter-field="deadline"]');
  const costFilter = newItem.querySelector('[fs-cmsfilter-field="cost"]');
  const financialAidFilter = newItem.querySelector('[fs-cmsfilter-field="financial-aid"]');

  // const image = newItem.querySelector('[data-element="image"]');
  // const category = newItem.querySelector('[data-element="category"]');
  // const description = newItem.querySelector('[data-element="description"]');

  // Populate inner elements
  // Setting the URL for the template page
  itemWrap.href = `opportunity/${eachOpp.slug}`;

  itemWrap.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.setItem('queryParam', `${window.location.search}`);
    window.location.href = itemWrap.href;
  });

  if (image && eachOpp.organizationImageUrl) {
    image.src = eachOpp.organizationImageUrl;
    image.classList.remove('w-dyn-bind-empty');
    image.parentElement.classList.remove('w-condition-invisible');
  }
  if (name) {
    name.textContent = eachOpp.name;
  }
  if (fieldCategory && eachOpp.fieldCategories) {
    eachOpp.fieldCategories
      .split(', ')
      .sort()
      .forEach((eachFieldCategory) => {
        const newFieldCategory = fieldCategory.cloneNode(true);
        newFieldCategory.textContent = eachFieldCategory.trim();

        fieldCategory.parentElement.append(newFieldCategory);
      });
    // Hide the type template
    fieldCategory.style.display = 'none';
  } else if (fieldCategory) {
    fieldCategory.parentElement.style.display = 'none';
  }

  if (locationType && eachOpp.remoteInperson) {
    locationType.textContent = eachOpp.remoteInperson;
  } else if (locationType) {
    locationType.parentElement.style.display = 'none';
  }
  if (amountValues && eachOpp.amount) {
    amountValues.textContent = eachOpp.amount;
  } else if (amountValues) {
    amountValues.parentElement.style.display = 'none';
  }

  if (gradeValues && eachOpp.gradeLevelValues) {
    gradeValues.textContent = eachOpp.gradeLevelValues;
  } else if (gradeValues) {
    gradeValues.parentElement.style.display = 'none';
  }

  if (typeFilter && eachOpp.types) {
    eachOpp.types.forEach((eachType) => {
      const newType = typeFilter.cloneNode(true);
      newType.textContent = eachType;

      typeFilter.parentElement.append(newType);
    });
    typeFilter.removeAttribute('fs-cmsfilter-field');
  }

  if (fieldCategoryFilter && eachOpp.fieldCategories) {
    eachOpp.fieldCategories.split(',').forEach((eachFieldCategory) => {
      const newFieldCategory = fieldCategoryFilter.cloneNode(true);
      newFieldCategory.textContent = eachFieldCategory.trim();

      fieldCategoryFilter.parentElement.append(newFieldCategory);
    });
    fieldCategoryFilter.removeAttribute('fs-cmsfilter-field');
  }

  if (fieldFilter && eachOpp.fields) {
    eachOpp.fields.forEach((eachField) => {
      const newField = fieldFilter.cloneNode(true);
      newField.textContent = eachField;
      fieldFilter.parentElement.append(newField);
    });

    fieldFilter.removeAttribute('fs-cmsfilter-field');
  }

  if (ageFilter && eachOpp.ageValues) {
    eachOpp.ageValues.split(',').forEach((eachAge) => {
      const newAge = ageFilter.cloneNode(true);
      newAge.textContent = eachAge.trim();
      ageFilter.parentElement.append(newAge);
    });
    ageFilter.removeAttribute('fs-cmsfilter-field');
  }

  if (gradeFilter && eachOpp.gradeLevelValues) {
    eachOpp.gradeLevelValues.split(',').forEach((eachGrade) => {
      const newGrade = gradeFilter.cloneNode(true);

      newGrade.textContent = eachGrade.trim();

      gradeFilter.parentElement.append(newGrade);
    });
    gradeFilter.removeAttribute('fs-cmsfilter-field');
  }

  if (timetableFilter && eachOpp.timetable) {
    eachOpp.timetable.split(',').forEach((eachTimetable) => {
      const newTimetable = timetableFilter.cloneNode(true);
      newTimetable.textContent = eachTimetable.trim();
      timetableFilter.parentElement.append(newTimetable);
    });
    timetableFilter.removeAttribute('fs-cmsfilter-field');
  }

  if (locationTypeFilter && eachOpp.remoteInperson) {
    if (eachOpp.remoteInperson === 'Remote & In-person') {
      const newLocationType = locationTypeFilter.cloneNode(true);
      newLocationType.textContent = 'Remote';
      locationTypeFilter.parentElement.append(newLocationType);
      locationTypeFilter.textContent = 'In-person';
    } else {
      locationTypeFilter.textContent = eachOpp.remoteInperson;
    }
    // locationTypeFilter.removeAttribute('fs-cmsfilter-field');
  }

  if (locationCategoryFilter && eachOpp.locationCategory) {
    eachOpp.locationCategory.forEach((eachLocationCategory) => {
      const newLocationCategory = locationCategoryFilter.cloneNode(true);
      newLocationCategory.textContent = eachLocationCategory;
      locationCategoryFilter.parentElement.append(newLocationCategory);
    });
    locationCategoryFilter.removeAttribute('fs-cmsfilter-field');
  }

  if (locationFilter && eachOpp.location) {
    eachOpp.location.split(',').forEach((eachLocation) => {
      const newLocation = locationFilter.cloneNode(true);
      newLocation.textContent = eachLocation.trim();
      locationFilter.parentElement.append(newLocation);
    });
    locationFilter.removeAttribute('fs-cmsfilter-field');
  }

  if (deadlineFilter && eachOpp.applicationDeadline) {
    eachOpp.applicationDeadline.split(',').forEach((eachDeadline) => {
      const newDeadline = deadlineFilter.cloneNode(true);
      newDeadline.textContent = eachDeadline.trim();
      deadlineFilter.parentElement.append(newDeadline);
    });
    deadlineFilter.removeAttribute('fs-cmsfilter-field');
  }

  if (costFilter && eachOpp.amount) {
    eachOpp.amount.split(',').forEach((eachAmount) => {
      const newAmount = costFilter.cloneNode(true);
      newAmount.textContent = eachAmount.trim();
      costFilter.parentElement.append(newAmount);
    });
    costFilter.removeAttribute('fs-cmsfilter-field');
  }

  if (financialAidFilter)
    financialAidFilter.textContent = eachOpp.financialAid ? 'Financial Aid' : '';
  // if (category) category.textContent = eachOpp.category;
  // if (description) description.textContent = eachOpp.description;

  return newItem;
};

/**
 * Moving the fields into their field categories
 */

const moveFields = () => {
  const fields = document.querySelectorAll('[discover-element="field-wrap"]');
  const fieldCategories = document.querySelectorAll('[discover-element="field-category-wrap"]');

  // Inserting child fields into Category fields

  fieldCategories.forEach((eachFieldCategory) => {
    fields.forEach((eachField) => {
      if (
        eachFieldCategory.querySelector('.home_filters_checkbox-label').innerHTML ===
        eachField.querySelector('.home_filters_field-category').innerHTML
      ) {
        if (
          eachFieldCategory.querySelector('.home_filters_checkbox-label').innerHTML ===
          eachField.querySelector('.home_filters_checkbox-label').innerHTML
        ) {
          eachField.style.display = 'none';
        }
        eachFieldCategory.querySelector('.home_filters_fields-wrap')?.append(eachField);
      }
    });
  });

  const locations = document.querySelectorAll('[discover-element="location-wrap"]');
  const locationCategories = document.querySelectorAll(
    '[discover-element="location-category-wrap"]'
  );

  // Inserting child locations into Category locations
  locationCategories.forEach((eachLocationCategory) => {
    locations.forEach((eachLocation) => {
      if (
        eachLocationCategory.querySelector('.home_filters_checkbox-label').innerHTML ===
          eachLocation.querySelector('.home_filters_location-category').innerHTML &&
        eachLocationCategory.querySelector('.home_filters_checkbox-label').innerHTML !==
          eachLocation.querySelector('.home_filters_checkbox-label').innerHTML
      ) {
        eachLocationCategory.querySelector('.home_filters_location-wrap').append(eachLocation);
      }
    });
  });

  // Fixing scroll position

  let scrollPosition;

  // Store latest Scroll position
  setInterval(() => {
    scrollPosition = $(window).scrollTop();
  }, 500);

  document.addEventListener('click', function (e) {
    if (e.target.type === 'checkbox') {
      $(window).scrollTop(scrollPosition);
    }
  });

  // Remove Duplicate tags
  const removeDuplicateTags = () => {
    setTimeout(() => {
      const tagTexts = [];
      const allTags = document.querySelectorAll('.home_opp_tag-template');

      allTags.forEach((eachTag) => {
        const tagText = eachTag.querySelector('.home_opp_tag-text');
        if (tagTexts.includes(tagText.innerHTML)) {
          eachTag.style.display = 'none';
        } else {
          tagTexts.push(tagText.innerHTML);
        }
      });
    }, 100);
  };

  // Adding logic to check child categories of fields
  const fieldsCheckboxesWrapper = document.querySelector(
    '[discover-element="fields-checkboxes-dropdown"]'
  );

  fieldsCheckboxesWrapper?.addEventListener('click', (e) => {
    // console.log('clicked', e.target);
    const filtersList = e.target.closest('.home_filters_list');
    const scrollPostion = filtersList.scrollTop;

    if (e.target.classList.contains('home_filters_category-overlay')) {
      // If user clicks on a category checkbox overlay

      const categoryCheckbox = e.target.parentElement.querySelector('.home_filters_checkbox-field');

      // Click on the actual category checkbox
      categoryCheckbox.click();

      const childCheckboxes = categoryCheckbox.parentElement.parentElement
        .querySelector('.home_filters_fields-wrap')
        .querySelectorAll('.home_filters_checkbox-field');

      // Check if category was checked
      if (categoryCheckbox.classList.contains('fs-cmsfilter_active')) {
        // Check all child checkboxes if category was checked
        childCheckboxes.forEach((eachChildCheckbox) => {
          if (!eachChildCheckbox.classList.contains('fs-cmsfilter_active')) {
            eachChildCheckbox.click();
          }
        });

        // Remove Duplicate tag templates
        removeDuplicateTags();
      } else {
        // Uncheck all child checkboxes if category was unchecked
        childCheckboxes.forEach((eachChildCheckbox) => {
          if (eachChildCheckbox.classList.contains('fs-cmsfilter_active')) {
            eachChildCheckbox.click();
          }
        });
      }
    } else if (e.target.classList.contains('home_filters_child-overlay')) {
      // If user clicks on a child checkbox

      const childCheckbox = e.target.parentElement.querySelector('.home_filters_checkbox-field');

      // Get Category checkbox
      const categoryCheckbox = childCheckbox
        .closest('.home_filters_item-wrap')
        .querySelector('.home_filters_category-holder')
        .querySelector('.home_filters_checkbox-field');

      childCheckbox.click();

      if (childCheckbox.classList.contains('fs-cmsfilter_active')) {
        // if child checkbox was checked
        if (!categoryCheckbox.classList.contains('fs-cmsfilter_active')) {
          // make sure parent is checked
          categoryCheckbox.click();
        }
      } else {
        // If child was unchecked
        const childCheckboxes = childCheckbox
          .closest('.home_filters_fields-wrap')
          .querySelectorAll('.home_filters_checkbox-field');
        let allUnchecked = true;

        childCheckboxes.forEach((eachChildCheckbox) => {
          if (eachChildCheckbox.classList.contains('fs-cmsfilter_active')) {
            allUnchecked = false;
          }
        });

        // Uncheck the parent if all child checkboxes are unchecked
        if (allUnchecked) {
          if (categoryCheckbox.classList.contains('fs-cmsfilter_active')) {
            categoryCheckbox.click();
          }
        }
      }
    }
    // Restore scroll position because clicking on checkboxes scrolls the element which is set to overflow
    filtersList.scrollTop = scrollPostion;
  });

  // Adding logic to mirror click locations categories

  const locationBoxes = document
    .querySelector('.home_filters_locations-wrapper')
    .querySelectorAll('.home_filter_checkbox-region-wrap');

  const locationCategoriesWrap = document.querySelectorAll(
    '[discover-element="location-category-wrap"]'
  );

  locationBoxes.forEach((eachLocationBoxOverlay) => {
    eachLocationBoxOverlay.addEventListener('click', (e) => {
      if (e.target.parentElement.classList.contains('home_filter_checkbox-region-wrap')) {
        const boxCategoryChecked = e.target.parentElement.querySelector(
          '.home_filters_checkbox-label'
        ).innerHTML;

        locationCategoriesWrap.forEach((eachLocationCategory) => {
          const eachLocationCategoryName = eachLocationCategory
            .querySelector('.home_filters_category-holder')
            .querySelector('.home_filters_checkbox-label').innerHTML;

          if (boxCategoryChecked === eachLocationCategoryName) {
            eachLocationCategory.querySelector('.home_filters_category-overlay').click();
          }
        });
      }
    });
  });

  // Adding logic to check child categories of Locations
  const locationsCheckboxesWrapper = document.querySelector(
    '[discover-element="locations-checkboxes-tab"]'
  );

  locationsCheckboxesWrapper?.addEventListener('click', (e) => {
    // console.log('clicked', e.target);
    const filtersTabPane = e.target.closest('.home_filters_tab-pane');
    const scrollPostion = filtersTabPane.scrollTop;

    if (e.target.classList.contains('home_filters_category-overlay')) {
      // If user clicks on a category checkbox overlay

      const categoryCheckbox = e.target.parentElement.querySelector('.home_filters_checkbox-field');
      const categoryCheckboxName = categoryCheckbox.querySelector(
        '.home_filters_checkbox-label'
      ).innerHTML;

      // Click on the actual category checkbox
      categoryCheckbox.click();

      // Remove active class from matching location box
      locationBoxes.forEach((eachLocationBoxOverlay) => {
        const actualCheckbox = eachLocationBoxOverlay.parentElement.querySelector(
          '.home_filter_checkbox-region'
        );
        if (
          categoryCheckboxName ===
          actualCheckbox.querySelector('.home_filters_checkbox-label').innerHTML
        ) {
          actualCheckbox.classList.toggle('fs-cmsfilter_active');
        }
      });

      const childCheckboxes = categoryCheckbox.parentElement.parentElement
        .querySelector('.home_filters_location-wrap')
        .querySelectorAll('.home_filters_checkbox-field');

      // Check if category was checked
      if (categoryCheckbox.classList.contains('fs-cmsfilter_active')) {
        // Check all child checkboxes if category was checked
        childCheckboxes.forEach((eachChildCheckbox) => {
          if (!eachChildCheckbox.classList.contains('fs-cmsfilter_active')) {
            eachChildCheckbox.click();
          }
        });

        // Remove Duplicate tag templates
        removeDuplicateTags();
      } else {
        // Uncheck all child checkboxes if category was unchecked
        childCheckboxes.forEach((eachChildCheckbox) => {
          if (eachChildCheckbox.classList.contains('fs-cmsfilter_active')) {
            eachChildCheckbox.click();
          }
        });
      }
    } else if (e.target.classList.contains('home_filters_child-overlay')) {
      // If user clicks on a child checkbox

      const childCheckbox = e.target.parentElement.querySelector('.home_filters_checkbox-field');

      // Get Category checkbox
      const categoryCheckbox = childCheckbox
        .closest('.home_filters_item-wrap')
        .querySelector('.home_filters_category-holder')
        .querySelector('.home_filters_checkbox-field');

      childCheckbox.click();

      if (childCheckbox.classList.contains('fs-cmsfilter_active')) {
        // if child checkbox was checked
        if (!categoryCheckbox.classList.contains('fs-cmsfilter_active')) {
          // make sure parent is checked
          categoryCheckbox.click();
        }
      } else {
        // If child was unchecked
        const childCheckboxes = childCheckbox
          .closest('.home_filters_location-wrap')
          .querySelectorAll('.home_filters_checkbox-field');
        let allUnchecked = true;

        childCheckboxes.forEach((eachChildCheckbox) => {
          if (eachChildCheckbox.classList.contains('fs-cmsfilter_active')) {
            allUnchecked = false;
          }
        });

        // Uncheck the parent if all child checkboxes are unchecked
        if (allUnchecked) {
          if (categoryCheckbox.classList.contains('fs-cmsfilter_active')) {
            categoryCheckbox.click();
          }
        }
      }
    }
    // Restore scroll position because clicking on checkboxes scrolls the element which is set to overflow
    filtersTabPane.scrollTop = scrollPostion;
  });
};
