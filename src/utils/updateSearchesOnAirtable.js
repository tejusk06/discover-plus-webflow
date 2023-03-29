// Function to updates searches on Airtable
const updateSearchesOnAirtable = (updatedSearchesString) => {
  const userAirtableId = localStorage.getItem('airtableId');
  var myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  var raw = JSON.stringify({
    event: 'searches.updated',
    id: userAirtableId,
    payload: updatedSearchesString,
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

export default updateSearchesOnAirtable;
