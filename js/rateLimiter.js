const MAX_TIMESTAMPS = 10;  // Maximum timestamps to store
const COOLDOWN_SECONDS = 10;  // Cooldown duration after the last timestamp
const FETCH_INTERVAL_SECONDS = 20;  // Minimum interval for fetch requests

// module.exports = { MAX_TIMESTAMPS };  // Export MAX_TIMESTAMPS

function updateTimestamps() {
    let timestamps = JSON.parse(localStorage.getItem('weatherFetchTimestamps')) || [];
    const now = Date.now();

    timestamps.push(now);  // Add the latest timestamp
    if (timestamps.length > MAX_TIMESTAMPS) {
        timestamps.shift();  // Remove the oldest timestamp if over limit
    }
    
    localStorage.setItem('weatherFetchTimestamps', JSON.stringify(timestamps));
}

function isRateLimited() {
    const timestamps = JSON.parse(localStorage.getItem('weatherFetchTimestamps')) || [];
    const cooldownEnd = localStorage.getItem('cooldownEnd'); // Retrieve cooldown end time
    const now = Date.now();

    // Check if the app is in an active cooldown
    if (cooldownEnd && now < parseInt(cooldownEnd, 10)) {
        const remainingSeconds = Math.ceil((parseInt(cooldownEnd, 10) - now) / 1000);
        showCooldownMessage(remainingSeconds);
        return true; // Block fetch due to active cooldown
    }

    // Filter timestamps to keep only those within the fetch interval
    const validTimestamps = timestamps.filter((timestamp) => (now - timestamp) / 1000 <= FETCH_INTERVAL_SECONDS);

    if (validTimestamps.length >= MAX_TIMESTAMPS) {
        // Trigger cooldown and save end time
        const cooldownEndTime = now + COOLDOWN_SECONDS * 1000;
        localStorage.setItem('cooldownEnd', cooldownEndTime); // Save cooldown end time
        showCooldownMessage(COOLDOWN_SECONDS);
        localStorage.setItem('weatherFetchTimestamps', JSON.stringify([])); // Clear timestamps
        return true; // Block fetch
    }

    localStorage.setItem('weatherFetchTimestamps', JSON.stringify(validTimestamps)); // Save filtered timestamps
    return false; // Allow fetch
}



function showCooldownMessage(seconds) {
    const messageElement = document.getElementById('cooldown-message');
    messageElement.textContent = `Too many requests. Please wait ${seconds} seconds.`;
    const interval = setInterval(() => {
        seconds--;
        if (seconds <= 0) {
            clearInterval(interval);
            messageElement.textContent = '';  // Clear message
        } else {
            messageElement.textContent = `Too many requests. Please wait ${seconds} seconds.`;
        }
    }, 1000);
}

export { MAX_TIMESTAMPS,updateTimestamps, isRateLimited };
