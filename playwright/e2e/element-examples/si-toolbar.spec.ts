/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-toolbar', () => {
  test('si-toolbar/si-toolbar', async ({ page, si }) => {
    await si.visitExample('si-toolbar/si-toolbar');
    const placementGroup = page.getByRole('group', { name: 'Placement' });
    const alignmentGroup = page.getByRole('group', { name: 'Alignment' });
    await si.runVisualAndA11yTests('floating-bottom');

    await alignmentGroup.getByText('Start', { exact: true }).click();
    await expect(page.getByRole('toolbar', { name: 'Editor toolbar' })).toHaveClass(
      /si-toolbar-align-start/
    );
    await si.runVisualAndA11yTests('floating-bottom-start');

    await page.getByRole('switch', { name: 'Multiple toolbars' }).click();
    await alignmentGroup.getByText('Center', { exact: true }).click();
    await placementGroup.getByText('Start', { exact: true }).click();
    await expect(page.getByRole('toolbar', { name: 'Editor toolbar' })).toHaveAttribute(
      'aria-orientation',
      'vertical'
    );
    await expect(page.getByRole('toolbar', { name: 'Alignment toolbar' })).toHaveAttribute(
      'aria-orientation',
      'vertical'
    );
    await si.runVisualAndA11yTests('floating-start');

    await page.getByRole('button', { name: 'Docked', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Docked toolbar' })).toBeVisible();
    await si.runVisualAndA11yTests('docked-start');

    await placementGroup.getByText('Top', { exact: true }).click();
    await expect(page.getByRole('toolbar')).toHaveAttribute('aria-orientation', 'horizontal');
    await si.runVisualAndA11yTests('docked-top');

    await page.getByRole('switch', { name: 'Dock to application layout' }).click();
    await expect(page.getByRole('switch', { name: 'Dock to application layout' })).toBeChecked();
    await si.runVisualAndA11yTests('docked-layout-top');

    await placementGroup.getByText('Start', { exact: true }).click();
    await expect(page.getByRole('toolbar')).toHaveAttribute('aria-orientation', 'vertical');
    await si.runVisualAndA11yTests('docked-layout-start');
  });

  test('si-toolbar/si-toolbar-content', async ({ page, si }) => {
    await si.visitExample('si-toolbar/si-toolbar-content');
    await si.runVisualAndA11yTests();
    await page.getByRole('button', { name: 'More export options', exact: true }).click();
    await expect(page.getByRole('menuitem', { name: 'Export as PDF' })).toBeVisible();
    await si.runVisualAndA11yTests('split-button-menu');
  });

  test('si-toolbar/si-toolbar-overflow', async ({ page, si }) => {
    await si.visitExample('si-toolbar/si-toolbar-overflow');
    // The minimum width ensures that the alignment section overflows on every viewport.
    await page.getByLabel('Workspace width').fill('30');
    await page.getByRole('button', { name: 'More Alignment', exact: true }).click();
    // The last action of a section is always the first one to move into the overflow menu.
    await expect(page.getByRole('menuitem', { name: 'Align right' })).toBeVisible();
    await si.runVisualAndA11yTests('overflow-menu');
  });
});
