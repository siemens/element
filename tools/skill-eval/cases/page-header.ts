/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect } from '@playwright/test';

import { type EvaluationCase } from './types';

export const pageHeader: EvaluationCase = {
  id: 'page-header',
  route: '/devices',
  prompt:
    'Add a device overview page at /devices to this Siemens Element application. Show the page title "Devices", a short description, and a primary "Add device" page action. Clicking the action should show "Device added" in a status message. Include a responsive list or grid with the devices "Boiler", "Cooling unit", and "Ventilation". Follow the design system layout, typography, spacing, and page-header guidance. Keep the existing application shell and pages.',
  verifyPage: async page => {
    const header = page.locator('.si-layout-header');
    await expect(header, 'Exactly one Element page header on the devices page').toHaveCount(1);
    await expect(
      header.locator('h2.si-layout-title'),
      'Devices page title in the Element page header'
    ).toHaveText('Devices');
    await expect(
      header.locator('.si-layout-subtitle'),
      'Non-empty device overview description in the page header'
    ).not.toBeEmpty();
    for (const device of ['Boiler', 'Cooling unit', 'Ventilation']) {
      await expect(
        page.getByText(device, { exact: true }),
        `Visible device "${device}" in the overview`
      ).toBeVisible();
    }
    const actions = header.locator('.si-layout-actions');
    const addDevice = actions
      .getByRole('button', { name: 'Add device', exact: true })
      .or(actions.getByRole('menuitem', { name: 'Add device', exact: true }))
      .filter({ visible: true });
    await expect(
      addDevice,
      'The page header must expose one visible "Add device" button or menu item'
    ).toHaveCount(1);
    await addDevice.click();
    await expect(
      page
        .getByRole('status')
        .or(page.getByRole('alert'))
        .filter({ hasText: 'Device added', visible: true }),
      'Success message after clicking "Add device"'
    ).not.toHaveCount(0);
  }
};
