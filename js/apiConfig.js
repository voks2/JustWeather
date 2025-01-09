export const openWeatherConfig = {
  apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY,  // Vite provides access to these variables
  endpoints: {
    currentWeather: "https://api.openweathermap.org/data/2.5/weather",
    forecast: "https://api.openweathermap.org/data/2.5/forecast",
    geocoding: "https://api.openweathermap.org/geo/1.0/direct",
  },
};

export const hereApiConfig = {
  apiKey: import.meta.env.VITE_HERE_API_KEY,
  endpoints: {
    autosuggest: "https://autocomplete.search.hereapi.com/v1/autocomplete",
  },
};
