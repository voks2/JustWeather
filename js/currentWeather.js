
    import { locationState } from './locationState.js';
    import { openWeatherConfig } from './apiConfig.js';
    import { updateTimestamps, isRateLimited } from './rateLimiter.js';

    const mainBox = document.querySelector('.main-box');
    const cityName = document.querySelector('.city-name');

    function encodeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function getLocalTimeString(timezoneOffset) {
        const localDate = new Date(Date.now() + timezoneOffset * 1000);
        const h = String(localDate.getUTCHours()).padStart(2, '0');
        const m = String(localDate.getUTCMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    }

    let localTimeInterval = null;
    let cityNameEls = null;
    let weatherEls = null;

    function initCityNameStructure() {
        cityName.innerHTML = `
            <span class="city-name-text"></span>
            <span class="local-time"></span>
        `;
        return {
            text: cityName.querySelector('.city-name-text'),
            time: cityName.querySelector('.local-time'),
        };
    }

    function initWeatherStructure() {
        mainBox.innerHTML = `
            <div class="inner-section inner-section-one">
                <div class="weather-icon">
                    <img id="wx-icon" src="" alt="">
                </div>
                <div class="temperature-section">
                    <p class="description"><span id="wx-main"></span> <br>(<span id="wx-desc"></span>)</p>
                    <p class="temperature"><span id="wx-temp"></span><span class="temp-main-indicator">°C</span></p>
                </div>
            </div>
            <div class="inner-section inner-section-two">
                <p><span class="desc">Max Temp:</span> <span class="val" id="wx-max"></span></p>
                <p><span class="desc">Min Temp:</span> <span class="val" id="wx-min"></span></p>
                <p id="wx-rain-row" style="display:none"><span class="desc">Rain:</span> <span class="val" id="wx-rain-val"></span></p>
            </div>
            <div class="inner-section inner-section-three">
                <p><span class="desc">Humidity:</span> <span class="val" id="wx-humidity"></span></p>
                <p><span class="desc">Pressure:</span> <span class="val" id="wx-pressure"></span></p>
                <p><span class="desc">Wind Speed:</span> <span class="val" id="wx-wind"></span></p>
            </div>
        `;
        return {
            icon:     document.getElementById('wx-icon'),
            main:     document.getElementById('wx-main'),
            desc:     document.getElementById('wx-desc'),
            temp:     document.getElementById('wx-temp'),
            max:      document.getElementById('wx-max'),
            min:      document.getElementById('wx-min'),
            rainRow:  document.getElementById('wx-rain-row'),
            rainVal:  document.getElementById('wx-rain-val'),
            humidity: document.getElementById('wx-humidity'),
            pressure: document.getElementById('wx-pressure'),
            wind:     document.getElementById('wx-wind'),
        };
    }

    export async function fetchWeather() {
        if (isRateLimited()) {
            console.log('Fetch weather blocked due to rate limiting.');
            return;
        }

        const { lat, lon } = locationState;

        try {
            const response = await fetch(`${openWeatherConfig.endpoints.currentWeather}?lat=${lat}&lon=${lon}&appid=${openWeatherConfig.apiKey}&units=metric`);
            const data = await response.json();
            displayWeather(data);
        } catch (error) {
            console.error("Error fetching weather data:", error);
            weatherEls = null;
            mainBox.innerHTML = `<p class="error">Unable to load weather data</p>`;
        }
    }

    function displayWeather(weather) {
        const { main, weather: weatherDetails, wind, name, rain, timezone } = weather;
        const iconUrl = `assets/weather-icons/${encodeHTML(weatherDetails[0].icon)}.svg`;

        if (!cityNameEls) cityNameEls = initCityNameStructure();
        cityNameEls.text.textContent = locationState.displayName || name;

        if (localTimeInterval) clearInterval(localTimeInterval);
        const updateClock = () => {
            cityNameEls.time.textContent = `Local time: ${getLocalTimeString(timezone)}`;
        };
        updateClock();
        localTimeInterval = setInterval(updateClock, 1000);

        if (!weatherEls) weatherEls = initWeatherStructure();

        weatherEls.icon.src = iconUrl;
        weatherEls.icon.alt = weatherDetails[0].description;
        weatherEls.main.textContent = weatherDetails[0].main;
        weatherEls.desc.textContent = weatherDetails[0].description;
        weatherEls.temp.textContent = Math.round(main.temp);
        weatherEls.max.textContent = `${Math.round(main.temp_max)}°C`;
        weatherEls.min.textContent = `${Math.round(main.temp_min)}°C`;
        weatherEls.humidity.textContent = `${main.humidity}%`;
        weatherEls.pressure.textContent = `${main.pressure} hPa`;
        weatherEls.wind.textContent = `${wind.speed} m/s`;

        if (rain) {
            weatherEls.rainRow.style.display = '';
            weatherEls.rainVal.textContent = `Rainfall (last hour): ${rain["1h"]} mm`;
        } else {
            weatherEls.rainRow.style.display = 'none';
        }
    }

    // Select the date container
    const dateContainer = document.querySelector('.header-date-container');

    // Get the current date
    const currentDate = new Date();

    // Format the day of the week
    const optionsDay = { weekday: 'long' };
    const day = encodeHTML(currentDate.toLocaleDateString('en-US', optionsDay));

    // Format the full date
    const optionsDate = { month: 'long', day: 'numeric', year: 'numeric' };
    const fullDate = currentDate.toLocaleDateString('en-US', optionsDate);

    // Insert the formatted date into the container
    dateContainer.innerHTML = `<div class="weekday">${day}</div><div class="fulldate">${fullDate}</div>`;
