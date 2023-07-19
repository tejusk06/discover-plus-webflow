// import type { CMSFilters } from '../../types/CMSFilters';
// import type { Product } from './types';
import { doc } from 'prettier';

import fetchOpportunities from './utils/fetchOpportunities';
import showAlert from './utils/showAlert';
import updateSearchesOnAirtable from './utils/updateSearchesOnAirtable';

//  Populate CMS Data from an external API.
const populateDateFromCms = () => {
  window.fsAttributes = window.fsAttributes || [];
  window.fsAttributes.push([
    'cmsload',
    async (listInstances) => {
      // Get the list instance
      const [listInstance] = listInstances;

      // Save a copy of the template
      const [firstItem] = listInstance.items;
      const oppTemplateElement = firstItem.element;

      // Fetch external data
      const opportunities = await fetchOpportunities();

      // Remove existing items
      listInstance.clearItems();

      // Get the current liked opportunties by the user
      const likedOpportunities = localStorage.getItem('likedOpportunities');

      // Create the new items
      const newOpportunities = opportunities.map((eachOpp) =>
        createItem(eachOpp, oppTemplateElement, likedOpportunities)
      );

      // Populate the list
      await listInstance.addItems(newOpportunities);
    },
  ]);

  //  Like opportunities on airtable
  const likeOpportunityUpdate = async (airtableId, likedIcon) => {
    // Function to make the API call
    const updateOpportunityOnAirtable = (updatedLikedOpportunitiesArray) => {
      const userAirtableId = localStorage.getItem('airtableId');
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      var raw = JSON.stringify({
        event: 'liked.updated',
        id: userAirtableId,
        payload: updatedLikedOpportunitiesArray,
      });

      var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      fetch(`https://discover-plus-server.herokuapp.com/api/v1/user/1`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          return;
        })
        .catch((error) => console.log('error', error));
    };

    // Get the current liked opportunties by the user
    const likedOpportunities = localStorage.getItem('likedOpportunities');
    let updatedLikedOpportunitiesArray = [];
    let likedOpportunitiesArray = [];

    if (likedOpportunities.includes(airtableId)) {
      // If unliking an opportunity
      likedIcon.style.color = '#9b9b9b';
      likedOpportunitiesArray = likedOpportunities.split(',');
      updatedLikedOpportunitiesArray = likedOpportunitiesArray.filter((eachLikedOpportunitity) => {
        if (eachLikedOpportunitity === airtableId) {
          return false;
        }
        return true;
      });

      if (updatedLikedOpportunitiesArray.length === 0) {
        localStorage.setItem('likedOpportunities', 'undefined');
      } else {
        localStorage.setItem('likedOpportunities', updatedLikedOpportunitiesArray);
      }
      updateOpportunityOnAirtable(updatedLikedOpportunitiesArray);
    } else {
      // If liking an opportunity
      likedIcon.style.color = '#E12122';
      if (likedOpportunities === 'undefined') {
        updatedLikedOpportunitiesArray = [airtableId];
        localStorage.setItem('likedOpportunities', updatedLikedOpportunitiesArray);
        updateOpportunityOnAirtable(updatedLikedOpportunitiesArray);
      } else {
        updatedLikedOpportunitiesArray = likedOpportunities.split(',');
        updatedLikedOpportunitiesArray.push(airtableId);
        localStorage.setItem('likedOpportunities', updatedLikedOpportunitiesArray);
        updateOpportunityOnAirtable(updatedLikedOpportunitiesArray);
      }
    }
  };

  // @returns A new Collection Item element.
  const createItem = (eachOpp, templateElement, likedOpportunities) => {
    // Clone the template element
    const newItem = templateElement.cloneNode(true);

    // Query inner elements
    const itemWrap = newItem.querySelector('[discover-element="item-wrap"]');
    const likeWrap = newItem.querySelector('[discover-element="like-wrap"]');
    const image = newItem.querySelector('[discover-element="item-image"]');
    const fieldCategory = newItem.querySelector('[discover-element="item-field-category"]');
    const name = newItem.querySelector('[discover-element="item-name"]');
    const locationType = newItem.querySelector('[discover-element="location-type"]');
    const amountValues = newItem.querySelector('[discover-element="amount-values"]');
    const costText = newItem.querySelector('[discover-element="cost-text"]');
    const gradeValues = newItem.querySelector('[discover-element="grade-values"]');
    const airtableIdValue = newItem.querySelector('[discover-element="airtable-id"]');

    // CMS filters values start here
    const typeFilter = newItem.querySelector('[fs-cmsfilter-field="type"]');
    const fieldCategoryFilter = newItem.querySelector('[fs-cmsfilter-field="field-category"]');
    const fieldFilter = newItem.querySelector('[fs-cmsfilter-field="field"]');
    const ageFilter = newItem.querySelector('[fs-cmsfilter-field="age"]');
    const gradeFilter = newItem.querySelector('[fs-cmsfilter-field="grade"]');
    const timetableFilter = newItem.querySelector('[fs-cmsfilter-field="timetable"]');
    const locationTypeFilter = newItem.querySelector('[fs-cmsfilter-field="location-type"]');
    const locationCategoryFilter = newItem.querySelector(
      '[fs-cmsfilter-field="location-category"]'
    );
    const locationFilter = newItem.querySelector('[fs-cmsfilter-field="location"]');
    const deadlineFilter = newItem.querySelector('[fs-cmsfilter-field="deadline"]');
    const durationFilter = newItem.querySelector('[fs-cmsfilter-field="duration"]');
    const costFilter = newItem.querySelector('[fs-cmsfilter-field="cost"]');
    const financialAidFilter = newItem.querySelector('[fs-cmsfilter-field="financial-aid"]');

    // Populate inner elements
    const populateFields = () => {
      // Setting the URL for the template page
      itemWrap.href = `opportunity/${eachOpp.slug}`;

      // Make the heart icon red if the opprtunity is liked
      if (likedOpportunities) {
        if (likedOpportunities.includes(eachOpp.airtableId) && likeWrap) {
          likeWrap.querySelector('[discover-element="liked-icon"]').style.color = '#E12122';
        }
      } else if (!likedOpportunities) {
        setTimeout(() => {
          // First time user logs in the likedOpportunites have not yet been filled, so check after 2 seconds again
          const likedOpportunities = localStorage.getItem('likedOpportunities');
          if (likedOpportunities?.includes(eachOpp.airtableId) && likeWrap) {
            likeWrap.querySelector('[discover-element="liked-icon"]').style.color = '#E12122';
          }
        }, 2000);
      }

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

      if (costText && eachOpp.compensation) {
        costText.textContent = 'Compensation:';
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

      if (durationFilter && eachOpp.duration) {
        eachOpp.duration.split(',').forEach((eachDuration) => {
          const newDuration = durationFilter.cloneNode(true);
          newDuration.textContent = eachDuration.trim();
          durationFilter.parentElement.append(newDuration);
        });
        durationFilter.removeAttribute('fs-cmsfilter-field');
      }

      if (costFilter && eachOpp.amount) {
        eachOpp.amount.split(',').forEach((eachAmount) => {
          const newAmount = costFilter.cloneNode(true);
          newAmount.textContent = eachAmount.trim();
          costFilter.parentElement.append(newAmount);
        });
      }

      if (costFilter && eachOpp.cost) {
        eachOpp.cost.split(',').forEach((eachCost) => {
          const newCost = costFilter.cloneNode(true);
          newCost.textContent = eachCost.trim();
          costFilter.parentElement.append(newCost);
        });

        costFilter.removeAttribute('fs-cmsfilter-field');
      }

      if (financialAidFilter)
        financialAidFilter.textContent = eachOpp.financialAid ? 'Financial Aid' : '';
    };

    // Adding event listener to like an opportunity
    const likeItem = () => {
      airtableIdValue.innerHTML = eachOpp.airtableId;

      likeWrap?.addEventListener('click', () => {
        const likedIcon = likeWrap.querySelector('[discover-element="liked-icon"]');
        const airtableId = likeWrap.parentElement.querySelector(
          '[discover-element="airtable-id"]'
        ).innerHTML;
        likeOpportunityUpdate(airtableId, likedIcon);
      });
    };

    populateFields();
    likeItem();

    return newItem;
  };
};

