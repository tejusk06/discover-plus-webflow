// import type { CMSFilters } from '../../types/CMSFilters';
// import type { Product } from './types';
import { doc } from 'prettier';

import fetchOpportunities from './utils/fetchOpportunities';
import updateSearchesOnAirtable from './utils/updateSearchesOnAirtable';

/**
 * Populate CMS Data from an external API.
 */

window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
  'cmsload',
  async (listInstances) => {
    // Show the saved searches
    showSavedSearches();

    document.querySelector('[discover-element="opportunities-list"]').style.display = 'none';

    // Get the list instance
    const [listInstance] = listInstances;

    // Save a copy of the template
    const [firstItem] = listInstance.items;
    const oppTemplateElement = firstItem.element;

    // Fetch external data
    const opportunities = await fetchOpportunities();
    // console.log('opportunities', opportunities);

    // Remove existing items
    listInstance.clearItems();

    // Get the current liked opportunties by the user
    const likedOpportunities = localStorage.getItem('likedOpportunities');

    if (likedOpportunities !== 'undefined') {
      document.querySelector('[discover-element="liked-opportunities-message"]').style.display =
        'none';
    }

    // Create the new items
    const newOpportunities = opportunities.map((eachOpp) =>
      createItem(eachOpp, oppTemplateElement, likedOpportunities)
    );

    // Populate the list
    await listInstance.addItems(newOpportunities);

    document.querySelector('[discover-element="opportunities-list"]').style.display = 'grid';
  },
]);

// Show saved Searches
const showSavedSearches = () => {
  const savedSearches = localStorage.getItem('savedSearches');
  const searchTemplate = document.querySelector('[discover-element="search-template"]');
  const savedSearchMessage = document.querySelector(
    '[discover-element="favourites-search-message"]'
  );
  if (savedSearches !== 'undefined' && savedSearches !== '' && savedSearches !== '[]') {
    if (savedSearchMessage) {
      savedSearchMessage.style.display = 'none';
    }
    const savedSearchesArray = JSON.parse(savedSearches);

    // Render each saved Search
    savedSearchesArray.forEach((eachSavedSearch) => {
      const newSearch = searchTemplate.cloneNode(true);
      newSearch.style.display = 'flex';

      newSearch.querySelector('[discover-element="search-name"]').innerHTML = eachSavedSearch.name;
      newSearch.querySelector('[discover-element="search-link"]').href = eachSavedSearch.searchUrl;
      const { filterValues } = eachSavedSearch;

      const populateFilterValues = () => {
        if (filterValues.type) {
          newSearch.querySelector('[discover-element="search-type"]').innerHTML =
            filterValues.type.replaceAll(',', ', ');
        } else {
          newSearch.querySelector('[discover-element="search-type"]').parentElement.style.display =
            'none';
        }

        if (filterValues['field-category']) {
          newSearch.querySelector('[discover-element="search-field-category"]').innerHTML =
            filterValues['field-category'].replaceAll(',', ', ');
        } else {
          newSearch.querySelector(
            '[discover-element="search-field-category"]'
          ).parentElement.style.display = 'none';
        }

        if (filterValues.field) {
          newSearch.querySelector('[discover-element="search-field"]').innerHTML =
            filterValues.field.replaceAll(',', ', ');
        } else {
          newSearch.querySelector('[discover-element="search-field"]').parentElement.style.display =
            'none';
        }

        if (filterValues.grade) {
          newSearch.querySelector('[discover-element="search-grade"]').innerHTML =
            filterValues.grade.replaceAll(',', ', ');
        } else {
          newSearch.querySelector('[discover-element="search-grade"]').parentElement.style.display =
            'none';
        }

        if (filterValues.timetable) {
          newSearch.querySelector('[discover-element="search-timetable"]').innerHTML =
            filterValues.timetable.replaceAll(',', ', ');
        } else {
          newSearch.querySelector(
            '[discover-element="search-timetable"]'
          ).parentElement.style.display = 'none';
        }

        if (filterValues['location-type']) {
          newSearch.querySelector('[discover-element="search-location-type"]').innerHTML =
            filterValues['location-type'].replaceAll(',', ', ');
        } else {
          newSearch.querySelector(
            '[discover-element="search-location-type"]'
          ).parentElement.style.display = 'none';
        }

        if (filterValues['location-category']) {
          newSearch.querySelector('[discover-element="search-location-category"]').innerHTML =
            filterValues['location-category'].replaceAll(',', ', ');
        } else {
          newSearch.querySelector(
            '[discover-element="search-location-category"]'
          ).parentElement.style.display = 'none';
        }

        if (filterValues.location) {
          newSearch.querySelector('[discover-element="search-location"]').innerHTML =
            filterValues.location.replaceAll(',', ', ');
        } else {
          newSearch.querySelector(
            '[discover-element="search-location"]'
          ).parentElement.style.display = 'none';
        }

        if (filterValues.deadline) {
          newSearch.querySelector('[discover-element="search-deadline"]').innerHTML =
            filterValues.deadline.replaceAll(',', ', ');
        } else {
          newSearch.querySelector(
            '[discover-element="search-deadline"]'
          ).parentElement.style.display = 'none';
        }
        if (filterValues.duration) {
          newSearch.querySelector('[discover-element="search-duration"]').innerHTML =
            filterValues.duration.replaceAll(',', ', ');
        } else {
          newSearch.querySelector(
            '[discover-element="search-duration"]'
          ).parentElement.style.display = 'none';
        }

        if (filterValues.cost) {
          newSearch.querySelector('[discover-element="search-cost"]').innerHTML =
            filterValues.cost.replaceAll(',', ', ');
        } else {
          newSearch.querySelector('[discover-element="search-cost"]').parentElement.style.display =
            'none';
        }

        if (filterValues['financial-aid']) {
          newSearch.querySelector('[discover-element="search-financial-aid"]').innerHTML = 'Yes';
        } else {
          newSearch.querySelector(
            '[discover-element="search-financial-aid"]'
          ).parentElement.style.display = 'none';
        }
      };

      // Logic to delete search
      const deleteSearch = () => {
        newSearch
          .querySelector('[discover-element="delete-search"]')
          .addEventListener('click', () => {
            const searchElement = event.target.closest('[discover-element="search-template"]');
            const searchName = searchElement.querySelector(
              '[discover-element="search-name"]'
            ).innerHTML;
            const savedSearches = localStorage.getItem('savedSearches');

            const savedSearchesArray = JSON.parse(savedSearches);
            const filteredSearchesArray = savedSearchesArray.filter((eachSavedSearch) => {
              if (eachSavedSearch.name === searchName) {
                return false;
              }
              return true;
            });

            const filteredSearchesString = JSON.stringify(filteredSearchesArray);
            localStorage.setItem('savedSearches', filteredSearchesString);
            if (filteredSearchesString === '[]') {
              savedSearchMessage.style.display = 'block';
            }
            updateSearchesOnAirtable(filteredSearchesString);
            searchElement.remove();
          });
      };

      deleteSearch();
      populateFilterValues();

      searchTemplate.parentElement.append(newSearch);
    });
  }

  searchTemplate.style.display = 'none';
};

