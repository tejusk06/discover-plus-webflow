// import type { CMSFilters } from '../../types/CMSFilters';
// import type { Product } from './types';

import { doc } from 'prettier';

/**
 * Populate CMS Data from an external API.
 */

window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
  'cmsload',
  async (listInstances) => {
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

    // Create the new items
    const newOpportunities = opportunities.map((eachOpp) =>
      createItem(eachOpp, oppTemplateElement, likedOpportunities)
    );

    // Populate the list
    await listInstance.addItems(newOpportunities);

    document.querySelector('[discover-element="opportunities-list"]').style.display = 'grid';
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

    // fetch(`https://discover-plus-server.herokuapp.com/api/v1/user/11`, requestOptions)
    fetch(`http://localhost:3000/api/v1/user/11`, requestOptions)
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
