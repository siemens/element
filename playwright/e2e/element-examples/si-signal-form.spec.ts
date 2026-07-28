/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-signal-form', () => {
  const example = 'si-signal-form/si-signal-form';

  test(example, async ({ page, si }) => {
    await page.clock.setFixedTime('2025-02-25');
    // Keep the narrow viewport clear of the container query breakpoint. At 450px, the layout
    // can become dependent on whether a vertical scrollbar is present and settle in either mode.
    await page.setViewportSize({ width: 440, height: 820 });
    await si.visitExample(example, false);
    await si.runVisualAndA11yTests(undefined);

    await page.setViewportSize({ width: 600, height: 820 });
    await si.runVisualAndA11yTests('large');

    const name = page.getByLabel('Name');
    await name.fill('a');

    const arrival = page.getByRole('group', { name: 'Arrival' });
    const arrivalHours = arrival.getByLabel('Hours');
    const arrivalMinutes = arrival.getByLabel('Minutes');
    await arrivalHours.fill('9');
    await arrivalMinutes.fill('9');

    const departure = page.getByRole('group', { name: 'Departure' });
    const departureHours = departure.getByLabel('Hours');
    const departureMinutes = departure.getByLabel('Minutes');
    await departureHours.fill('8');
    await departureMinutes.fill('8');

    const phoneNumberInput = page.getByRole('group', { name: 'Phone number' }).getByRole('textbox');
    await phoneNumberInput.fill('5');
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    const serviceClass = page.getByRole('combobox', { name: 'Class of service' });
    await serviceClass.click();
    const listboxId = await serviceClass.getAttribute('aria-controls');
    await page.locator(`#${listboxId}`).getByText('Economy').click();
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());

    await page.getByText('Save').click();

    await si.runVisualAndA11yTests('large-validated');

    await expect(await si.getDescription(name)).toHaveText(
      'Minimum 3 characters  Name must start with an uppercase letter'
    );
    await expect(await si.getDescription(phoneNumberInput)).toHaveText('Invalid phone number');
    await expect(await si.getDescription(page.getByLabel('Day of birth'))).toHaveText(
      'Day of birth required'
    );
    const travelDate = page.getByRole('group', { name: 'Travel date' });
    await expect(await si.getDescription(travelDate.getByLabel('Start date'))).toHaveText(
      'Travel dates are required'
    );
    await expect(await si.getDescription(travelDate.getByLabel('End date'))).toHaveText(
      'Travel dates are required'
    );
    await expect(await si.getDescription(departureHours)).toHaveText(
      'Departure must be after arrival'
    );
    await expect(await si.getDescription(departureMinutes)).toHaveText(
      'Departure must be after arrival'
    );
    await expect(await si.getDescription(departure.getByLabel('Period'))).toHaveText(
      'Departure must be after arrival'
    );
    await expect(await si.getDescription(serviceClass)).toHaveText('You deserve better!');
    await expect(await si.getDescription(page.getByLabel('Fellow passengers'))).toHaveText(
      'Minimum 2'
    );
    await expect(
      await si.getDescription(page.getByLabel('I confirm that I accept all and everything'))
    ).toHaveText('Accept terms before joining');
    await expect(
      await si.getDescription(page.getByLabel('I confirm that I do not care about my privacy'))
    ).toHaveText('Accept the privacy policy before joining');
  });
});
