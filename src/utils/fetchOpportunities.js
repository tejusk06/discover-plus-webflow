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
      const ageInMilliseconds = Date.now() - cachedTimestamp;
      const ageInHours = ageInMilliseconds / (1000 * 60 * 60);

      if (ageInHours < 1) {
        return JSON.parse(cachedData);
      }
    }

    const response = await fetch('https://discover-plus-server.herokuapp.com/api/v1/opportunities');
    const data = await response.json();

    localStorage.setItem('cached_opportunities', JSON.stringify(data.allOpportunities));
    localStorage.setItem('cached_opportunities_timestamp', Date.now());

    return data.allOpportunities;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export default fetchOpportunities;
