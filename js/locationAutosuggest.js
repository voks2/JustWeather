import { openWeatherConfig } from './apiConfig.js';

let debounceTimer;
const debounce = (func, delay) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(func, delay);
};

const fetchSuggestions = async (query) => {
  const url = `${openWeatherConfig.endpoints.geocoding}?q=${encodeURIComponent(query)}&limit=5&appid=${openWeatherConfig.apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error fetching data');
    return await response.json();
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
};

const renderSuggestions = (inputField, suggestionsList, suggestions) => {
  suggestionsList.innerHTML = '';
  let currentIndex = -1;

  suggestions.forEach((item) => {
    const city = item.name;
    const countryCode = item.country;
    const state = item.state ? `, ${item.state}` : '';

    const listItem = document.createElement('li');
    listItem.textContent = `${city}${state}, ${countryCode}`;
    listItem.setAttribute('data-city', city);
    listItem.setAttribute('data-countryCode', countryCode);

    listItem.addEventListener('click', () => {
      inputField.value = '';
      suggestionsList.innerHTML = '';
      localStorage.setItem('selectedCity', city);
      localStorage.setItem('selectedCountryCode', countryCode);
    });

    listItem.addEventListener('mouseover', () => listItem.classList.add('highlight'));
    listItem.addEventListener('mouseout', () => listItem.classList.remove('highlight'));

    suggestionsList.appendChild(listItem);
  });

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
      if (currentIndex > -1) items[currentIndex].click();
    }
  });

  document.addEventListener('click', (e) => {
    if (!inputField.contains(e.target) && !suggestionsList.contains(e.target)) {
      if (!suggestionsList.querySelector('.highlight')) {
        inputField.value = '';
      }
      suggestionsList.innerHTML = '';
    }
  });
};

const updateHighlight = (items, index) => {
  items.forEach((item, i) => item.classList.toggle('highlight', i === index));
};

export function initAutosuggest() {
  const inputField = document.getElementById('cityInput');
  const suggestionsList = document.getElementById('suggestions');

  inputField.addEventListener('focus', () => {
    renderSuggestions(inputField, suggestionsList, []);
  });

  inputField.addEventListener('input', () => {
    const query = inputField.value.trim();
    if (query.length < 2) {
      suggestionsList.innerHTML = '';
      return;
    }
    debounce(async () => {
      const suggestions = await fetchSuggestions(query);
      renderSuggestions(inputField, suggestionsList, suggestions);
    }, 300);
  });
}
