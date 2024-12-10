import { hereApiConfig } from './apiConfig.js';
import { handleLocationPermission } from './currentLocation.js';

// Debounce function to limit API calls
let debounceTimer;
const debounce = (func, delay) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(func, delay);
};

// Function to fetch autocomplete suggestions
const fetchSuggestions = async (query) => {
  const url = `${hereApiConfig.endpoints.autosuggest}?q=${encodeURIComponent(query)}&apikey=${hereApiConfig.apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error fetching data');
    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
};

// Function to render suggestions
const renderSuggestions = (inputField, suggestionsList, suggestions) => {
  suggestionsList.innerHTML = ''; // Clear previous suggestions
  let currentIndex = -1; // To track keyboard navigation

  // Add "Current Location" as the first item
  const currentLocationItem = document.createElement('li');
  currentLocationItem.textContent = 'Current Location';
  currentLocationItem.id = 'current-location-item'; // Assign a unique ID
  currentLocationItem.classList.add('current-location'); // Optional class for styling
  currentLocationItem.addEventListener('click', async () => {
    try {
      inputField.value = ''; // Clear input field
      await handleLocationPermission(); // Call the function to handle geolocation
      suggestionsList.innerHTML = ''; // Clear suggestions
    } catch (error) {
      console.error('Error handling current location:', error);
    }
  });
  suggestionsList.appendChild(currentLocationItem);

  // Add filtered suggestions to the list
  suggestions
    .filter((item) => item.address.city || item.address.district) // Filter out entries without a city or district
    .forEach((item, index) => {
      const city = item.address.city || item.address.district || '';
      const countryName = item.address.countryName || '';
      const countryCode = item.address.countryCode || ''; // Extract country code from HERE API

      if (city && !city.startsWith(',')) { // Exclude items that only have a comma
        const listItem = document.createElement('li');
        listItem.textContent = `${city}, ${countryName} (${countryCode})`;
        listItem.setAttribute('data-city', city);
        listItem.setAttribute('data-countryCode', countryCode);

        // Click event to select item
        listItem.addEventListener('click', () => {
          inputField.value = ''; // Clear input field
          suggestionsList.innerHTML = ''; // Clear suggestions
          localStorage.setItem('selectedCity', city); // Store city for other modules
          localStorage.setItem('selectedCountryCode', countryCode); // Store country code for geolocation
        });

        // Add hover effect for mouse interaction
        listItem.addEventListener('mouseover', () => {
          listItem.classList.add('highlight');
        });
        listItem.addEventListener('mouseout', () => {
          listItem.classList.remove('highlight');
        });

        suggestionsList.appendChild(listItem);
      }
    });

  // Event listener for keyboard navigation
  inputField.addEventListener('keydown', (e) => {
    const items = Array.from(suggestionsList.querySelectorAll('li'));

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      currentIndex = (currentIndex + 1) % items.length;
      updateHighlight(items, currentIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      currentIndex = (currentIndex - 1 + items.length) % items.length;
      updateHighlight(items, currentIndex);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentIndex > -1) {
        items[currentIndex].click(); // Trigger click on the selected item
      }
    }
  });

  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!inputField.contains(e.target) && !suggestionsList.contains(e.target)) {
      if (!suggestionsList.querySelector('.highlight')) {
        inputField.value = ''; // Clear input field if no selection is made
      }
      suggestionsList.innerHTML = ''; // Clear suggestions
    }
  });
};

// Helper function to update highlighted suggestion
const updateHighlight = (items, index) => {
  items.forEach((item, i) => {
    if (i === index) {
      item.classList.add('highlight');
    } else {
      item.classList.remove('highlight');
    }
  });
};

// Function to initialize the autocomplete feature
export function initAutosuggest() {
  const inputField = document.getElementById('cityInput');
  const suggestionsList = document.getElementById('suggestions');

  // Show "Current Location" item when input is focused
  inputField.addEventListener('focus', () => {
    renderSuggestions(inputField, suggestionsList, []);
  });

  inputField.addEventListener('input', () => {
    const query = inputField.value.trim();
    if (query.length < 2) {
      suggestionsList.innerHTML = ''; // Clear if input is too short
      return;
    }
    debounce(async () => {
      const suggestions = await fetchSuggestions(query);
      renderSuggestions(inputField, suggestionsList, suggestions);
    }, 300); // 300ms debounce delay
  });
}