// Moving the fields into their field categories for filtering functionality
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

  // Seeting scroll Position on checing any filter
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

        // Add active class from matching location box
        locationBoxes.forEach((eachLocationBoxOverlay) => {
          const actualCheckbox = eachLocationBoxOverlay.parentElement.querySelector(
            '.home_filter_checkbox-region'
          );
          if (
            categoryCheckboxName ===
            actualCheckbox.querySelector('.home_filters_checkbox-label').innerHTML
          ) {
            if (!actualCheckbox.classList.contains('fs-cmsfilter_active')) {
              actualCheckbox.classList.add('fs-cmsfilter_active');
            }
          }
        });
      } else {
        // Uncheck all child checkboxes if category was unchecked
        childCheckboxes.forEach((eachChildCheckbox) => {
          if (eachChildCheckbox.classList.contains('fs-cmsfilter_active')) {
            eachChildCheckbox.click();
          }
        });

        // Add active class from matching location box
        locationBoxes.forEach((eachLocationBoxOverlay) => {
          const actualCheckbox = eachLocationBoxOverlay.parentElement.querySelector(
            '.home_filter_checkbox-region'
          );
          if (
            categoryCheckboxName ===
            actualCheckbox.querySelector('.home_filters_checkbox-label').innerHTML
          ) {
            if (actualCheckbox.classList.contains('fs-cmsfilter_active')) {
              actualCheckbox.classList.remove('fs-cmsfilter_active');
            }
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

      // Remove/Add active class from matching location box
      const categoryCheckboxName = categoryCheckbox.querySelector(
        '.home_filters_checkbox-label'
      ).innerHTML;

      const toggleLocationBox = () => {
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
      };

      if (childCheckbox.classList.contains('fs-cmsfilter_active')) {
        // if child checkbox was checked
        if (!categoryCheckbox.classList.contains('fs-cmsfilter_active')) {
          // make sure parent is checked
          categoryCheckbox.click();
          // Add active class to matching location box
          toggleLocationBox();
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
            // Remove active class from matching location box
            toggleLocationBox();
          }
        }
      }
    }
    // Restore scroll position because clicking on checkboxes scrolls the element which is set to overflow
    filtersTabPane.scrollTop = scrollPostion;
  });

  // Adding logic to uncheck field/location category when the tag is unchecked
  const categoryHolders = document.querySelectorAll('.home_filters_category-holder');

  categoryHolders.forEach((eachCategoryHolder) => {
    const eachCategoryCheckbox = eachCategoryHolder.querySelector('.home_filters_checkbox-field');
    eachCategoryCheckbox.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT') {
        if (!e.target.checked) {
          // If category was unchecked
          const fieldCheckboxesWrap = e.target
            .closest('.home_filters_item-wrap')
            .querySelector('.home_filters_fields-wrap');

          const locationCheckboxesWrap = e.target
            .closest('.home_filters_item-wrap')
            .querySelector('.home_filters_location-wrap');

          // If a field category was unchecked
          if (fieldCheckboxesWrap) {
            // Time delay to allow for active class to dissapear
            setTimeout(() => {
              const fieldCheckboxes = fieldCheckboxesWrap?.querySelectorAll(
                '.home_filters_checkbox-field'
              );
              fieldCheckboxes.forEach((eachField, index) => {
                if (eachField.classList.contains('fs-cmsfilter_active')) {
                  // Uncheck the children that were checked after a delay of 70 ms between each to allow time to react
                  setTimeout(() => {
                    eachField.click();
                  }, 100 * index);
                }
              });
            }, 50);
          }

          // If a field category was unchecked
          if (locationCheckboxesWrap) {
            // Remove active class from location
            const categoryCheckboxName = e.target
              .closest('.home_filters_item-wrap')
              .querySelector('.home_filters_category-holder')
              .querySelector('.home_filters_checkbox-label').innerHTML;

            // Remove/Add active class from matching location box
            locationBoxes.forEach((eachLocationBoxOverlay) => {
              const actualCheckbox = eachLocationBoxOverlay.parentElement.querySelector(
                '.home_filter_checkbox-region'
              );
              if (
                categoryCheckboxName ===
                actualCheckbox.querySelector('.home_filters_checkbox-label').innerHTML
              ) {
                actualCheckbox.classList.remove('fs-cmsfilter_active');
              }
            });

            setTimeout(() => {
              const locationCheckboxes = locationCheckboxesWrap?.querySelectorAll(
                '.home_filters_checkbox-field'
              );

              locationCheckboxes.forEach((eachLocation, index) => {
                if (eachLocation.classList.contains('fs-cmsfilter_active')) {
                  setTimeout(() => {
                    eachLocation.click();
                  }, 100 * index);
                }
              });
            }, 50);
          }
        }
      }
    });
  });
};

