/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export const STYLE_REPLACEMENTS = [
  // Single quotes
  {
    replace: `@import '@simpl/element-theme/`,
    new: `@import '@siemens/element-theme/`
  },
  {
    replace: `@use '@simpl/element-theme/`,
    new: `@use '@siemens/element-theme/`
  },
  // Double quotes
  {
    replace: `@import "@simpl/element-theme/`,
    new: `@import "@siemens/element-theme/`
  },
  {
    replace: `@use "@simpl/element-theme/`,
    new: `@use "@siemens/element-theme/`
  }
];
// Apply theme styles if not already present
export const THEME_STYLE_ENTRIES = [
  { insert: `// Load Siemens fonts` },
  { insert: `@use '@simpl/brand/assets/fonts/styles/siemens-sans';` },
  { insert: `// Load Element icons` },
  { insert: `@use '@simpl/element-icons/dist/style/simpl-element-icons';` },
  { insert: `// Use Element theme` },
  {
    insert: `@use '@siemens/element-theme/src/theme' with (
  $element-theme-default: 'siemens-brand',
  $element-themes: (
    'siemens-brand',
    'element'
  )
);`,
    pattern: /@use ['"]@siemens\/element-theme\/src\/theme['"] with \(([\s\S]*?)\);/g
  },
  { insert: `// Use Element components` },
  { insert: `@use '@siemens/element-ng/element-ng';` },
  { insert: `// Actually build the siemens-brand theme` },
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

export const SCSS_USE_PATTERNS = [
  /@use ['"]@simpl\/element-theme\/src\/theme['"] with \(([\s\S]*?)\);/g,
  /@use ['"]@simpl\/element-ng\/simpl-element-ng['"] with \(([\s\S]*?)\);/g,
  /@use ['"]@simpl\/element-theme\/src\/theme['"];/g,
  /@use ['"]@simpl\/element-ng\/simpl-element-ng['"];/g
];
