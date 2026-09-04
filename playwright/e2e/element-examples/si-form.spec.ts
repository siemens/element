/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

const examples = [
  'si-form/si-reactive-form',
  'si-form/si-signal-form',
  'si-form/si-template-driven-form'
];

for (const example of examples) {
  test(example, async ({ page, si }) => {
    await page.clock.setFixedTime('2025-02-25');
    // Keep clear of the container query breakpoint. At 450px, the layout can depend on
    // whether a vertical scrollbar is present and settle in either mode.
    await page.setViewportSize({ width: 440, height: 820 });
    await si.visitExample(example, false);
    await si.runVisualAndA11yTests(undefined);

    await page.setViewportSize({ width: 1920, height: 820 });
    await si.runVisualAndA11yTests('large');

    const name = page.getByLabel('Name');
    const disableForm = page.getByLabel('Disable form');
    await disableForm.check();
    await expect(name).toBeDisabled();
    await disableForm.uncheck();
    await expect(name).toBeEnabled();

    const readonlyForm = page.getByLabel('Readonly form');
    await readonlyForm.check();
    await expect(name).not.toBeEditable();
    await expect(page.getByLabel('Engineer')).toBeDisabled();
    await expect(page.getByLabel('I confirm that I accept all and everything.')).toBeDisabled();
    await expect(page.getByLabel('I confirm that I do not care about my privacy.')).toBeDisabled();
    await readonlyForm.uncheck();
    await expect(name).toBeEditable();
    await expect(page.getByLabel('Engineer')).toBeEnabled();
    await expect(page.getByLabel('I confirm that I accept all and everything.')).toBeEnabled();
    await expect(page.getByLabel('I confirm that I do not care about my privacy.')).toBeEnabled();

    await name.fill('a');
    await expect(page.locator('app-form-debug tbody td').first()).toContainText('"name": "a"');

    const arrival = page.getByRole('group', { name: 'Arrival' });
    await arrival.getByLabel('Hours').fill('9');
    await arrival.getByLabel('Minutes').fill('9');

    const departure = page.getByRole('group', { name: 'Departure' });
    const departureHours = departure.getByLabel('Hours');
    const departureMinutes = departure.getByLabel('Minutes');
    const departurePeriod = departure.getByLabel('Period');
    await departureHours.fill('8');
    await departureMinutes.fill('8');

    const phoneNumber = page.getByRole('group', { name: 'Phone number' }).getByRole('textbox');
    await phoneNumber.fill('5');
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());

    const serviceClass = page.getByRole('combobox', { name: 'Class of service' });
    await serviceClass.click();
    const listboxId = await serviceClass.getAttribute('aria-controls');
    await page.locator(`#${listboxId}`).getByText('Economy').click();
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());

    await page.getByText('Save').click();
    await si.runVisualAndA11yTests('large-validated');

    await expect(await si.getDescription(name)).toHaveText(
      'Min. 3 characters  Name must start with an uppercase letter.'
    );
    await expect(await si.getDescription(phoneNumber)).toHaveText('Invalid phone number');
    await expect(await si.getDescription(page.getByLabel('Day of birth'))).toHaveText('Required');

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
    await expect(await si.getDescription(departurePeriod)).toHaveText(
      'The departure time must be after arrival.'
    );
    await expect(await si.getDescription(serviceClass)).toHaveText('You deserve better!');

    await expect(await si.getDescription(page.getByLabel('Fellow passengers'))).toHaveText(
      'Min. 2'
    );
    await expect(
      await si.getDescription(page.getByLabel('I confirm that I accept all and everything.'))
    ).toHaveText('You need to accept all terms before joining.');
    await expect(
      await si.getDescription(page.getByLabel('I confirm that I do not care about my privacy.'))
    ).toHaveText('Required');
  });
}
