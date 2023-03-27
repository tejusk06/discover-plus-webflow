// Webflow already globally defined in custom code
Webflow.push(function () {
  // DOMready has fired

  // check if member is logged in
  const memberstack = window.$memberstackDom;
  memberstack.getCurrentMember().then(({ data: member }) => {
    if (member) {
      console.log('local');
      console.log('local');
      // logged in logic here

      const localImageFile = localStorage.getItem('imageFile');
      const localImageURL = localStorage.getItem('imageUrl');

      // Update the Profile Image

      if (localImageURL && localImageFile) {
        document.querySelector('[discover-element="profile-image"]').src = localImageFile;
      }

      // Open the tab based on param
      const currentUrl = window.location.href;
      const urlParams = new URLSearchParams(new URL(currentUrl).search);

      if (urlParams.has('tab')) {
        const tabValue = urlParams.get('tab');
        document.querySelector(`[data-w-tab="${tabValue}"]`).click();
      }

      // Get passwords and buttons
      const updateButton = document.querySelector('[discover-element="update-password"]');
      const submitButton = document.querySelector('[discover-element="submit-password"]');
      const passwordError = document.querySelector('.profile_header_form-error');
      const passwordInput = document.querySelector('[discover-element="new-password"]');
      const passwordInput2 = document.querySelector('[discover-element="new-password2"]');

      // CHeck is passwords match
      updateButton.addEventListener('click', () => {
        if (passwordInput.value === passwordInput2.value) {
          // Hide error and click submit if passwords match
          passwordError.style.display = 'none';
          submitButton.click();
        } else {
          // Show error message if passwords don't match
          passwordError.style.display = 'block';
        }
      });

      // Update the Types and Fields from local storage
      const userTypes = localStorage.getItem('types');
      let typesArray = userTypes?.split(',');
      const userFields = localStorage.getItem('fields');
      let fieldsArray = userFields?.split(',');
      const allTypes = document.querySelectorAll('[discover-element="type-embed"]');
      const allFields = document.querySelectorAll('[discover-element="field-embed"]');
      const typeTemplate = document.querySelector('[discover-element="type-template"]');
      const fieldTemplate = document.querySelector('[discover-element="field-template"]');

      const updateTypesOnPage = (source) => {
        typeTemplate.style.display = 'flex';
        const { parentElement } = typeTemplate;
        const { children } = parentElement;

        // iterate over all types except first one and remove them
        for (let i = children.length - 1; i > 0; i--) {
          // remove the current type
          parentElement.removeChild(children[i]);
        }

        allTypes.forEach((eachType) => {
          const typeRecord = eachType.querySelector('.profile_header_interests-id').innerHTML;

          if (typesArray?.includes(typeRecord)) {
            // Checking the type by clicking on it
            if (source === 'localStorage') {
              eachType.getElementsByTagName('input')[0].click();
            }
            // Getting the type text
            const typeText = eachType.querySelector('.profile_header_tabs-interest').innerHTML;

            // Creating the new template for the type and appending it
            const newTypeTemplate = typeTemplate.cloneNode(true);
            newTypeTemplate.innerHTML = typeText;
            typeTemplate.parentElement.append(newTypeTemplate);
          }
        });
        typeTemplate.style.display = 'none';
      };

      const updateFieldsOnPage = (source) => {
        fieldTemplate.style.display = 'flex';

        const { parentElement } = fieldTemplate;
        const { children } = parentElement;

        // iterate over all fields except first one and remove them
        for (let i = children.length - 1; i > 0; i--) {
          // remove the current type
          parentElement.removeChild(children[i]);
        }

        allFields.forEach((eachField) => {
          const fieldRecord = eachField.querySelector('.profile_header_interests-id').innerHTML;

          if (fieldsArray?.includes(fieldRecord)) {
            if (source === 'localStorage') {
              eachField.getElementsByTagName('input')[0].click();
            }
            //   eachField.getElementsByTagName("input")[0].checked = true;
            const fieldText = eachField.querySelector('.profile_header_tabs-interest').innerHTML;
            const newFieldTemplate = fieldTemplate.cloneNode(true);
            newFieldTemplate.innerHTML = fieldText;
            fieldTemplate.parentElement.append(newFieldTemplate);
          }
        });

        fieldTemplate.style.display = 'none';
      };

      updateTypesOnPage('localStorage');
      updateFieldsOnPage('localStorage');

      // Logic to update the Member types and fields
      const fieldsForm = document.querySelector('[d-e="types-form"]');
      const typesForm = document.querySelector('[d-e="fields-form"]');
      const typesButton = document.querySelector('[d-e="update-types"]');
      const fieldsButton = document.querySelector('[d-e="update-fields"]');

      // API to update user interests
      const updateUserInAirtable = (event, payload) => {
        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');

        const airtableId = localStorage.getItem('airtableId');

        var raw = JSON.stringify({
          event: event,
          payload: payload,
          id: airtableId,
        });

        var requestOptions = {
          method: 'PUT',
          headers: myHeaders,
          body: raw,
          redirect: 'follow',
        };

        fetch(`https://discover-plus-server.herokuapp.com/api/v1/user/${member.id}`, requestOptions)
          .then((response) => response.text())
          .then((result) => {
            if (event === 'types.updated') {
              updateTypesOnPage('api');
              localStorage.setItem('types', typesArray.join(','));
              document.querySelector('[discover-element="add-remove-types"]')?.click();
            } else if (event === 'fields.updated') {
              updateFieldsOnPage('api');
              localStorage.setItem('fields', fieldsArray.join(','));
              document.querySelector('[discover-element="add-remove-fields"]')?.click();
            }
            console.log(result);
          })
          .catch((error) => console.log('error', error));
      };

      typesButton.addEventListener('click', (e) => {
        typesArray = [];
        allTypes.forEach((eachType) => {
          const typeRecord = eachType.querySelector('.profile_header_interests-id').innerHTML;
          const typeCheck = eachType.querySelector('[d-e="checkbox"]');
          let typeChecked = false;
          if (typeCheck.classList.contains('w--redirected-checked')) {
            typeChecked = true;
            typesArray.push(typeRecord);
          }
        });

        updateUserInAirtable('types.updated', typesArray);
      });

      fieldsButton.addEventListener('click', (e) => {
        fieldsArray = [];
        allFields.forEach((eachField) => {
          const fieldRecord = eachField.querySelector('.profile_header_interests-id').innerHTML;
          const fieldCheck = eachField.querySelector('[d-e="checkbox"]');
          let fieldChecked = false;
          if (fieldCheck.classList.contains('w--redirected-checked')) {
            fieldChecked = true;
            fieldsArray.push(fieldRecord);
          }
        });

        updateUserInAirtable('fields.updated', fieldsArray);
      });

      // Manage user image upload
      const form = document.getElementById('image-form');
      const imageInput = document.querySelector('#image-input');

      imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];

        if (file.size > 1 * 1024 * 1024) {
          console.error('File size exceeds 1MB limit');
          document.querySelector('.profile_header_image-message').innerHTML =
            'File size sould be less than 1mb';
          document.querySelector('.profile_header_image-message').style.display = 'block';
          return;
        }
        document.querySelector('.profile_header_image-message').style.display = 'none';

        document.querySelector('#profile_header_image-button').style.display = 'block';

        // Do something with the file
      });

      const fetchAndStoreImage = async (url) => {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const reader = new FileReader();

          reader.onloadend = function () {
            const base64data = reader.result;
            localStorage.setItem('imageFile', base64data);
            localStorage.setItem('imageUrl', url);
            document.querySelector('[discover-element="navbar-image"]').src = base64data;
            document.querySelector('[discover-element="profile-image"]').src = base64data;
          };

          reader.readAsDataURL(blob);
        } catch (error) {
          console.error('Error fetching and storing image:', error);
        }
      };

      form.addEventListener('submit', async function (event) {
        event.preventDefault();

        document.querySelector('.profile_header_image-message').innerHTML = 'Uploading Image';
        document.querySelector('.profile_header_image-message').style.display = 'block';

        const airtableId = localStorage.getItem('airtableId');
        const imageInput = document.querySelector('#image-input');

        if (imageInput.files[0].size > 1 * 1024 * 1024) {
          console.error('File size exceeds 1MB limit');
          return;
        }

        const formData = new FormData(form);
        formData.append('id', `${airtableId}`);
        const response = await fetch(
          `https://discover-plus-server.herokuapp.com/api/v1/user/${member.id}`,
          {
            method: 'PUT',
            body: formData,
            event: 'image.updated',
          }
        );

        if (response.ok) {
          const jsonResponse = await response.json();
          console.log('Image uploaded successfully', jsonResponse);
          fetchAndStoreImage(jsonResponse.imageUrl);
          document.querySelector('.profile_header_image-message').style.display = 'none';
        } else {
          document.querySelector('.profile_header_image-message').innerHTML = 'Error';
          console.error('Error uploading image:', response.status, response.statusText);
        }
      });
    } else {
      //  logged out logic here
    }
  });
});
// });