// Save Searches ability if user is logged in
const saveSearches = () => {
  const saveSearchButton = document.querySelector('[discover-element="save-search-button"]');
  const saveSearchNonMembers = document.querySelector(
    '[discover-element="save-search-non-members"]'
  );
  const saveSearchSubmit = document.querySelector('[discover-element="save-search-submit"]');
  const cancelSaveButton = document.querySelector('[discover-element="cancel-save-search"]');
  const saveSearchSection = document.querySelector('[discover-element="section-save-search"]');
  const saveSearchForm = document.querySelector('[discover-element="save-search-form"]');
  const saveSearchFormInput = document.querySelector('[discover-element="save-search-input"]');

  saveSearchNonMembers?.addEventListener('click', () => {
    showAlert('Log in or create a free account to save this search criteria.');
    const closeAlertButton = document.querySelector('[discover-element="close-alert"]');
    closeAlertButton.href = '/sign-in';
    closeAlertButton.innerHTML = 'Log In';
  });

  cancelSaveButton?.addEventListener('click', () => {
    saveSearchFormInput.value = '';
    saveSearchSection.style.display = 'none';
  });

  // Only show save search if filters are selected
  saveSearchButton?.addEventListener('click', () => {
    if (window.location.search === '') {
      showAlert('Select atleast one filter to save search');
    } else {
      saveSearchSection.style.display = 'flex';
    }
  });

  // When search is saved
  // $(saveSearchForm).submit(function (e) {
  saveSearchSubmit.addEventListener('click', () => {
    // e.preventDefault();
    const localSavedSearches = localStorage.getItem('savedSearches');
    const searchName = saveSearchFormInput?.value;
    const searchUrl = '/' + window.location.search;
    const queryParams = new URLSearchParams(window.location.search);
    const filterValues = Object.fromEntries(queryParams.entries());

    // Loop through the query parameters and log their values

    const savedSearchJson = {
      name: searchName,
      searchUrl,
      filterValues,
    };

    if (localSavedSearches === 'undefined' || localSavedSearches === '') {
      // If there are currently no searches defined
      const savedSearchesArray = [savedSearchJson];
      const savedSearchesString = JSON.stringify(savedSearchesArray);
      localStorage.setItem('savedSearches', savedSearchesString);
      updateSearchesOnAirtable(savedSearchesString);

      saveSearchSection.style.display = 'none';
      saveSearchFormInput.value = '';

      // alert('Search Saved');
      showAlert('Search Saved');
      showSavedSearches();
    } else {
      // If there are searches already existing
      const localSavedSearchesArray = JSON.parse(localSavedSearches);
      let searchNameUnique = true;

      // Check if the search name is unique
      localSavedSearchesArray.forEach((eachLocalSearch) => {
        if (eachLocalSearch.name === searchName) {
          searchNameUnique = false;
        }
      });

      if (searchNameUnique) {
        const savedSearchesArray = [...localSavedSearchesArray, savedSearchJson];
        const savedSearchesString = JSON.stringify(savedSearchesArray);
        localStorage.setItem('savedSearches', savedSearchesString);
        updateSearchesOnAirtable(savedSearchesString);
        saveSearchSection.style.display = 'none';
        saveSearchFormInput.value = '';

        showAlert('Search Saved');
        showSavedSearches();
      } else {
        showAlert('A saved search already exists with the same name.');
      }
    }

    // return false;
  });
  // );

  // });
};

