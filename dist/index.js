"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3002"}/esbuild`).addEventListener("change", () => location.reload());

  // src/index.js
  window.fsAttributes = window.fsAttributes || [];
  window.fsAttributes.push([
    "cmsfilter",
    async (filtersInstances) => {
      const [filtersInstance] = filtersInstances;
      const { listInstance } = filtersInstance;
      const [firstItem] = listInstance.items;
      const oppTemplateElement = firstItem.element;
      const opportunities = await fetchOpportunities();
      console.log("opportunities", opportunities);
      listInstance.clearItems();
      const newOpportunities = opportunities.map(
        (eachOpp) => createItem(eachOpp, oppTemplateElement)
      );
      await listInstance.addItems(newOpportunities);
      moveFields();
      const clearFiltersLink = document.querySelector('[discover-element="clear-filters"]');
      clearFiltersLink.addEventListener("click", () => {
        const tagCloseLinks = document.querySelectorAll('[fs-cmsfilter-element="tag-remove"]');
        tagCloseLinks.forEach((eachTagClose) => {
          eachTagClose.click();
        });
      });
      filtersInstance.storeFiltersData();
    }
  ]);
  var fetchOpportunities = async () => {
    try {
      const response = await fetch("https://discover-plus-server.herokuapp.com/api/v1/opportunities");
      const data = await response.json();
      return data.allOpportunities;
    } catch (error) {
      console.log(error);
      return [];
    }
  };
  var createItem = (eachOpp, templateElement) => {
    const newItem = templateElement.cloneNode(true);
    const itemWrap = newItem.querySelector('[discover-element="item-wrap"]');
    const image = newItem.querySelector('[discover-element="item-image"]');
    const fieldCategory = newItem.querySelector('[discover-element="item-field-category"]');
    const name = newItem.querySelector('[discover-element="item-name"]');
    const locationType = newItem.querySelector('[discover-element="location-type"]');
    const amountValues = newItem.querySelector('[discover-element="amount-values"]');
    const gradeValues = newItem.querySelector('[discover-element="grade-values"]');
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
    itemWrap.href = `opportunity/${eachOpp.slug}`;
    itemWrap.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.setItem("queryParam", `${window.location.search}`);
      window.location.href = itemWrap.href;
    });
    if (image && eachOpp.organizationImageUrl) {
      image.src = eachOpp.organizationImageUrl;
      image.classList.remove("w-dyn-bind-empty");
      image.parentElement.classList.remove("w-condition-invisible");
    }
    if (name) {
      name.textContent = eachOpp.name;
    }
    if (fieldCategory && eachOpp.fieldCategories) {
      eachOpp.fieldCategories.split(", ").sort().forEach((eachFieldCategory) => {
        const newFieldCategory = fieldCategory.cloneNode(true);
        newFieldCategory.textContent = eachFieldCategory.trim();
        fieldCategory.parentElement.append(newFieldCategory);
      });
      fieldCategory.style.display = "none";
    } else if (fieldCategory) {
      fieldCategory.parentElement.style.display = "none";
    }
    if (locationType && eachOpp.remoteInperson) {
      locationType.textContent = eachOpp.remoteInperson;
    } else if (locationType) {
      locationType.parentElement.style.display = "none";
    }
    if (amountValues && eachOpp.amount) {
      amountValues.textContent = eachOpp.amount;
    } else if (amountValues) {
      amountValues.parentElement.style.display = "none";
    }
    if (gradeValues && eachOpp.gradeLevelValues) {
      gradeValues.textContent = eachOpp.gradeLevelValues;
    } else if (gradeValues) {
      gradeValues.parentElement.style.display = "none";
    }
    if (typeFilter && eachOpp.types) {
      eachOpp.types.forEach((eachType) => {
        const newType = typeFilter.cloneNode(true);
        newType.textContent = eachType;
        typeFilter.parentElement.append(newType);
      });
      typeFilter.removeAttribute("fs-cmsfilter-field");
    }
    if (fieldCategoryFilter && eachOpp.fieldCategories) {
      eachOpp.fieldCategories.split(",").forEach((eachFieldCategory) => {
        const newFieldCategory = fieldCategoryFilter.cloneNode(true);
        newFieldCategory.textContent = eachFieldCategory.trim();
        fieldCategoryFilter.parentElement.append(newFieldCategory);
      });
      fieldCategoryFilter.removeAttribute("fs-cmsfilter-field");
    }
    if (fieldFilter && eachOpp.fields) {
      eachOpp.fields.forEach((eachField) => {
        const newField = fieldFilter.cloneNode(true);
        newField.textContent = eachField;
        fieldFilter.parentElement.append(newField);
      });
      fieldFilter.removeAttribute("fs-cmsfilter-field");
    }
    if (ageFilter && eachOpp.ageValues) {
      eachOpp.ageValues.split(",").forEach((eachAge) => {
        const newAge = ageFilter.cloneNode(true);
        newAge.textContent = eachAge.trim();
        ageFilter.parentElement.append(newAge);
      });
      ageFilter.removeAttribute("fs-cmsfilter-field");
    }
    if (gradeFilter && eachOpp.gradeLevelValues) {
      eachOpp.gradeLevelValues.split(",").forEach((eachGrade) => {
        const newGrade = gradeFilter.cloneNode(true);
        if (eachGrade.trim() === "Elementary School") {
          newGrade.textContent = -1;
        } else if (eachGrade.trim() === "Middle School") {
          newGrade.textContent = 0;
        } else if (eachGrade.trim() === "High School") {
          newGrade.textContent = 1;
        } else if (eachGrade.trim() === "Undergraduate") {
          newGrade.textContent = 13;
        } else if (eachGrade.trim() === "Graduate") {
          newGrade.textContent = 14;
        } else if (eachGrade.trim() === "Post-Graduate") {
          newGrade.textContent = 15;
        } else {
          newGrade.textContent = parseInt(eachGrade.trim().replace(/\D/g, ""));
        }
        gradeFilter.parentElement.append(newGrade);
      });
      gradeFilter.removeAttribute("fs-cmsfilter-field");
    }
    if (timetableFilter && eachOpp.timetable) {
      eachOpp.timetable.split(",").forEach((eachTimetable) => {
        const newTimetable = timetableFilter.cloneNode(true);
        newTimetable.textContent = eachTimetable.trim();
        timetableFilter.parentElement.append(newTimetable);
      });
      timetableFilter.removeAttribute("fs-cmsfilter-field");
    }
    if (locationTypeFilter && eachOpp.remoteInperson) {
      if (eachOpp.remoteInperson === "Remote & In-person") {
        const newLocationType = locationTypeFilter.cloneNode(true);
        newLocationType.textContent = "Remote";
        locationTypeFilter.parentElement.append(newLocationType);
        locationTypeFilter.textContent = "In-person";
      } else {
        locationTypeFilter.textContent = eachOpp.remoteInperson;
      }
    }
    if (locationCategoryFilter && eachOpp.locationCategory) {
      eachOpp.locationCategory.forEach((eachLocationCategory) => {
        const newLocationCategory = locationCategoryFilter.cloneNode(true);
        newLocationCategory.textContent = eachLocationCategory;
        locationCategoryFilter.parentElement.append(newLocationCategory);
      });
      locationCategoryFilter.removeAttribute("fs-cmsfilter-field");
    }
    if (locationFilter && eachOpp.location) {
      eachOpp.location.split(",").forEach((eachLocation) => {
        const newLocation = locationFilter.cloneNode(true);
        newLocation.textContent = eachLocation.trim();
        locationFilter.parentElement.append(newLocation);
      });
      locationFilter.removeAttribute("fs-cmsfilter-field");
    }
    if (deadlineFilter && eachOpp.applicationDeadline) {
      eachOpp.applicationDeadline.split(",").forEach((eachDeadline) => {
        const newDeadline = deadlineFilter.cloneNode(true);
        newDeadline.textContent = eachDeadline.trim();
        deadlineFilter.parentElement.append(newDeadline);
      });
      deadlineFilter.removeAttribute("fs-cmsfilter-field");
    }
    if (costFilter && eachOpp.amount) {
      eachOpp.amount.split(",").forEach((eachAmount) => {
        const newAmount = costFilter.cloneNode(true);
        newAmount.textContent = eachAmount.trim();
        costFilter.parentElement.append(newAmount);
      });
      costFilter.removeAttribute("fs-cmsfilter-field");
    }
    if (financialAidFilter)
      financialAidFilter.textContent = eachOpp.financialAid ? "Financial Aid" : "";
    return newItem;
  };
  var moveFields = () => {
    const fields = document.querySelectorAll('[discover-element="field-wrap"]');
    const fieldCategories = document.querySelectorAll('[discover-element="field-category-wrap"]');
    fieldCategories.forEach((eachFieldCategory) => {
      fields.forEach((eachField) => {
        if (eachFieldCategory.querySelector(".home_filters_checkbox-label").innerHTML === eachField.querySelector(".home_filters_field-category").innerHTML && eachFieldCategory.querySelector(".home_filters_checkbox-label").innerHTML !== eachField.querySelector(".home_filters_checkbox-label").innerHTML) {
          eachFieldCategory.querySelector(".home_filters_field-wrap").append(eachField);
        }
      });
    });
    const locations = document.querySelectorAll('[discover-element="location-wrap"]');
    const locationCategories = document.querySelectorAll(
      '[discover-element="location-category-wrap"]'
    );
    locationCategories.forEach((eachLocationCategory) => {
      locations.forEach((eachLocation) => {
        if (eachLocationCategory.querySelector(".home_filters_checkbox-label").innerHTML === eachLocation.querySelector(".home_filters_location-category").innerHTML && eachLocationCategory.querySelector(".home_filters_checkbox-label").innerHTML !== eachLocation.querySelector(".home_filters_checkbox-label").innerHTML) {
          eachLocationCategory.querySelector(".home_filters_location-wrap").append(eachLocation);
        }
      });
    });
    let scrollPosition;
    setInterval(() => {
      scrollPosition = $(window).scrollTop();
    }, 500);
    document.addEventListener("click", function(e) {
      if (e.target.type === "checkbox") {
        $(window).scrollTop(scrollPosition);
      }
    });
    console.log({ fields, fieldCategories });
  };
})();
//# sourceMappingURL=index.js.map
