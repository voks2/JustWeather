

// ---------------------------------- WEATHER INFO PICKEDUP FOR FIXED LOCATION


    const API_URL = "https://api.openweathermap.org/data/2.5/weather";
    const FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast";
    const LAT = 44.8125;
    const LON = 20.4612;
    /* lon
    const LAT = 51.5072;
    const LON = 0.1276;
    */
    const API_KEY = "7cfedd3863d854a6cdb9b50e4a5a818b";
    
    const mainBox = document.querySelector('.main-box');
  
    // Function to fetch weather data
    export async function fetchWeather() {
      try {
        const response = await fetch(`${API_URL}?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        displayWeather(data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        mainBox.innerHTML = `<p class="error">Unable to load weather data</p>`;
      }
    }
    // Function to display weather data
    function displayWeather(weather) {
      const { main, weather: weatherDetails, wind, clouds, name, rain } = weather;
    
      // Extract required data
      const temperature = Math.round(main.temp);
      const tempMax = Math.round(main.temp_max);
      const tempMin = Math.round(main.temp_min);
      const weatherMain = weatherDetails[0].main;
      const weatherDescription = weatherDetails[0].description; // Detailed weather description
      const weatherIcon = weatherDetails[0].icon; // Weather icon code
      const humidity = main.humidity;
      const pressure = main.pressure;
      const windSpeed = wind.speed;
      const cloudCoverage = clouds.all; // Cloud coverage percentage
      const rainInfo = rain ? `Rainfall (last hour): ${rain["1h"]} mm` : ""; // Check if rain exists
    
      // Build the icon URL
      const iconUrl = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
    
      // Update the DOM
      mainBox.innerHTML = `
        <h2>${name}</h2>
        <p class="temperature">${temperature}°C</p>
        <p>Max Temp: ${tempMax}°C</p>
        <p>Min Temp: ${tempMin}°C</p>
        <p>Condition: ${weatherMain} (${weatherDescription})</p>
        <img src="${iconUrl}" alt="${weatherDescription}" class="weather-icon">
        <p>Humidity: ${humidity}%</p>
        <p>Pressure: ${pressure} hPa</p>
        <p>Wind Speed: ${windSpeed} m/s</p>
        <p>Cloud Coverage: ${cloudCoverage}%</p>
        ${rainInfo ? `<p>${rainInfo}</p>` : ""}
      `;
    }
    
  
    // Fetch and display the weather data
    fetchWeather();

    // Set up auto-refresh every 10 minutes (600,000 ms)
    setInterval(fetchWeather, 600000);



// -----------------------------------FORCAST FOR CURRENT CITY ------------------------------------ 


    const forecastContainer = document.querySelector(".primary-forecast");
    const dateContainer = document.createElement("div");
    dateContainer.classList.add("date-container");
    forecastContainer.parentElement.insertBefore(dateContainer, forecastContainer);
  
    // Fetch and display forecast
    export async function fetchForecast() {
      try {
        const response = await fetch(
          `${FORECAST_API_URL}?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        const dailySummaries = processForecast(data);
        displayForecast(dailySummaries);
      } catch (error) {
        console.error("Error fetching forecast data:", error);
        forecastContainer.innerHTML = `<p class="error">Unable to load forecast data</p>`;
      }
    }
  
    // Process forecast data into daily summaries
    function processForecast(data) {
      const forecastByDay = {};
  
      data.list.forEach((interval) => {
        const date = new Date(interval.dt * 1000).toISOString().split("T")[0];
        if (!forecastByDay[date]) {
          forecastByDay[date] = [];
        }
        forecastByDay[date].push(interval);
      });
  
      return Object.entries(forecastByDay).map(([date, intervals]) => {
        let minTemp = Infinity;
        let maxTemp = -Infinity;
        let maxPop = 0;
        const weatherCounts = {};
  
        intervals.forEach((interval) => {
          minTemp = Math.min(minTemp, interval.main.temp_min);
          maxTemp = Math.max(maxTemp, interval.main.temp_max);
          maxPop = Math.max(maxPop, interval.pop || 0);
  
          const weatherMain = interval.weather[0].main;
          weatherCounts[weatherMain] = (weatherCounts[weatherMain] || 0) + 1;
        });
  
        const dominantWeather = Object.keys(weatherCounts).reduce((a, b) =>
          weatherCounts[a] > weatherCounts[b] ? a : b
        );
  
        return {
          date: new Date(date).getTime() / 1000,
          minTemp: Math.round(minTemp),
          maxTemp: Math.round(maxTemp),
          maxPop: Math.round(maxPop * 100),
          weather: dominantWeather,
        };
      });
    }
  
    // Display forecast data
    function displayForecast(dailySummaries) {
      dateContainer.innerHTML = "";
      forecastContainer.innerHTML = "";
  
      dailySummaries.forEach((summary, index) => {
        const dateElement = document.createElement("div");
        dateElement.classList.add("date-item");
        dateElement.textContent = formatDate(summary.date);
        dateContainer.appendChild(dateElement);
  
        const dayBox = document.createElement("div");
        dayBox.classList.add("forecast-day");
        dayBox.innerHTML = `
          <p>Max Temp: ${summary.maxTemp}°C</p>
          <p>Min Temp: ${summary.minTemp}°C</p>
          <p>Condition: ${summary.weather}</p>
          <p>Precipitation: ${summary.maxPop}%</p>
        `;
        forecastContainer.appendChild(dayBox);
      });
    }
  
    // Format timestamp into "Tue 23"
    function formatDate(timestamp) {
      const options = { weekday: "short", day: "numeric" };
      return new Date(timestamp * 1000).toLocaleDateString("en-US", options);
    }
  
    // Initial forecast data fetch
    fetchForecast();





  // --------------------------- LOCATION INPUT AUTOCOMPLETE --------------------------------

const inputField = document.getElementById('cityInput');
const suggestionsList = document.getElementById('suggestions');
const apiKey = 'Qg6O7FoLIXDgeg4Qt21swNg-yCp1owgHrH7q2IMh1Po'; // Replace with your HERE API key

// Debounce function to limit API calls
let debounceTimer;
const debounce = (func, delay) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(func, delay);
};

// Function to fetch autocomplete suggestions
const fetchSuggestions = async (query) => {
  const url = `https://autocomplete.search.hereapi.com/v1/autocomplete?q=${encodeURIComponent(query)}&type=city&limit=10&apiKey=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error fetching data');
    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Function to render suggestions
const renderSuggestions = (suggestions) => {
  suggestionsList.innerHTML = ''; // Clear previous suggestions
  suggestions
    .filter((item) => item.address.city || item.address.district) // Filter out entries without a city or district
    .forEach((item) => {
      const city = item.address.city || item.address.district || '';
      const country = item.address.countryName || '';
      if (city && !city.startsWith(',')) { // Exclude items that only have a comma
        const listItem = document.createElement('li');
        listItem.textContent = `${city}, ${country}`;
        listItem.addEventListener('click', () => {
          inputField.value = `${city}, ${country}`; // Update input field
          suggestionsList.innerHTML = ''; // Clear suggestions
        });
        suggestionsList.appendChild(listItem);
      }
    });
};

// Input event listener for fetching suggestions
inputField.addEventListener('input', () => {
  const query = inputField.value.trim();
  if (query.length < 2) {
    suggestionsList.innerHTML = ''; // Clear if input is too short
    return;
  }
  debounce(async () => {
    const suggestions = await fetchSuggestions(query);
    renderSuggestions(suggestions);
  }, 300); // 300ms debounce delay
});



/*
//

*/