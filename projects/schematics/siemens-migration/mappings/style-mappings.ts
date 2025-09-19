/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export const styleReplacements = [
  {
    replace: `@import '@simpl/element-theme/`,
    new: `@import '@siemens/element-theme/`
  },
  {
    replace: `@use '@simpl/element-theme/`,
    new: `@use '@siemens/element-theme/`
  }
];
// Apply theme styles if not already present
export const themeStyleEntries = [
  { insert: `@use '@simpl/brand/assets/fonts/styles/siemens-sans';` },
  {
    insert: `@use '@siemens/element-theme/src/theme' with (
  $element-theme-default: 'siemens-brand',
  $element-themes: (
    'siemens-brand',
    'element'
  )
);`,
    pattern: /@use '@siemens\/element-theme\/src\/theme' with \(([\s\S]*?)\);/g
  },
  { insert: `@use '@siemens/element-ng/element-ng';` },
  { insert: `@use '@siemens/element-theme/src/styles/themes';` },
  { insert: `@use '@simpl/brand/dist/element-theme-siemens-brand-light' as brand-light;` },
  { insert: `@use '@simpl/brand/dist/element-theme-siemens-brand-dark' as brand-dark;` },
  {
    insert: `@include themes.make-theme(brand-light.$tokens, 'siemens-brand');`,
    pattern: /@include themes\.make-theme\(brand-light\.\$tokens, 'siemens-brand'\);/g
  },
  {
    insert: `@include themes.make-theme(brand-dark.$tokens, 'siemens-brand', true);`,
    pattern: /@include themes\.make-theme\(brand-dark\.\$tokens, 'siemens-brand', true\);/g
  }
];

export const scssUsePatterns = [
  /@use '@simpl\/element-theme\/src\/theme' with \(([\s\S]*?)\);/g,
  /@use '@simpl\/element-ng\/simpl-element-ng' with \(([\s\S]*?)\);/g,
  /@use '@simpl\/element-theme\/src\/theme';/g
];
