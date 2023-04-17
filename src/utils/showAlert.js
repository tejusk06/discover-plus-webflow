const showAlert = (alertText) => {
  const sectionAlert = document.querySelector('[discover-element="section-alert"]');
  const alertTextElement = document.querySelector('[discover-element="alert-text"]');

  alertTextElement.innerHTML = alertText;
  sectionAlert.style.display = 'flex';
};

export default showAlert;
