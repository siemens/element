/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test('si-chat-messages/si-ai-message', ({ si }) => si.static());
test('si-chat-messages/si-ai-message--inline-source-popover', async ({ page, si }) => {
  await si.visitExample('si-chat-messages/si-ai-message');
  const chip = page.getByRole('checkbox', { name: /Energy Report/i });
  await chip.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await si.runVisualAndA11yTests();
});
test('si-chat-messages/si-ai-message--summary-source-popover', async ({ page, si }) => {
  await si.visitExample('si-chat-messages/si-ai-message');
  await page.getByRole('button', { name: 'Summary sources' }).click();
  const chip = page.getByRole('checkbox', { name: 'Sources' });
  await chip.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await si.runVisualAndA11yTests();
});
test('si-chat-messages/si-user-message', ({ si }) => si.static());
test('si-chat-messages/si-chat-message', ({ si }) => si.static());
test('si-chat-messages/si-attachment-list', ({ si }) => si.static());
test('si-chat-messages/si-chat-input', ({ si }) => si.static());
test('si-chat-messages/si-chat-container', ({ si }) => si.static());
test('si-chat-messages/si-chat-container--inline-source-popover', async ({ page, si }) => {
  await si.visitExample('si-chat-messages/si-chat-container');
  const chip = page.getByRole('checkbox', { name: /Python Docs/i }).first();
  await chip.scrollIntoViewIfNeeded();
  await chip.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await si.runVisualAndA11yTests();
});
test('si-chat-messages/si-chat-container--summary-source-popover', async ({ page, si }) => {
  await si.visitExample('si-chat-messages/si-chat-container');
  await page.getByRole('button', { name: 'Summary sources' }).click();
  const chip = page.getByRole('checkbox', { name: 'Sources' }).first();
  await chip.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await si.runVisualAndA11yTests();
});
test('si-chat-messages/si-ai-welcome-screen', ({ si }) => si.static());
