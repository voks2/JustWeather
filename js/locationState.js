// locationState.js
export let locationState = {
    lat: null, // Latitude starts as null
    lon: null, // Longitude starts as null
    isCurrentLocation: false, // Flag to indicate if the location is the current device location
};

// Function to update the state
export function updateLocation(lat, lon, isCurrentLocation = false) {
    locationState.lat = lat;
    locationState.lon = lon;
    console.log("Location updated:", lat, lon);
    console.log("Location state updated:", locationState); // Debugging
    locationState.isCurrentLocation = isCurrentLocation; // Properly set the flag
    console.log("Location updated:", { lat, lon, isCurrentLocation });
}


    // Function to reset location state
    export function resetLocation() {
        locationState.lat = null;
        locationState.lon = null;
        locationState.isCurrentLocation = false;
        console.log("Location state reset.");
    }