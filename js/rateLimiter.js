const MAX_TIMESTAMPS = 5;  // Maximum timestamps to store
const COOLDOWN_SECONDS = 10;  // Cooldown duration after the last timestamp
const FETCH_INTERVAL_SECONDS = 10;  // Minimum interval for fetch requests

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
    if (timestamps.length < MAX_TIMESTAMPS) {
        return false;  // Not enough timestamps to apply rate limiting
    }
    
    const oldest = timestamps[0];
    const newest = timestamps[timestamps.length - 1];
    const timeDiffSeconds = (newest - oldest) / 1000;

    if (timeDiffSeconds < FETCH_INTERVAL_SECONDS) {
        const cooldownRemaining = COOLDOWN_SECONDS - (Date.now() - newest) / 1000;
        if (cooldownRemaining > 0) {
            showCooldownMessage(Math.ceil(cooldownRemaining));
            return true;  // Cooldown is active
        }
    }
    return false;  // No cooldown; allow fetching
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

export { updateTimestamps, isRateLimited };
