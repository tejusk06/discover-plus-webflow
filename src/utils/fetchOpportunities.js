/**
 * Fetches opportunities from airtable
 * @returns An array of {@link opportunities}.
 */

const fetchOpportunities = async () => {
  try {
    const cachedData = localStorage.getItem('cached_opportunities');
    const cachedTimestamp = localStorage.getItem('cached_opportunities_timestamp');

    if (cachedData && cachedTimestamp) {
      // Check if the cached data is still valid (not older than 1 hour)

      const dateNow = Date.now();
      const ageInMilliseconds = dateNow - new Date(cachedTimestamp).getTime();
      const ageInSeconds = ageInMilliseconds / 1000;

      if (ageInSeconds < 1800) {
        return JSON.parse(cachedData);
      }
    }

    const response = await fetch('https://discover-plus-server.herokuapp.com/api/v1/opportunities');
    const data = await response.json();

    localStorage.setItem('cached_opportunities', JSON.stringify(data.allOpportunities));
    localStorage.setItem('cached_opportunities_timestamp', data.cacheTime);

    // console.log(data.allOpportunities);

    return data.allOpportunities;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export default fetchOpportunities;