const showSavedSearches = () => {
  let numOfTimesChecked = 0;
  const checkIfUserLoaded = setInterval(() => {
    // Checking if user loaded
    const templateSavedSearch = document.querySelector(
      '[discover-element="template-saved-search"]'
    );
    templateSavedSearch.style.display = 'block';
    const userCreated = localStorage.getItem('userCreated');
    const localSavedSearches = localStorage.getItem('savedSearches');
    if (userCreated) {
      if (
        localSavedSearches !== 'undefined' &&
        localSavedSearches !== '[]' &&
        localSavedSearches !== ''
      ) {
        // If there are searches already existing
        const localSavedSearchesArray = JSON.parse(localSavedSearches);
        while (templateSavedSearch.parentElement.children.length > 1) {
          templateSavedSearch.parentElement.removeChild(
            templateSavedSearch.parentElement.lastChild
          );
        }
        templateSavedSearch.style.display = 'none';
        localSavedSearchesArray.forEach((eachSavedSearch) => {
          const newSearchLink = templateSavedSearch?.cloneNode(true);
          newSearchLink.querySelector('.home_search_item-name').innerHTML = eachSavedSearch.name;
          newSearchLink.href = `${eachSavedSearch.searchUrl}`;
          newSearchLink.style.display = 'block';
          templateSavedSearch.parentElement.appendChild(newSearchLink);
        });
      } else {
        templateSavedSearch.querySelector('.home_search_item-name').innerHTML = 'No Saved Searches';
        templateSavedSearch.style.display = 'block';
      }
      clearInterval(checkIfUserLoaded);
    }
    numOfTimesChecked++;
    if (numOfTimesChecked > 10) {
      clearInterval(checkIfUserLoaded);
    }
  }, 500);
};

