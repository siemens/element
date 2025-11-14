/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { createPart, createTheme } from 'ag-grid-community';

import { elementIconOverrides } from './parts/icon-set';

export const elementTheme = createTheme()
  .withPart(elementIconOverrides)
  .withPart(
    createPart({
      feature: 'checkboxStyle',
      css: `
      .ag-checkbox-input{
@extend %form-check-base;
      }
      `
    })
  )
  .withParams({
    fontFamily: '"SiemensSans Pro", sans-serif',
    iconSize: 18
  });
