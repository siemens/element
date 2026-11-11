/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect } from '@playwright/test';

import { type EvaluationCase } from './types';

export const formValidation: EvaluationCase = {
  id: 'form-validation',
  route: '/contact',
  prompt:
    'Add a contact form page at /contact to this Siemens Element application. Include labelled "Name" and "Email" fields and a "Save" button. Both fields are required; Email must be a valid email address. After an invalid submission, show "Name is required" and "Enter a valid email address" beside the corresponding fields, with accessible invalid states and error associations. Do not show "Saved" for invalid data. After submitting valid data, show "Saved" in a status message. Use the design system form and validation patterns. Keep the existing application shell and pages.',
  verifyPage: async page => {
    const name = page.getByLabel(/^Name\s*\*?$/);
    const email = page.getByLabel(/^Email\s*\*?$/);
    const save = page.getByRole('button', { name: 'Save', exact: true });
    await save.click();
    await expect(
      page.getByText('Name is required', { exact: true }),
      'Name validation error after submitting the empty contact form'
    ).toBeVisible();
    await expect(
      page.getByText('Enter a valid email address', { exact: true }),
      'Email validation error after submitting the empty contact form'
    ).toBeVisible();
    for (const [label, field, message] of [
      ['Name', name, 'Name is required'],
      ['Email', email, 'Enter a valid email address']
    ] as const) {
      await expect(
        field.and(page.locator('[aria-invalid="true"], :invalid:not([aria-invalid])')),
        `Accessible invalid state for the "${label}" field`
      ).toBeVisible();
      await expect(field, `Error reference on the "${label}" field`).toHaveAttribute(
        'aria-describedby',
        /\S+/
      );
      const ids = (await field.getAttribute('aria-describedby'))!.split(/\s+/);
      const associated = await page.evaluate(
        data =>
          data.ids.some(reference =>
            document.getElementById(reference)?.textContent?.includes(data.message)
          ),
        { ids, message }
      );
      expect(associated, `"${label}" must describe its own validation error: "${message}"`).toBe(
        true
      );
    }
    await expect(
      page.getByText('Saved', { exact: true }),
      'No "Saved" confirmation after submitting the empty contact form'
    ).toHaveCount(0);
    await name.fill('Jane Smith');
    await email.fill('not-an-email');
    await save.click();
    await expect(
      page.getByText('Enter a valid email address', { exact: true }),
      'Email validation error after submitting "not-an-email"'
    ).toBeVisible();
    await expect(
      page.getByText('Saved', { exact: true }),
      'No "Saved" confirmation after submitting an invalid email address'
    ).toHaveCount(0);
    await email.fill('jane@example.com');
    await save.click();
    await expect(
      page.getByRole('status'),
      'Saved status message after submitting valid contact details'
    ).toContainText('Saved');
  }
};
