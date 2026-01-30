/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, DebugElement, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SiGridCellDirective } from './si-grid-cell.directive';
import { SiGridDirective } from './si-grid.directive';

@Component({
  imports: [SiGridDirective, SiGridCellDirective],
  template: `
    <div siGrid [style]="gridStyle()" [colWrap]="colWrap()" [rowWrap]="rowWrap()">
      <button siGridCell type="button" class="btn btn-secondary">Cell 1</button>
      <button siGridCell type="button" class="btn btn-secondary">Cell 2</button>
      <button siGridCell type="button" class="btn btn-secondary">Cell 3</button>
      <button siGridCell type="button" class="btn btn-secondary">Cell 4</button>
      <button siGridCell type="button" class="btn btn-secondary">Cell 5</button>
      <button siGridCell type="button" class="btn btn-secondary">Cell 6</button>
    </div>
  `
})
class TestGridComponent {
  readonly colWrap = signal<'nowrap' | 'continuous' | 'loop'>('nowrap');
  readonly rowWrap = signal<'nowrap' | 'continuous' | 'loop'>('nowrap');
  readonly columns = signal(3);
  readonly gridStyle = computed(
    () => `display: grid; grid-template-columns: repeat(${this.columns()}, 1fr);`
  );
}

describe('SiGridDirective', () => {
  let fixture: ComponentFixture<TestGridComponent>;
  let gridElement: HTMLElement;

  const getCells = (): DebugElement[] => fixture.debugElement.queryAll(By.css('[siGridCell]'));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestGridComponent);
    gridElement = fixture.nativeElement.querySelector('[siGrid]');
    fixture.detectChanges();
  });

  describe('with no wrap', () => {
    it('should navigate left with ArrowLeft', () => {
      const cells = getCells();
      cells[2].nativeElement.focus();

      gridElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      fixture.detectChanges();

      expect(cells[1].nativeElement.tabIndex).toBe(0);
      expect(cells[2].nativeElement.tabIndex).toBe(-1);
    });

    it('should navigate right with ArrowRight', () => {
      const cells = getCells();
      cells[0].nativeElement.focus();

      gridElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      fixture.detectChanges();

      expect(cells[1].nativeElement.tabIndex).toBe(0);
      expect(cells[0].nativeElement.tabIndex).toBe(-1);
    });

    it('should navigate up with ArrowUp', () => {
      const cells = getCells();
      cells[4].nativeElement.focus();

      gridElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      fixture.detectChanges();

      expect(cells[1].nativeElement.tabIndex).toBe(0);
      expect(cells[4].nativeElement.tabIndex).toBe(-1);
    });

    it('should navigate down with ArrowDown', () => {
      const cells = getCells();
      cells[1].nativeElement.focus();

      gridElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      fixture.detectChanges();

      expect(cells[4].nativeElement.tabIndex).toBe(0);
      expect(cells[1].nativeElement.tabIndex).toBe(-1);
    });

    it('should not wrap when navigating right at end of row', () => {
      const cells = getCells();
      cells[2].nativeElement.focus();

      gridElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      fixture.detectChanges();

      expect(cells[2].nativeElement.tabIndex).toBe(0);
    });
  });
});
