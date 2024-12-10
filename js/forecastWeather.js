    import { locationState } from './locationState.js'; 
    import { openWeatherConfig } from './apiConfig.js';

    const forecastContainer = document.querySelector(".primary-forecast");
    const dateContainer = document.createElement("div");
    dateContainer.classList.add("date-container");
    forecastContainer.parentElement.insertBefore(dateContainer, forecastContainer);
  
    // Fetch and display forecast
    export async function fetchForecast() {
      const { lat, lon } = locationState; // Access lat and lon from shared state
      try {
        const response = await fetch(
          `${openWeatherConfig.endpoints.forecast}?lat=${lat}&lon=${lon}&appid=${openWeatherConfig.apiKey}&units=metric`
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
          <p class="forecast-max">${summary.maxTemp}°C</p>
          <p class="forecast-min">${summary.minTemp}°C</p>
          <p class="summary">Condition: ${summary.weather}</p>
          <p class="summary">Precipitation: ${summary.maxPop}%</p>
        `;
        forecastContainer.appendChild(dayBox);
      });
    }
  
    // Format timestamp into "Tue 23"
    function formatDate(timestamp) {
      const options = { weekday: "long", day: "numeric" }; // "long" for full weekday name
    const formattedDate = new Date(timestamp * 1000).toLocaleDateString("en-US", options);
    
    // Add a comma between the weekday and the day
    const [weekday, day] = formattedDate.split(" ");
    return `${weekday} ${day}`;
    }
  
    // Initial forecast data fetch
    // fetchForecast();