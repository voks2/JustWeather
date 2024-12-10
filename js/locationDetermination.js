import { updateLocation } from './locationState.js';
import { openWeatherConfig } from './apiConfig.js';



// Fetch Lat/Lon based on city and country code
export async function getLatLon(city, countryCode) {
  // Fallback to localStorage if city and countryCode are not provided
  if (!city || !countryCode) {
    city = localStorage.getItem('selectedCity');
    countryCode = localStorage.getItem('selectedCountryCode');
  }

  if (!city || !countryCode) {
    console.error("City or country code is missing!");
    return null;
  }

  // const API_KEY = "7cfedd3863d854a6cdb9b50e4a5a818b"; // Replace with your API key
  const url = `${openWeatherConfig.endpoints.geocoding}?q=${encodeURIComponent(city)},${countryCode}&limit=1&appid=${openWeatherConfig.apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.length > 0) {
      const { lat, lon } = data[0];
      updateLocation(lat, lon, false); // Update shared state
      return { lat, lon };
    } else {
      console.error("No geolocation data found!");
    }
  } catch (error) {
    console.error("Error fetching geolocation data:", error);
  }

  return null;
}
