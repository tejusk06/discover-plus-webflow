import _ from 'lodash';
import { doc } from 'prettier';

Webflow.push(function () {
  // DOMready has fired

  const allOpportunitiesLink = document.querySelector(
    '[discover-element="all-opportunities-link"]'
  );
  const sectionLimit = document.querySelector('[discover-element="section-limit"]');
  const sectionOppMain = document.querySelector('[discover-element="section-opp-main"]');
  const limitForm = document.querySelector('[discover-element="limit-form"]');
  const limitEmail = document.querySelector('[discover-element="limit-email"]');
  const expertFormUrl = document.querySelector('[discover-element="expert-form-opp-url"]');
  const infoFormUrl = document.querySelector('[discover-element="info-form-opp-url"]');
  const claimFormUrl = document.querySelector('[discover-element="claim-form-opp-url"]');

  const formatFields = () => {
    // Get timetable text in the header section
    const timetableText = document.querySelector('[discover-element="timetable-text"]');

    // Get duration text in the header section
    const durationText = document.querySelector('[discover-element="duration-text"]');

    // Get cost text in the header section
    const costText = document.querySelector('[discover-element="cost-text"]');

    // Get the Field Category
    const fieldCategoryWrap = document.querySelector('[discover-element="field-item"]');

    // Get the Timetable wrap in the sidebar section
    const timetableWrap = document.querySelector('[discover-element="timetable-item"]');

    // Get the Grade wrap in the sidebar section
    const gradeWrap = document.querySelector('[discover-element="grade-item"]');

    // Get the Grade wrap in the sidebar section
    const durationWrap = document.querySelector('[discover-element="duration-item"]');

    // Get the Cost wrap in the sidebar section
    const costWrap = document.querySelector('[discover-element="cost-item"]');

    // Checking if timetable text exists
    if (timetableText) {
      // Splitting into individual text
      const timetableTexts = timetableText.innerHTML.split(',');

      //   Creating individual text for each timetable
      timetableTexts.forEach((eachTimetableText) => {
        const newTimetableText = timetableText.cloneNode(true);
        newTimetableText.innerHTML = eachTimetableText;

        timetableText.parentElement.appendChild(newTimetableText);
      });

      //   Removing the initial timetable text
      timetableText.remove();
    }

    // Checking if duration text exists
    if (durationText) {
      // Splitting into individual text
      const durationTexts = durationText.innerHTML.split(',');

      //   Creating individual text for each duration
      durationTexts.forEach((eachDurationText) => {
        const newDurationText = durationText.cloneNode(true);
        newDurationText.innerHTML = eachDurationText;

        durationText.parentElement.appendChild(newDurationText);
      });

      //   Removing the initial duration text
      durationText.remove();
    }

    // Checking if cost text exists
    if (costText) {
      // Splitting into individual text
      const costTexts = costText.innerHTML.split(',');

      //   Creating individual text for each timetable
      costTexts.forEach((eachCostText) => {
        const newCostText = costText.cloneNode(true);
        newCostText.innerHTML = eachCostText;

        costText.parentElement.appendChild(newCostText);
      });

      //   Removing the initial timetable text
      costText.remove();
    }

    // Checking if Field Category exists
    if (fieldCategoryWrap) {
      // Split the categories
      const fieldCategories = fieldCategoryWrap.firstChild.innerHTML.split(',');

      //   Looping for each cateogory and creating a new blue wrap
      fieldCategories.forEach((fieldCategory) => {
        const newFieldCategoryWrap = fieldCategoryWrap.parentElement.cloneNode(true);

        newFieldCategoryWrap.firstChild.firstChild.innerHTML = fieldCategory;

        fieldCategoryWrap.parentElement.parentElement.appendChild(newFieldCategoryWrap);
      });

      //   Removing the initial Field cateogory which was comma seperated
      fieldCategoryWrap.parentElement.remove();
    }

    // Checking if Timetable exists
    if (timetableWrap) {
      // Split the timetables
      const timetables = timetableWrap.firstChild.innerHTML.split(',');

      //   Looping for each timetable creating a new blue wrap
      timetables.forEach((timetable) => {
        const newTimetableWrap = timetableWrap.cloneNode(true);

        newTimetableWrap.firstChild.innerHTML = timetable;

        timetableWrap.parentElement.appendChild(newTimetableWrap);
      });

      timetableWrap.remove();
    }

    // Checking if Grade Exists
    if (gradeWrap) {
      const grades = gradeWrap.firstChild.innerHTML.split(',');

      grades.forEach((grade) => {
        const newGradeWrap = gradeWrap.cloneNode(true);

        newGradeWrap.firstChild.innerHTML = grade;

        gradeWrap.parentElement.appendChild(newGradeWrap);
      });

      gradeWrap.remove();
    }

    // Checking if Grade Exists
    if (costWrap) {
      const costs = costWrap.firstChild.innerHTML.split(',');

      costs.forEach((eachCost) => {
        const newCostWrap = costWrap.cloneNode(true);

        newCostWrap.firstChild.innerHTML = eachCost;

        costWrap.parentElement.appendChild(newCostWrap);
      });

      costWrap.remove();
    }

    // Arranging Topics in alphabetical order
    const topicsList = document.querySelector('.op_main_topics-list');
    const topicsWrapper = topicsList?.parentElement;
    const topicItemsArray = Array.from(topicsList?.children);

    if (topicsList) {
      const sortedTopicsArray = _.sortBy(topicItemsArray, (eachTopic) => {
        return eachTopic.querySelector('.op_main_topics-ltem-text').innerHTML;
      });

      const sortedTopicsFragment = document.createDocumentFragment();
      sortedTopicsArray.forEach((eachTopic) => {
        sortedTopicsFragment.appendChild(eachTopic);
      });

      topicsList.innerHTML = '';
      topicsList.appendChild(sortedTopicsFragment);
    }

    // Making all the links in rich text open in a new tab
    const richtextDivs = document.querySelectorAll('.op_main_richtext');

    richtextDivs.forEach((div) => {
      const links = div.querySelectorAll('a');
      links.forEach((link) => {
        link.setAttribute('target', '_blank');
      });
    });

    // Removing the last comma for the topics list
    const topicsCommas = document.querySelectorAll('[discover-element="topics-comma"]');
    if (topicsCommas) {
      topicsCommas[topicsCommas.length - 1].remove();
    }
  };

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

      fetch(`https://discover-plus-server.herokuapp.com/api/v1/user/11`, requestOptions)
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

  const showLikedOpportunity = () => {
    const likedOpportunities = localStorage.getItem('likedOpportunities');
    const likeWrap = document.querySelector('[discover-element="like-wrap"]');
    const airtableId = document.querySelector('[discover-element="airtable-id"]').innerHTML;
    const likedIcon = document.querySelector('[discover-element="liked-icon"]');

    if (likedOpportunities.includes(airtableId)) {
      likedIcon.style.color = '#E12122';
    }

    likeWrap?.addEventListener('click', () => {
      likeOpportunityUpdate(airtableId, likedIcon);
    });
  };

  // check if member is logged in
  const memberstack = window.$memberstackDom;
  memberstack.getCurrentMember().then(({ data: member }) => {
    if (member) {
      // If member logged in
      showLikedOpportunity();
      sectionOppMain.style.display = 'block';
    } else {
      // Logic to limit profile views
      /*
      const profileVisits = localStorage.getItem('profileVisits');

      if (!profileVisits) {
        localStorage.setItem('profileVisits', 1);
        sectionOppMain.style.display = 'block';
      } else {
        localStorage.setItem('profileVisits', parseInt(profileVisits) + 1);
        sectionOppMain.style.display = 'block';
      }

      if (profileVisits > 3) {
        sectionLimit.style.display = 'block';
        document.body.style.overflow = 'hidden';
        const oppMain = sectionOppMain.querySelector('.op_main_content');
        const mainChildren = oppMain.children;

        for (let i = 1; i < mainChildren.length; i++) {
          mainChildren[i].style.display = 'none';
        }

        const oppSidebar = sectionOppMain.querySelector('.op_main_sidebar');
        const sidebarChildren = oppSidebar.children;

        for (let i = 1; i < sidebarChildren.length; i++) {
          sidebarChildren[i].style.display = 'none';
        }

        $(limitForm).submit(function () {
          localStorage.setItem('limitEmail', limitEmail.value);
          location.href = '/sign-up';

          return false;
        });
      }
      */
    }
  });

  // Adding logic to restore filters on homepage

  allOpportunitiesLink.addEventListener('click', (e) => {
    e.preventDefault();
    const queryParam = localStorage.getItem('queryParam');
    if (queryParam) {
      window.location.href = allOpportunitiesLink.href + queryParam;
    } else {
      window.location.href = allOpportunitiesLink.href;
    }
  });

  if (expertFormUrl) {
    expertFormUrl.value = window.location.href;
  }
  if (infoFormUrl) {
    infoFormUrl.value = window.location.href;
  }
  if (claimFormUrl) {
    claimFormUrl.value = window.location.href;
  }

  formatFields();
});
