/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type { Page } from '@playwright/test';

import { expect, test } from '../../support/test-helpers';

test.describe('si-carousel', () => {
  const example = 'si-carousel/si-carousel';

  // The carousel determines its active slide from the viewport scroll position
  // via an IntersectionObserver. With `scroll-snap-type: x mandatory`, headless
  // Chromium can resolve the initial snap to the last slide instead of the
  // first. Reset the carousel to the first slide explicitly so every capture
  // starts from a deterministic state.
  const goToFirstSlide = async (page: Page): Promise<void> => {
    await page
      .locator('si-carousel .carousel-viewport')
      .evaluate(el => el.scrollTo({ left: 0, behavior: 'instant' }));
    await expect(page.locator('button[aria-label^="Slide 1 of"] span').first()).toHaveClass(
      /active/
    );
  };

  test(example, async ({ page, si }) => {
    await si.visitExample(example, false);
    await expect(page.locator('si-carousel')).toBeVisible();
    await goToFirstSlide(page);
    await si.runVisualAndA11yTests();
  });

  test(`${example} - more than 8 slides`, async ({ page, si }) => {
    await si.visitExample(example, false);
    await expect(page.locator('si-carousel')).toBeVisible();

    // 4 base slides + 5 additional = 9 slides (> 8)
    await page.locator('#additional-items').fill('5');
    await goToFirstSlide(page);

    await si.runVisualAndA11yTests('more-than-8-slides');
  });

  test(`${example} - navigate to 6th and last slide`, async ({ page, si }) => {
    await si.visitExample(example, false);
    await expect(page.locator('si-carousel')).toBeVisible();

    // 4 base slides + 5 additional = 9 slides, enough to reach a 6th slide.
    await page.locator('#additional-items').fill('5');
    await goToFirstSlide(page);

    const nextButton = page.getByRole('button', { name: 'Next slide' });

    // Navigate to the 6th slide (5 clicks from the first slide).
    for (let i = 0; i < 5; i++) {
      await nextButton.click();
    }
    await expect(page.locator('button[aria-label^="Slide 6 of"] span').first()).toHaveClass(
      /active/
    );
    await si.runVisualAndA11yTests('sixth-slide');

    // Navigate to the last (9th) slide.
    for (let i = 0; i < 3; i++) {
      await nextButton.click();
    }
    await expect(page.locator('button[aria-label^="Slide 9 of"] span').first()).toHaveClass(
      /active/
    );
    await si.runVisualAndA11yTests('last-slide');
  });

  test(`${example} - autoplay on`, async ({ page, si }) => {
    await si.visitExample(example, false);
    await expect(page.locator('si-carousel')).toBeVisible();
    await goToFirstSlide(page);

    // Set a long duration so slides don't change while capturing the screenshot.
    await page.locator('#auto-play-duration').fill('100000');
    await page.locator('#auto-play').check();

    await si.runVisualAndA11yTests('autoplay-on');
  });

  test(`${example} - autoplay on small screen`, async ({ page, si }) => {
    await si.visitExample(example, false);
    await expect(page.locator('si-carousel')).toBeVisible();
    await goToFirstSlide(page);

    // Enable autoplay first so the play/pause button is rendered and has a real
    // measured width before the carousel evaluates available space.
    // Set a long duration so slides don't change while capturing the screenshot.
    await page.locator('#auto-play-duration').fill('100000');
    await page.locator('#auto-play').check();
    await expect(page.locator('si-carousel button[aria-label="Pause"]')).toBeVisible();

    // Shrink to a small screen and nudge the viewport. The carousel only
    // recomputes the available space through its ResizeObserver, so the extra
    // resize forces a recalculation now that the play/pause button has a width.
    // When space is insufficient the button collapses to an icon-only button.
    await page.setViewportSize({ width: 300, height: 800 });
    await page.setViewportSize({ width: 301, height: 800 });
    await page.setViewportSize({ width: 300, height: 800 });

    // Wait for the collapsed, icon-only play/pause button before capturing.
    await expect(page.locator('si-carousel button.btn-icon[aria-label="Pause"]')).toBeVisible();

    await si.runVisualAndA11yTests('autoplay-small-screen');
  });
});
