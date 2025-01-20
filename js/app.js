import { fetchWeather } from './currentWeather.js';
import { fetchForecast } from './forecastWeather.js';
import { initAutosuggest } from './locationAutosuggest.js';
import { updateLocation, locationState } from './locationState.js';
import { getLatLon } from './locationDetermination.js';
import { handleLocationPermission } from './currentLocation.js';
import { isRateLimited } from './rateLimiter.js'; // Import rate limiter function
import { updateTimestamps } from './rateLimiter.js'; // Import rate limiter function

// Initialize the app on DOM load
document.addEventListener("DOMContentLoaded", () => {
    initAutosuggest(); // Initialize location suggestions
    initializeApp(); // Load weather data for saved or default location

    // Handle location changes from the suggestions dropdown
    document.getElementById('suggestions').addEventListener('click', handleLocationChange);

    // Start automatic refresh for weather updates
    startAutoRefresh();
});

// Initialize the app with saved or default location
async function initializeApp() {
    try {
        const useCurrentLocation = localStorage.getItem('useCurrentLocation') === 'true';
        if (useCurrentLocation) {
            console.log("Using current location as per user preference.");
            await handleLocationPermission();
        } else {
            const { city, countryCode } = getSavedLocation();
            if (city && countryCode) {
                console.log(`Using saved location: ${city}, ${countryCode}`);
                await fetchAndRenderWeather(city, countryCode);
            } else {
                console.warn("No saved location found. Please select a location.");
            }
        }
    } catch (error) {
        console.error("Error initializing app:", error);
    }
}

// Handle new location selection
async function handleLocationChange(event) {
    try {
        const target = event.target;
        if (target.id === 'current-location-item') {
            await handleLocationPermission();
            return;
        }
        const { city, countryCode } = getSavedLocation();
        if (city && countryCode) {
            localStorage.setItem('useCurrentLocation', 'false');
            console.log(`Manual location selected: ${city}, ${countryCode}`);
            await fetchAndRenderWeather(city, countryCode);
        } else {
            console.error("Invalid location selection.");
        }
    } catch (error) {
        console.error("Error handling location change:", error);
    }
}

// Fetch and render weather/forecast for a given location
async function fetchAndRenderWeather(city, countryCode) {
    if (isRateLimited()) {
        console.log('Rate limit exceeded. Try again later.');
        return;
    }

    updateTimestamps();  // Record the timestamp once per user action

    const location = await getLatLon(city, countryCode);
    if (location) {
        updateLocation(location.lat, location.lon, false);
        await Promise.all([fetchWeather(), fetchForecast()]);  // Fetch both concurrently
    } else {
        console.error("Unable to determine latitude/longitude.");
    }
}

// Start auto-refresh for weather updates
function startAutoRefresh() {
    setInterval(() => {
        if (locationState.lat && locationState.lon) {
            if (!isRateLimited()) {
                fetchWeather();
                fetchForecast();
            } else {
                console.log('Skipping auto-refresh due to rate limiting.');
            }
        } else {
            console.warn("Location not set. Skipping auto-refresh.");
        }
    }, 600000); // 10 minutes
}

// Get saved location from localStorage
function getSavedLocation() {
    const city = localStorage.getItem('selectedCity');
    const countryCode = localStorage.getItem('selectedCountryCode');
    return { city, countryCode };
}