// Toggle checkboxes selected/all categories text
const showSelectedFilterText = () => {
  document.addEventListener('click', function (e) {
    if (e.target.type === 'checkbox') {
      const parentDropdown = e.target.closest('[discover-element="home-filters-dropdown"]');

      if (parentDropdown) {
        // Only do logic if the checkbox is inside a dropdown
        const allFiltersText = parentDropdown.querySelector(
          '[discover-element="all-filters-text"]'
        );
        const selectedFiltersText = parentDropdown.querySelector(
          '[discover-element="selected-filters-text"]'
        );

        const allCheckboxes = parentDropdown.querySelectorAll("input[type='checkbox']");

        // Check if any checkbox is checked
        let allunchecked = true;
        for (let i = 0; i < allCheckboxes.length; i++) {
          const checkbox = allCheckboxes[i];

          // Check if the checkbox is checked
          if (checkbox.checked) {
            allunchecked = false;
            // Break out of the loop
            break;
          }
        }

        if (allunchecked) {
          allFiltersText.style.display = 'block';
          selectedFiltersText.style.display = 'none';
        } else {
          allFiltersText.style.display = 'none';
          selectedFiltersText.style.display = 'block';
        }
      }
    }
  });
};

Webflow.push(function () {
  // DOMready has fired on webflow

  populateDateFromCms();
  moveFields();
  showSelectedFilterText();
  saveSearches();
  showSavedSearches();
});
