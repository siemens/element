/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  selectOptions,
  toInternalCriteria,
  toOptionCriteria,
  toTranslatedOptions
} from './si-filtered-search-helper';
import { ValidationType } from './si-filtered-search.model';

describe('si-filtered-search-helper', () => {
  describe('with toCriteriaIntern', () => {
    it('should provide required property defaults including label derived from name', () => {
      expect(toInternalCriteria({ name: 'a', validationType: 'integer' })).toEqual({
        name: 'a',
        label: 'a',
        validationType: 'integer',
        translatedLabel: 'a'
      });
    });

    it('should include derived properties', () => {
      expect(toInternalCriteria({ name: 'a' })).toEqual({
        name: 'a',
        label: 'a',
        translatedLabel: 'a'
      });
    });

    ['date', 'date-time'].forEach(type => {
      it(`should initialize dateValue when validationType = ${type}`, () => {
        const validationType = type as ValidationType;
        const actual = toInternalCriteria({ name: 'a', validationType });
        expect(actual).toEqual({
          name: 'a',
          label: 'a',
          validationType,
          translatedLabel: 'a'
        });
      });
    });
  });

  describe('with selectOptions', () => {
    it('should select by value', () => {
      const options = [
        { translatedLabel: 'Germany', value: 'DE', selected: false },
        { translatedLabel: 'Ireland', value: 'IRE', selected: false },
        { translatedLabel: 'Switzerland', value: 'CH', selected: false }
      ];
      selectOptions(options, ['CH', 'DE']);

      expect(options).toEqual([
        { translatedLabel: 'Germany', value: 'DE', selected: true },
        { translatedLabel: 'Ireland', value: 'IRE', selected: false },
        { translatedLabel: 'Switzerland', value: 'CH', selected: true }
      ]);
    });
  });

  describe('with toOptionCriteria', () => {
    it('should return empty list', () => {
      expect(toOptionCriteria(undefined)).toEqual([]);
    });
  });

  describe('with toTranslatedOptions', () => {
    it('should use the translated label', () => {
      const translate = vi.fn().mockReturnValue('Deutschland');

      const options = toTranslatedOptions([{ label: 'Germany', value: 'DE' }], translate);

      expect(options).toMatchObject([{ translatedLabel: 'Deutschland', value: 'DE' }]);
      expect(translate).toHaveBeenCalledExactlyOnceWith('Germany');
    });

    it('should preserve the label when translation returns the original key', () => {
      const options = toTranslatedOptions([{ label: 'Germany', value: 'DE' }], label => label);

      expect(options).toMatchObject([{ translatedLabel: 'Germany', value: 'DE' }]);
    });

    it('should fall back to the option value when translation is undefined', () => {
      const options = toTranslatedOptions([{ label: 'Germany', value: 'DE' }], () => undefined);

      expect(options).toMatchObject([{ translatedLabel: 'DE', value: 'DE' }]);
    });

    it('should use the option value without translating when no label is provided', () => {
      const translate = vi.fn();

      const options = toTranslatedOptions([{ value: 'DE' }], translate);

      expect(options).toMatchObject([{ translatedLabel: 'DE', value: 'DE' }]);
      expect(translate).not.toHaveBeenCalled();
    });

    it('should use the option value without translating an empty label', () => {
      const translate = vi.fn();

      const options = toTranslatedOptions([{ label: '', value: 'DE' }], translate);

      expect(options).toMatchObject([{ translatedLabel: 'DE', value: 'DE' }]);
      expect(translate).not.toHaveBeenCalled();
    });
  });
});
