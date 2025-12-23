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
        expect(dayCompare.isEqualOrBetween(current)).toBe(true);
        expect(dayCompare.isEqualOrBetween(current, new Date(2022, 2, 15))).toBe(true);
        expect(
          dayCompare.isEqualOrBetween(current, new Date(2022, 2, 15), new Date(2022, 2, 15))
        ).toBe(true);
        expect(dayCompare.isEqualOrBetween(current, new Date(2022, 2, 14))).toBe(true);
        expect(
          dayCompare.isEqualOrBetween(current, new Date(2022, 2, 14), new Date(2022, 2, 16))
        ).toBe(true);
        expect(dayCompare.isEqualOrBetween(current, undefined, new Date(2022, 2, 15))).toBe(true);
        expect(dayCompare.isEqualOrBetween(current, undefined, new Date(2022, 2, 16))).toBe(true);
      });
    });
  });

  describe('MonthCompareAdapter', () => {
    const monthCompare = new MonthCompareAdapter();
    describe('isAfter', () => {
      it('should be true', () => {
        const current = new Date(2022, 2, 15);
        expect(monthCompare.isAfter(current, new Date(2022, 1, 15))).toBe(true);
      });

      it('should be false', () => {
        const current = new Date(2022, 2, 15);
        expect(monthCompare.isAfter(current, new Date(2022, 2, 14))).toBe(false);
      });
    });

    describe('isBetween', () => {
      it('should be true', () => {
        const current = new Date(2022, 2, 15);
        expect(monthCompare.isBetween(current)).toBe(true);
        expect(monthCompare.isBetween(current, new Date(2022, 1, 20))).toBe(true);
        expect(monthCompare.isBetween(current, undefined, new Date(2022, 3, 20))).toBe(true);
        expect(monthCompare.isBetween(current, new Date(2022, 1, 20), new Date(2022, 3, 20))).toBe(
          true
        );
      });

      it('should be false', () => {
        const current = new Date(2022, 2, 15);
        expect(monthCompare.isBetween(current, new Date(2022, 2, 20))).toBe(false);
        expect(monthCompare.isBetween(current, undefined, new Date(2022, 2, 20))).toBe(false);
        expect(monthCompare.isBetween(current, new Date(2022, 2, 20), new Date(2022, 3, 20))).toBe(
          false
        );
      });
    });

    describe('isEqualOrBefore', () => {
      it('should be true', () => {
        const current = new Date(2022, 2, 15);
        expect(monthCompare.isEqualOrBefore(current, new Date(2022, 2, 20))).toBe(true);
        expect(monthCompare.isEqualOrBefore(current, new Date(2022, 3, 20))).toBe(true);
      });

      it('should be false', () => {
        const current = new Date(2022, 2, 15);
        expect(monthCompare.isEqualOrBefore(current, new Date(2022, 1, 20))).toBe(false);
      });
    });
  });

  describe('YearCompareAdapter', () => {
    const yearCompare = new YearCompareAdapter();
    describe('isBetween', () => {
      it('should be true', () => {
        const current = new Date(2022, 2, 15);
        expect(yearCompare.isBetween(current, new Date(2021, 2, 20))).toBe(true);
        expect(yearCompare.isBetween(current, new Date(2021, 2, 20), new Date(2023, 2, 20))).toBe(
          true
        );
      });

      it('should be false', () => {
        const current = new Date(2022, 2, 15);
        expect(yearCompare.isBetween(current, undefined, new Date(2021, 2, 20))).toBe(false);
        expect(yearCompare.isBetween(current, new Date(2022, 2, 20), new Date(2022, 3, 20))).toBe(
          false
        );
      });
    });

    describe('isEqualOrBefore', () => {
      it('should be true', () => {
        const current = new Date(2022, 2, 15);
        expect(yearCompare.isEqualOrBefore(current, new Date(2022, 2, 20))).toBe(true);
        expect(yearCompare.isEqualOrBefore(current, new Date(2023, 2, 20))).toBe(true);
      });

      it('should be false', () => {
        const current = new Date(2022, 2, 15);
        expect(yearCompare.isEqualOrBefore(current, new Date(2021, 2, 20))).toBe(false);
        expect(yearCompare.isEqualOrBefore(current, undefined)).toBe(false);
      });
    });
  });
});
