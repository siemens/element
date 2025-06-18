/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
export const getFieldValue = (model: any, path: string[]): any => {
  for (const p of path) {
    if (!model) {
      return model;
    }
    model = model[p];
  }
  return model;
};

// Got this from @ngx-formly/core/lib/utils
export const getKeyPath = (key?: any): string[] => {
  if (!key) {
    return [];
  }
  let path: string[] = [];
  if (typeof key === 'string') {
    const k = !key.includes('[') ? key : key.replace(/\[(\w+)\]/g, '.$1');
    path = k.includes('.') ? k.split('.') : [k];
  } else if (Array.isArray(key)) {
    path = key.slice(0);
  } else {
    path = [`${key}`];
  }
  return path.slice(0);
};
