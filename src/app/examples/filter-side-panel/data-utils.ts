/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TreeItem } from '@siemens/element-ng/tree-view';

import { Country, Status } from './filter.model';

export const countryList = (locale: string): Country[] => {
  const countryName = new Intl.DisplayNames([locale], { type: 'region' });
  const countries: Country[] = [];
  for (let firstLetter = 65; firstLetter <= 90; ++firstLetter) {
    for (let secondLetter = 65; secondLetter <= 90; ++secondLetter) {
      const code = String.fromCharCode(firstLetter) + String.fromCharCode(secondLetter);
      const name = countryName.of(code);
      if (name && code !== name) {
        countries.push({ code, name });
      }
    }
  }
  return countries.sort((a, b) => a.name!.localeCompare(b.name!));
};

export const statusList = (): Status[] =>
  ['Created', 'Open', 'Alarmed', 'Reserved', 'Waiting', 'Finished', 'Archived'].map(t => ({
    title: t,
    id: t.toLowerCase()
  }));

export const versionList = (): string[] => {
  return [
    '1.0',
    '1.1',
    '1.2',
    '2.0',
    '2.1',
    '3.0',
    '3.1',
    '4.0',
    '4.1',
    '5.0',
    '5.1',
    '6.0',
    '6.1',
    '7.0',
    '7.1',
    '8.0',
    '8.1',
    '9.0',
    '9.1',
    '10.0'
  ];
};

export const visitItems = (items: TreeItem[], visitor: (i: TreeItem) => void): void => {
  const pending: TreeItem[] = [...items];
  let item = pending.shift();
  while (item) {
    visitor(item);
    if (item.children) {
      pending.push(...item.children);
    }
    item = pending.shift();
  }
};