/**
 * Like opportunities on airtable
 * @returns
 */

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

    fetch(`https://discover-plus-server.herokuapp.com/api/v1/user/anyid`, requestOptions)
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

    // Make the unliked oppotunity disappear after 1 second
    setTimeout(() => {
      const homeOppItem = likedIcon.closest('[discover-element="home_opp_item"]');

      if (homeOppItem) {
        homeOppItem.style.display = 'none';
      }
    }, 500);
    likedOpportunitiesArray = likedOpportunities.split(',');
    updatedLikedOpportunitiesArray = likedOpportunitiesArray.filter((eachLikedOpportunitity) => {
      if (eachLikedOpportunitity === airtableId) {
        return false;
      }
      return true;
    });

    if (updatedLikedOpportunitiesArray.length === 0) {
      localStorage.setItem('likedOpportunities', 'undefined');
      setTimeout(() => {
        document.querySelector('[discover-element="liked-opportunities-message"]').style.display =
          'block';
      }, 500);
    } else {
      localStorage.setItem('likedOpportunities', updatedLikedOpportunitiesArray);
      setTimeout(() => {
        document.querySelector('[discover-element="liked-opportunities-message"]').style.display =
          'none';
      }, 500);
    }
    updateOpportunityOnAirtable(updatedLikedOpportunitiesArray);
  } else {
    // If liking an opportunity
    likedIcon.style.color = '#E12122';
    // Make the liked oppotunity appear after 1 second
    setTimeout(() => {
      const homeOppItem = likedIcon.closest('[discover-element="home_opp_item"]');

      if (homeOppItem) {
        homeOppItem.style.display = 'block';
      }
    }, 1000);
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

/**
 * Creates an item from the template element.
 * @param opportunity The opportunity data to create the item from.
 * @param templateElement The template element.
 *
 * @returns A new Collection Item element.
 */

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
  const gradeValues = newItem.querySelector('[discover-element="grade-values"]');
  const airtableIdValue = newItem.querySelector('[discover-element="airtable-id"]');

  // Populate inner elements
  const populateFields = () => {
    // Setting the URL for the template page
    itemWrap.href = `opportunity/${eachOpp.slug}`;

    // Make the heart icon red if the opprtunity is liked
    if (likedOpportunities) {
      if (likedOpportunities.includes(eachOpp.airtableId)) {
        likeWrap.querySelector('[discover-element="liked-icon"]').style.color = '#E12122';
      } else {
        likeWrap.closest('.home_opp_item').style.display = 'none';
      }
    } else if (!likedOpportunities) {
      setTimeout(() => {
        // First time user logs in the likedOpportunites have not yet been filled, so check after 2 seconds again
        const likedOpportunities = localStorage.getItem('likedOpportunities');
        if (likedOpportunities?.includes(eachOpp.airtableId)) {
          likeWrap.querySelector('[discover-element="liked-icon"]').style.color = '#E12122';
        }
      }, 1000);
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

    if (gradeValues && eachOpp.gradeLevelValues) {
      gradeValues.textContent = eachOpp.gradeLevelValues;
    } else if (gradeValues) {
      gradeValues.parentElement.style.display = 'none';
    }
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
