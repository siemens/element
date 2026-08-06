/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-chat-messages', () => {
  test('si-chat-messages/si-ai-message', ({ si }) => si.static());
  test('si-chat-messages/si-user-message', ({ si }) => si.static());
  test('si-chat-messages/si-chat-message', ({ si }) => si.static());
  test('si-chat-messages/si-attachment-list', ({ si }) => si.static());
  test('si-chat-messages/si-chat-input', ({ si }) => si.static());
  // FIXME: test is unstable
  test.skip('si-chat-messages/si-chat-container', ({ si }) => si.static());
  test('si-chat-messages/si-ai-welcome-screen', ({ si }) => si.static());

  const sourceCitationExamples = [
    {
      example: 'si-chat-messages/si-ai-message',
      triggerName: 'View sources: Connected Devices Guide and 1 additional source'
    },
    {
      example: 'si-chat-messages/si-chat-container',
      triggerName: 'View sources: Data Analysis Guide and 1 additional source'
    }
  ];

  for (const { example, triggerName } of sourceCitationExamples) {
    test(`${example} source citation popover`, async ({ page, si }) => {
      await si.visitExample(example);

      await page.getByRole('button', { name: triggerName }).click();
      const popover = page.getByRole('dialog');
      await expect(popover).toBeVisible();
      await expect(popover.getByText('Sources', { exact: true })).toBeVisible();

      await si.runVisualAndA11yTests('source-citation-popover');
    });
  }
});
