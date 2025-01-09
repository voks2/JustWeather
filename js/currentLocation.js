import { updateLocation } from './locationState.js';
import { fetchWeather } from './currentWeather.js';
import { fetchForecast } from './forecastWeather.js';


// call geolocation function with the "current location" button
const currentLocationItem = document.getElementById('current-location-item');
  currentLocationItem.addEventListener('click', async () => {
    try {  
      await handleLocationPermission(); // Call the function to handle geolocation
    } catch (error) {
      console.error('Error handling current location:', error);
    }
});


// Get current location using Geolocation API
export async function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject('Geolocation is not supported by this browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log("Geolocation position:", position);
                const { latitude: lat, longitude: lon } = position.coords;
                updateLocation(lat, lon, true); // Pass true for isCurrentLocation
                resolve({ lat, lon });
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        reject('User denied the request for Geolocation.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        reject('Location information is unavailable.');
                        break;
                    case error.TIMEOUT:
                        reject('The request to get user location timed out.');
                        break;
                    default:
                        reject('An unknown error occurred.');
                        break;
                }
            }
        );
    });
}

// MAIN FUNCTION to handle current location logic
export async function handleLocationPermission() {
    try {
        // Simply call getCurrentLocation; it already updates the location state
        const { lat, lon } = await getCurrentLocation(); 
        console.log('Location updated successfully:', { lat, lon });

        // Set useCurrentLocation flag in localStorage
        localStorage.setItem('useCurrentLocation', 'true');

        // Fetch weather and forecast for the current location
        fetchWeather();
        fetchForecast();
    } catch (error) {
        console.error('Error fetching current location:', error);
    }
}
