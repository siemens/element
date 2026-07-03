/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-signal-form', () => {
  const example = 'si-signal-form/si-signal-form';

  test(example, async ({ page, si }) => {
    await si.visitExample(example, false);
    await si.runVisualAndA11yTests(undefined);

    // fill the name with an invalid value
    const name = page.getByLabel('Name', { exact: true });
    await name.fill('a');

    await page.getByText('Save').click();

    await si.runVisualAndA11yTests('validated');

    // verify that the angular provided error messages are linked to the controls
    await expect(await si.getDescription(name)).toHaveText(
      'Minimum 3 characters  Name must start with an uppercase letter'
    );
    await expect(await si.getDescription(page.getByLabel('Day of birth'))).toHaveText(
      'Day of birth required'
    );
    await expect(await si.getDescription(page.getByLabel('Fellow passengers'))).toHaveText(
      'Minimum 2'
    );
    await expect(
      await si.getDescription(page.getByLabel('I confirm that I accept all and everything'))
    ).toHaveText('Accept terms before joining');

    // fixing the name clears its errors
    await name.fill('Alice');
    await expect(await si.getDescription(name)).toHaveText('');
  });
});
