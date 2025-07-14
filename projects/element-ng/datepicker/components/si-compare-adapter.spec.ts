/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DayCompareAdapter, MonthCompareAdapter, YearCompareAdapter } from './si-compare-adapter';

describe('CompareAdapter', () => {
  describe('DayCompareAdapter', () => {
    const dayCompare = new DayCompareAdapter();
    describe('isEqualOrBetween', () => {
      it('should be true', () => {
        const current = new Date(2022, 2, 15);
        expect(dayCompare.isEqualOrBetween(current)).toBeTrue();
        expect(dayCompare.isEqualOrBetween(current, new Date(2022, 2, 15))).toBeTrue();
        expect(
          dayCompare.isEqualOrBetween(current, new Date(2022, 2, 15), new Date(2022, 2, 15))
        ).toBeTrue();
        expect(dayCompare.isEqualOrBetween(current, new Date(2022, 2, 14))).toBeTrue();
        expect(
          dayCompare.isEqualOrBetween(current, new Date(2022, 2, 14), new Date(2022, 2, 16))
        ).toBeTrue();
        expect(dayCompare.isEqualOrBetween(current, undefined, new Date(2022, 2, 15))).toBeTrue();
        expect(dayCompare.isEqualOrBetween(current, undefined, new Date(2022, 2, 16))).toBeTrue();
      });
    });
  });

  describe('MonthCompareAdapter', () => {
    const monthCompare = new MonthCompareAdapter();
    describe('isAfter', () => {
      it('should be true', () => {
        const current = new Date(2022, 2, 15);
        expect(monthCompare.isAfter(current, new Date(2022, 1, 15))).toBeTrue();
      });

      it('should be false', () => {
        const current = new Date(2022, 2, 15);
        expect(monthCompare.isAfter(current, new Date(2022, 2, 14))).toBeFalse();
      });
    });

    describe('isBetween', () => {
      it('should be true', () => {
        const current = new Date(2022, 2, 15);
        expect(monthCompare.isBetween(current)).toBeTrue();
        expect(monthCompare.isBetween(current, new Date(2022, 1, 20))).toBeTrue();
        expect(monthCompare.isBetween(current, undefined, new Date(2022, 3, 20))).toBeTrue();
        expect(
          monthCompare.isBetween(current, new Date(2022, 1, 20), new Date(2022, 3, 20))
        ).toBeTrue();
      });

      it('should be false', () => {
        const current = new Date(2022, 2, 15);
        expect(monthCompare.isBetween(current, new Date(2022, 2, 20))).toBeFalse();
        expect(monthCompare.isBetween(current, undefined, new Date(2022, 2, 20))).toBeFalse();
        expect(
          monthCompare.isBetween(current, new Date(2022, 2, 20), new Date(2022, 3, 20))
        ).toBeFalse();
      });
    });

    describe('isEqualOrBefore', () => {
      it('should be true', () => {
        const current = new Date(2022, 2, 15);
        expect(monthCompare.isEqualOrBefore(current, new Date(2022, 2, 20))).toBeTrue();
        expect(monthCompare.isEqualOrBefore(current, new Date(2022, 3, 20))).toBeTrue();
      });

      it('should be false', () => {
        const current = new Date(2022, 2, 15);
        expect(monthCompare.isEqualOrBefore(current, new Date(2022, 1, 20))).toBeFalse();
      });
    });
  });

  describe('YearCompareAdapter', () => {
    const yearCompare = new YearCompareAdapter();
    describe('isBetween', () => {
      it('should be true', () => {
        const current = new Date(2022, 2, 15);
        expect(yearCompare.isBetween(current, new Date(2021, 2, 20))).toBeTrue();
        expect(
          yearCompare.isBetween(current, new Date(2021, 2, 20), new Date(2023, 2, 20))
        ).toBeTrue();
      });

      it('should be false', () => {
        const current = new Date(2022, 2, 15);
        expect(yearCompare.isBetween(current, undefined, new Date(2021, 2, 20))).toBeFalse();
        expect(
          yearCompare.isBetween(current, new Date(2022, 2, 20), new Date(2022, 3, 20))
        ).toBeFalse();
      });
    });

    describe('isEqualOrBefore', () => {
      it('should be true', () => {
        const current = new Date(2022, 2, 15);
        expect(yearCompare.isEqualOrBefore(current, new Date(2022, 2, 20))).toBeTrue();
        expect(yearCompare.isEqualOrBefore(current, new Date(2023, 2, 20))).toBeTrue();
      });

      it('should be false', () => {
        const current = new Date(2022, 2, 15);
        expect(yearCompare.isEqualOrBefore(current, new Date(2021, 2, 20))).toBeFalse();
        expect(yearCompare.isEqualOrBefore(current, undefined)).toBeFalse();
      });
    });
  });
});
