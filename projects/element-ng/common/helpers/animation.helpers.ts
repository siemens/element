/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
/**
 * @returns Returns whether animations are disabled via the CSS var. This is either set by
 * an application on low-end devices or in case the device is configured for reduced motion
 * (i.e. `@media (prefers-reduced-motion)` matches)
 */
export const areAnimationsDisabled = (): boolean => {
  const style = getComputedStyle(document.documentElement);
  const flag = style.getPropertyValue('--element-animations-enabled');
  return parseInt(flag, 10) === 0;
};
