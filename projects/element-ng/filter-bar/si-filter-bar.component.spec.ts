/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Filter, SiFilterBarComponent } from './index';

@Component({
  imports: [SiFilterBarComponent],
  template: `
    <si-filter-bar
      class="d-block"
      [style.width.px]="width"
      [filters]="filters()"
      [allowReset]="allowReset"
      [resetText]="resetText"
      [disabled]="disabled"
      (filtersChange)="filtersChange($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly filterBar = viewChild.required(SiFilterBarComponent);
  readonly filters = signal<Filter[]>([]);
  allowReset = false;
  resetText = '';
  disabled = false;
  width = 600;
  filtersChange(event: Filter[]): void {
    this.filters.set(event);
  }
}

describe('SiFilterBarComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let element: HTMLElement;
  const timeout = async (ms?: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

  const removeButtons = (): HTMLElement[] =>
    Array.from(element.querySelectorAll<HTMLElement>('[aria-label="Remove"]'));

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents()
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should not show empty indicator when filters are active', () => {
    component.filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      }
    ]);
    fixture.detectChanges();
    expect(!component.filterBar().filters().length).toBeFalsy();
  });

  it('should not display reset button when responsive is set and allow reset is false', () => {
    component.filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      }
    ]);
    component.allowReset = false;
    fixture.detectChanges();
    expect(element.querySelector('button.text-nowrap')).toBeNull();
  });

  it('should not display reset button when allow reset is set', () => {
    component.filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      }
    ]);
    component.allowReset = false;
    fixture.detectChanges();

    expect(element.querySelector('button.text-nowrap')).toBeNull();
  });

  it('should correctly display reset button when responsive and allowReset is set', () => {
    component.filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      }
    ]);
    component.allowReset = true;
    component.resetText = 'reset test';
    fixture.detectChanges();

    const resetButton = element.querySelector('button.text-nowrap') as HTMLButtonElement;

    expect(resetButton).not.toBeNull();
    expect(resetButton?.innerText).toBe(component.resetText);
  });

  it('should disable reset button when disabled and responsive and allowReset is set', () => {
    component.filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      }
    ]);
    component.allowReset = true;
    component.disabled = true;
    fixture.detectChanges();

    const resetButton = element.querySelector('button') as HTMLButtonElement;

    expect(resetButton?.disabled).toBeTrue();
  });

  it('should show empty indicator when no filters are active', () => {
    component.filters.set([]);
    fixture.detectChanges();
    expect(!component.filterBar().filters().length).toBeTruthy();
  });

  it('should emit a change event when modified', () => {
    spyOn(component, 'filtersChange').and.callThrough();
    component.filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      },
      {
        filterName: 'country',
        title: 'Country',
        description: 'USA',
        status: 'info'
      }
    ]);
    fixture.detectChanges();
    element.querySelector<HTMLElement>('[aria-label="Remove"]')!.click();

    expect(component.filtersChange).toHaveBeenCalledWith([
      {
        filterName: 'country',
        title: 'Country',
        description: 'USA',
        status: 'info'
      }
    ]);
    expect(component.filters()).toEqual([
      {
        filterName: 'country',
        title: 'Country',
        description: 'USA',
        status: 'info'
      }
    ]);
  });

  it('should clear the applied filters on reset', () => {
    component.filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      }
    ]);
    component.allowReset = true;
    fixture.detectChanges();
    element.querySelector<HTMLElement>('button.text-nowrap')!.click();
    fixture.detectChanges();
    expect(element.querySelector('button.text-nowrap')).toBeFalsy();
  });

  it('should emit a change event when modified from inside', () => {
    spyOn(component, 'filtersChange').and.callThrough();
    component.filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      },
      {
        filterName: 'country',
        title: 'Country',
        description: 'USA',
        status: 'info'
      }
    ]);
    fixture.detectChanges();
    removeButtons().at(1)!.click();

    expect(component.filtersChange).toHaveBeenCalled();
    expect(component.filters()).toEqual([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      }
    ]);
  });

  it('should emit a change event when modified from filter group while using responsive', async () => {
    spyOn(component, 'filtersChange').and.callThrough();
    component.width = 650;
    component.filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      },
      {
        filterName: 'country1',
        title: 'First Country',
        description: 'USA',
        status: 'info'
      },
      {
        filterName: 'country2',
        title: 'Second Country',
        description: 'IO',
        status: 'info'
      },
      {
        filterName: 'country3',
        title: 'Third Country',
        description: 'TC',
        status: 'info'
      },
      {
        filterName: 'lastCountry',
        title: 'Last Country',
        description: 'CH',
        status: 'info'
      }
    ]);
    fixture.detectChanges();
    await timeout(200);
    fixture.detectChanges();
    expect(component.filters().length).toEqual(5);
    removeButtons().at(-1)!.click();

    expect(component.filtersChange).toHaveBeenCalled();
    expect(component.filters().length).toEqual(3);
  });

  it('should not display too many filters when responsive is enabled', async () => {
    component.width = 650;
    component.filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      },
      {
        filterName: 'country',
        title: 'Country',
        description: 'USA',
        status: 'info'
      },
      {
        filterName: 'country',
        title: 'Country',
        description: 'IO',
        status: 'info'
      },
      {
        filterName: 'country',
        title: 'Country',
        description: 'TC',
        status: 'info'
      },
      {
        filterName: 'lastCountry',
        title: 'Last Country',
        description: 'CH',
        status: 'info'
      }
    ]);
    fixture.detectChanges();
    await timeout(200);
    fixture.detectChanges();
    const values = element.querySelectorAll<HTMLElement>('si-filter-pill .value');
    expect(values[values.length - 1].innerHTML).toContain('+ 1 filters');
  });

  it('should not display too many filters when responsive is enabled and allow reset disabled', async () => {
    component.width = 600;
    component.filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      },
      {
        filterName: 'country',
        title: 'Country',
        description: 'USA',
        status: 'info'
      },
      {
        filterName: 'country',
        title: 'Country',
        description: 'IO',
        status: 'info'
      },
      {
        filterName: 'country',
        title: 'Country',
        description: 'TC',
        status: 'info'
      },
      {
        filterName: 'lastCountry',
        title: 'Last Country',
        description: 'CH',
        status: 'info'
      }
    ]);
    component.allowReset = false;
    fixture.detectChanges();
    await timeout(200);
    fixture.detectChanges();
    const values = element.querySelectorAll<HTMLElement>('si-filter-pill .value');
    expect(values[values.length - 1].innerHTML).toBe('+ 2 filters');
  });
});
