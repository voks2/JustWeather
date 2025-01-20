const { test, expect } = require('@playwright/test');
import { MAX_TIMESTAMPS } from '../js/rateLimiter.js';

test('Verify localStorage timestamps with configurable fetching actions', async ({ page, context }) => {
    // Configuration values for the test
    const numberOfLogoClicks = MAX_TIMESTAMPS - 1;  // Change this to set the number of clicks on the logo
    // const expectedTimestampsCount = MAX_TIMESTAMPS;  // Change this to set the expected number of timestamps

    // Grant location permissions before navigating to the page
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 37.7749, longitude: -122.4194 });  // Example coordinates (San Francisco)
  
    // Navigate to your project URL
    await page.goto('http://127.0.0.1:5500/index.html');  // Replace with your actual URL
  
    // Initial fetch by clicking current location button
    await page.click('#current-location-item');
    await page.waitForSelector('.forecast-day');  // Ensure forecast data is populated
  
    // Log initial timestamps in localStorage
    let timestampsAfterFirstFetch = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('weatherFetchTimestamps')) || [];
    });
    // console.log('Timestamps after first fetch:', timestampsAfterFirstFetch);
  
    // Perform the configured number of logo clicks to trigger additional fetches
    for (let i = 0; i < numberOfLogoClicks; i++) {
        await page.click('#logo');
        await page.waitForTimeout(1000);  // Small delay between clicks
    }
  
    // Wait for the forecast data to refresh after the final click
    await page.waitForSelector('.forecast-day');

    
  
    // Log timestamps in localStorage after all fetches
    let timestampsAfterFinalFetch = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('weatherFetchTimestamps')) || [];
    });
    console.log('Expected number of timestamps:', MAX_TIMESTAMPS );
    // console.log('Total fetches:', numberOfLogoClicks + 1 );
    console.log('Timestamps after final fetch:', timestampsAfterFinalFetch.length);
    // console.log('MAX_TIMESTAMPS from rateLimiter.js:', MAX_TIMESTAMPS);

    // Assert that the number of timestamps matches the expected count
    expect(timestampsAfterFinalFetch.length).toBe(expectedTimestampsCount);
});
