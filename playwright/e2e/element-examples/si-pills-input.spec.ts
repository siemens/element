/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('si-pills-input with overflowing item', () => {
  const example = 'si-pills-input/si-pills-input';
  test('si-pills-input', async ({ page, si }) => {
    await si.visitExample(example);
    const newItemInput = page.getByLabel('Tags', { exact: true }).getByLabel('Create Item');
    await newItemInput.fill(new Array(150).fill('a').join(''));
    await newItemInput.press('Enter');
    await si.runVisualAndA11yTests('', {
      axeRulesSet: [{ id: 'aria-required-children', enabled: false }]
    });
  });
});
