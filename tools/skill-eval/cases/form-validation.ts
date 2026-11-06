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
    const name = page.getByLabel('Name', { exact: true });
    const email = page.getByLabel('Email', { exact: true });
    const save = page.getByRole('button', { name: 'Save', exact: true });
    await save.click();
    await expect(page.getByText('Name is required', { exact: true })).toBeVisible();
    await expect(page.getByText('Enter a valid email address', { exact: true })).toBeVisible();
    for (const [field, message] of [
      [name, 'Name is required'],
      [email, 'Enter a valid email address']
    ] as const) {
      await expect(field).toHaveAttribute('aria-invalid', 'true');
      await expect(field).toHaveAttribute('aria-describedby', /\S+/);
      const ids = (await field.getAttribute('aria-describedby'))!.split(/\s+/);
      const associated = await page.evaluate(
        data =>
          data.ids.some(reference =>
            document.getElementById(reference)?.textContent?.includes(data.message)
          ),
        { ids, message }
      );
      expect(associated, 'The field must describe its own validation error').toBe(true);
    }
    await expect(page.getByText('Saved', { exact: true })).toHaveCount(0);
    await name.fill('Jane Smith');
    await email.fill('not-an-email');
    await save.click();
    await expect(page.getByText('Enter a valid email address', { exact: true })).toBeVisible();
    await expect(page.getByText('Saved', { exact: true })).toHaveCount(0);
    await email.fill('jane@example.com');
    await save.click();
    await expect(page.getByRole('status')).toContainText('Saved');
  }
};
