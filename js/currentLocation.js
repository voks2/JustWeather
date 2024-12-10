import { updateLocation } from './locationState.js';
import { fetchWeather } from './currentWeather.js';
import { fetchForecast } from './forecastWeather.js';

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
        // TEST Trigger weather and forecast fetching
        fetchWeather();
        fetchForecast();
    } catch (error) {
        console.error('Error fetching current location:', error);
    }
}
