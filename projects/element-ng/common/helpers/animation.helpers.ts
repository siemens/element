/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
/**
 * @param element - Element whose computed `--element-animations-enabled` value is checked.
 *   Defaults to `document.documentElement`.
 * @returns Returns whether animations are disabled via the CSS var. This is either set by
 * an application on low-end devices or in case the device is configured for reduced motion
 * (i.e. `@media (prefers-reduced-motion)` matches)
 */
export const areAnimationsDisabled = (element: Element = document.documentElement): boolean => {
  const style = getComputedStyle(element);
  const flag = style.getPropertyValue('--element-animations-enabled');
  return parseInt(flag, 10) === 0;
};
