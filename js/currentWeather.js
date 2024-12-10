
    import { locationState } from './locationState.js'; 
    import { openWeatherConfig } from './apiConfig.js';

    const mainBox = document.querySelector('.main-box');
    const cityName = document.querySelector('.city-name');
    
    // Function to fetch weather data
    export async function fetchWeather() {  
        const { lat, lon } = locationState; // Access lat and lon from shared state
        /*
        if (!lat || !lon) {
            console.error("Latitude and Longitude are not set:", locationState);
            mainBox.innerHTML = `<p class="error">Location not set</p>`;
            return;
        }
        */
        try {
            const response = await fetch(`${openWeatherConfig.endpoints.currentWeather}?lat=${lat}&lon=${lon}&appid=${openWeatherConfig.apiKey}&units=metric`);
            const data = await response.json();
            console.log(data)
            displayWeather(data);
        } catch (error) {
            console.error("Error fetching weather data:", error);
            mainBox.innerHTML = `<p class="error">Unable to load weather data</p>`;
        }
        }


    // Function to display weather data
    function displayWeather(weather) {
        const { main, weather: weatherDetails, wind, clouds, name, rain } = weather;
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
        
        console.log("Rendering weather:", weather);
        // Build the icon URL
        // const iconUrl = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
        const iconUrl = `assets/weather-icons/${weatherIcon}.svg`;
        
        // Update the DOM
        cityName.innerHTML = `<span>${name}</span>`;

        mainBox.innerHTML = `
            <div class="main-section">
                <div class="inner-section inner-section-one">
                    <div class="weather-icon">    
                        <img src="${iconUrl}" alt="${weatherDescription}">
                    </div>    
                    <div class="temperature-section">
                        <p class="description">${weatherMain} <br>(${weatherDescription})</p>
                        <p class="temperature">${temperature}<span class="temp-main-indicator">°C</span></p>
                    </div>
                </div>
                <div class="inner-section inner-section-two">
                    <p><span class="desc">Max Temp:</span> <span class="val">${tempMax}°C</span></p>
                    <p><span class="desc">Min Temp:</span> <span class="val">${tempMin}°C</span></p>
                    ${rainInfo ? `<p><span class="desc">Rain:</span><span class="val">${rainInfo}</span></p>` : ""}
                </div>
                <div class="inner-section inner-section-three">
                    <p><span class="desc">Humidity:</span> <span class="val">${humidity}%</span></p>
                    <p><span class="desc">Pressure:</span> <span class="val">${pressure} hPa</span></p>
                    <p><span class="desc">Wind Speed:</span> <span class="val">${windSpeed} m/s</span></p>
                </div>
            </div>
        `;
    }

    // Select the date container
    const dateContainer = document.querySelector('.header-date-container');

    // Get the current date
    const currentDate = new Date();

    // Format the day of the week
    const optionsDay = { weekday: 'long' };
    const day = currentDate.toLocaleDateString('en-US', optionsDay);

    // Format the full date
    const optionsDate = { month: 'long', day: 'numeric', year: 'numeric' };
    const fullDate = currentDate.toLocaleDateString('en-US', optionsDate);

    // Insert the formatted date into the container
    dateContainer.innerHTML = `<div class="weekday">${day}</div><div class="fulldate">${fullDate}</div>`;