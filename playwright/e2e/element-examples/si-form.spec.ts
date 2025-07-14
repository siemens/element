/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-form', () => {
  const example = 'si-form/si-form';

  test(example, async ({ page, si }) => {
    await page.clock.setFixedTime('2025-02-25');
    await si.visitExample(example, false);
    await si.runVisualAndA11yTests(undefined);

    await page.setViewportSize({ width: 1920, height: 820 });
    // waiting for the resize-observer to fire, TODO: maybe remove
    await page.waitForTimeout(100);
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
    // Without this, the test fails, because the dropdown does not open.
    // But:
    // - playwright says it can click the dropdown (and it gets the focus)
    // - deleting all other interactions before also solves the problem
    // - yet the problem is that there are too many actions before. If there are only three, it still works.
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    const firstClass = page.getByRole('combobox', { name: 'Class of service' });
    await firstClass.click();
    const listboxId = await firstClass.getAttribute('aria-controls');
    const economyOption = page.locator(`#${listboxId}`).getByText('Economy');
    await economyOption.click();
    // Same issue basically as above
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());

    await page.getByText('Save').click();

    await si.runVisualAndA11yTests('large-validated');
    // verify that all errors are linked

    await expect(await si.getDescription(name)).toHaveText(
      'A minimum length of 3 characters is required.  A name must start with an uppercase letter.'
    );
    await expect(await si.getDescription(phoneNumberInput)).toHaveText('Invalid phone number');
    await expect(await si.getDescription(page.getByLabel('Day of birth'))).toHaveText(
      'A value is required.'
    );
    const travelDate = page.getByRole('group', { name: 'Travel Date' });
    await expect(await si.getDescription(travelDate.getByLabel('Start date'))).toHaveText(
      'Travel date is required.'
    );
    await expect(await si.getDescription(travelDate.getByLabel('End date'))).toHaveText(
      'Travel date is required.'
    );
    await expect(await si.getDescription(departureHours)).toHaveText(
      'The departure time must be after arrival.'
    );
    await expect(await si.getDescription(departureMinutes)).toHaveText(
      'The departure time must be after arrival.'
    );
    await expect(await si.getDescription(departure.getByLabel('Period'))).toHaveText(
      'The departure time must be after arrival.'
    );
    await expect(await si.getDescription(firstClass)).toHaveText('You deserve better!');
    await expect(await si.getDescription(page.getByLabel('Fellow passengers'))).toHaveText(
      'The value is too small'
    );
    await expect(
      await si.getDescription(page.getByLabel('I confirm that I accept all and everything.'))
    ).toHaveText('You need to accept all terms before joining.');
    await expect(
      await si.getDescription(page.getByLabel('I confirm that I do not care about my privacy.'))
    ).toHaveText('A value is required.');
  });
});
