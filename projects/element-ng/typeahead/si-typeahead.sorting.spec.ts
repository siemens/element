/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TypeaheadMatch } from '.';
import { SiTypeaheadSorting } from './si-typeahead.sorting';

describe('SiTypeaheadSorting', () => {
  const sut = new SiTypeaheadSorting();

  describe('sortMatches', () => {
    it('string match item should be the first', () => {
      const stringMatchItemfirst: TypeaheadMatch = {
        option: 'a',
        itemSelected: true,
        text: 'a',
        iconClass: 'a',
        result: [],
        stringMatch: true,
        atBeginning: false,
        matches: 0,
        uniqueMatches: 0,
        uniqueSeparateMatches: 0,
        matchesEntireQuery: false,
        matchesAllParts: false,
        matchesAllPartsSeparately: false
      };
      const otherItem: TypeaheadMatch = {
        option: 'aa',
        itemSelected: true,
        text: 'aa',
        iconClass: 'aa',
        result: [],
        stringMatch: false,
        atBeginning: false,
        matches: 0,
        uniqueMatches: 0,
        uniqueSeparateMatches: 0,
        matchesEntireQuery: false,
        matchesAllParts: false,
        matchesAllPartsSeparately: false
      };

      const input: TypeaheadMatch[] = [otherItem, stringMatchItemfirst];
      expect(sut.sortMatches(input)).toEqual([stringMatchItemfirst, otherItem]);
    });
  });
});
