/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiApplicationHeaderComponent } from '../si-application-header.component';
import { SiLaunchpadFactoryComponent } from './si-launchpad-factory.component';

describe('SiLaunchpadFactory - Keyboard Navigation', () => {
  @Component({
    imports: [SiLaunchpadFactoryComponent],
    template: `<si-launchpad-factory [apps]="[]" />`
  })
  class TestHostComponent {}

  let fixture: ComponentFixture<TestHostComponent>;
  let component: SiLaunchpadFactoryComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: SiApplicationHeaderComponent, useValue: {} },
        provideZonelessChangeDetection()
      ]
    });

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.children[0].componentInstance;
  });

  const createMockApps = (positions: { top: number; left: number }[]): HTMLElement[] => {
    return positions.map(({ top, left }) => {
      const app = document.createElement('a');
      spyOn(app, 'getBoundingClientRect').and.returnValue({
        top,
        left,
        width: 100,
        height: 60
      } as DOMRect);
      return app;
    });
  };

  describe('getVerticalTargetIndex', () => {
    describe('single column layout', () => {
      const testCases: [number, boolean, number, string][] = [
        [2, false, 3, 'down to next'],
        [2, true, 1, 'up to previous'],
        [5, false, 0, 'down wrap to first'],
        [0, true, 5, 'up wrap to last']
      ];

      testCases.forEach(([from, isUp, expected, description]) => {
        it(`should navigate from ${from} ${isUp ? 'up' : 'down'} (${description})`, () => {
          const mockApps = createMockApps([
            { top: 0, left: 10 },
            { top: 80, left: 10 },
            { top: 160, left: 10 },
            { top: 240, left: 10 },
            { top: 320, left: 10 },
            { top: 400, left: 10 }
          ]);

          const result = (component as any).getVerticalTargetIndex(mockApps, from, isUp);
          expect(result).toBe(expected);
        });
      });
    });

    describe('grid layout (2x3)', () => {
      const gridPositions = [
        { top: 50, left: 10 },
        { top: 50, left: 130 },
        { top: 50, left: 250 }, // Row 0
        { top: 130, left: 10 },
        { top: 130, left: 130 },
        { top: 130, left: 250 } // Row 1
      ];

      const gridTestCases: [number, boolean, number, string][] = [
        [4, true, 1, 'up from row 1 to row 0'],
        [1, false, 4, 'down from row 0 to row 1'],
        [2, false, 5, 'down with exact alignment'],
        [1, true, 4, 'up wrap to bottom row'],
        [4, false, 1, 'down wrap to top row']
      ];

      gridTestCases.forEach(([from, isUp, expected, description]) => {
        it(`should navigate from ${from} ${isUp ? 'up' : 'down'} (${description})`, () => {
          const mockApps = createMockApps(gridPositions);
          const result = (component as any).getVerticalTargetIndex(mockApps, from, isUp);
          expect(result).toBe(expected);
        });
      });

      it('should stay in place for single row', () => {
        const singleRowApps = createMockApps([
          { top: 50, left: 10 },
          { top: 50, left: 130 },
          { top: 50, left: 250 }
        ]);

        const result = (component as any).getVerticalTargetIndex(singleRowApps, 1, false);
        expect(result).toBe(1);
      });
    });

    describe('tolerance handling', () => {
      it('should detect single column within leftTolerance (20px)', () => {
        const mockApps = createMockApps([
          { top: 0, left: 10 },
          { top: 80, left: 25 },
          { top: 160, left: 15 }
        ]);

        const result = (component as any).getVerticalTargetIndex(mockApps, 1, false);
        expect(result).toBe(2); // Sequential navigation
      });

      it('should detect same row within rowTolerance (10px)', () => {
        const mockApps = createMockApps([
          { top: 50, left: 10 },
          { top: 50, left: 130 },
          { top: 50, left: 250 }
        ]);

        const result = (component as any).getVerticalTargetIndex(mockApps, 1, false);
        expect(result).toBe(1); // No movement
      });
    });
  });
});
