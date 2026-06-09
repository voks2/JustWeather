// locationState.js
export let locationState = {
    lat: null,
    lon: null,
    isCurrentLocation: false,
    displayName: null,
};

export function updateLocation(lat, lon, isCurrentLocation = false, displayName = null) {
    locationState.lat = lat;
    locationState.lon = lon;
    locationState.isCurrentLocation = isCurrentLocation;
    locationState.displayName = displayName;
}


    // Function to reset location state
    export function resetLocation() {
        locationState.lat = null;
        locationState.lon = null;
        locationState.isCurrentLocation = false;
        console.log("Location state reset.");
    }