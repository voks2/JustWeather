// apiConfig.js

export const openWeatherConfig = {
    apiKey: "7cfedd3863d854a6cdb9b50e4a5a818b", // OpenWeather API Key
    endpoints: {
      currentWeather: "https://api.openweathermap.org/data/2.5/weather",
      forecast: "https://api.openweathermap.org/data/2.5/forecast",
      geocoding: "https://api.openweathermap.org/geo/1.0/direct",
    },
  };
  
  export const hereApiConfig = {
    apiKey: "Qg6O7FoLIXDgeg4Qt21swNg-yCp1owgHrH7q2IMh1Po", // Replace with your HERE API Key
    endpoints: {
      autosuggest: "https://autocomplete.search.hereapi.com/v1/autocomplete",
    },
  };
  