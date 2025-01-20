const { test, expect } = require('@playwright/test');

test('Verify cooldown starts after exceeding fetch limit', async ({ page, context }) => {
    // Configuration values for the test
    const numberOfLogoClicks = 9;  // Simulate 9 additional fetches after the initial one
    const expectedFetchCount = numberOfLogoClicks + 1;  // Fetches required to trigger cooldown (initial + clicks)

    // Grant location permissions before navigating to the page
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 37.7749, longitude: -122.4194 });

    // Navigate to your project URL
    await page.goto('http://127.0.0.1:5500/index.html');

    // Initial fetch by clicking current location button
    await page.click('#current-location-item');
    await page.waitForSelector('.forecast-day');

    const fetchCooldownMessageSelector = '#cooldown-message';

    let cooldownTriggered = false;
    for (let i = 1; i <= numberOfLogoClicks; i++) {
        await page.click('#logo');
        await page.waitForTimeout(1000);  // Simulate delay between clicks

        cooldownTriggered = await page.isVisible(fetchCooldownMessageSelector);
        if (cooldownTriggered) {
            console.log(`Cooldown message displayed after ${i + 1} fetches.`);
            if (i + 1 === expectedFetchCount) {
                expect(cooldownTriggered).toBe(true);
                console.log(`Test passed: Cooldown triggered at the correct fetch count (${i + 1}).`);
            } else {
                console.log(`Test failed: Cooldown triggered too early or too late at ${i + 1} fetches.`);
                expect(i + 1).toBe(expectedFetchCount);  // Fail if not matching the expected count
            }
            break;
        }
    }

    if (!cooldownTriggered) {
        console.log('Test failed: Cooldown message was not triggered at all.');
        expect(cooldownTriggered).toBe(true);  // Force test failure if message never appears
    }
});
