/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { type MockInstance } from 'vitest';

import { SI_DATATABLE_CONFIG, SiDatatableModule } from '.';

@Component({
  imports: [SiDatatableModule, NgxDatatableModule],
  template: `
    <ngx-datatable
      style="height: 500px;"
      class="table-element"
      columnMode="force"
      siDatatableInteraction
      [cssClasses]="tableConfig.cssClasses"
      [rows]="rows()"
      [columns]="columns"
      [headerHeight]="tableConfig.headerHeight"
      [footerHeight]="0"
      [rowHeight]="tableConfig.rowHeightSmall"
      [externalPaging]="false"
      [selectionType]="selectionType()"
      [count]="rows().length"
      [virtualization]="virtualization()"
      [scrollbarV]="true"
      [datatableInteractionAutoSelect]="datatableInteractionAutoSelect()"
      [(selected)]="selected"
    />
  `,
  changeDetection: ChangeDetectionStrategy.Eager
})
class WrapperComponent {
  readonly selectionType = signal<'multi' | 'single' | 'cell'>('multi');
  readonly virtualization = signal(false);
  readonly datatableInteractionAutoSelect = signal(false);
  readonly selected = signal<any[]>([]);

  tableConfig = SI_DATATABLE_CONFIG;
  readonly rows = signal<any[]>([]);
  columns = [
    {
      prop: 'id',
      name: 'ID',
      width: 50,
      resizeable: false,
      canAutoResize: false
    },
    {
      prop: 'firstname',
      name: 'First Name',
      minWidth: 100,
      resizeable: true,
      canAutoResize: true
    },
    {
      prop: 'lastname',
      name: 'Last Name',
      minWidth: 100,
      resizeable: true,
      canAutoResize: true
    },
    {
      prop: 'age',
      name: 'Age',
      width: 80,
      resizeable: false,
      canAutoResize: false
    }
  ];

  constructor() {
    const rows = [];
    for (let i = 1; i <= 250; i++) {
      rows.push({
        id: i,
        firstname: 'First ' + i,
        lastname: 'Last ' + i,
        age: 50
      });
    }
    this.rows.set(rows);
  }
}

describe('SiDatatableInteractionDirective', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let wrapperComponent: WrapperComponent;
  let wrapperElement: HTMLElement;

  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const refresh = async (): Promise<void> => {
    vi.advanceTimersByTime(10000);
    await fixture.whenStable();
  };

  const keypress = async (key: string, target: HTMLElement): Promise<KeyboardEvent> => {
    const event = new KeyboardEvent('keydown', { key, cancelable: true });
    target.dispatchEvent(event);
    await refresh();
    return event;
  };

  const getTableElement = (): HTMLElement => wrapperElement.firstElementChild as HTMLElement;

  // Same selectors the directive uses to find the first and last row or cell.
  const edgeSelector = (edge: 'first' | 'last', cell: boolean): string =>
    `.datatable-row-wrapper${edge === 'last' ? ':last-child' : ''} > .datatable-body-row` +
    (cell ? ' .datatable-body-cell' : '');

  const queryTable = (selector: string): HTMLElement => {
    const element = getTableElement().querySelector<HTMLElement>(selector);
    expect(element).toBeInstanceOf(HTMLElement);
    return element!;
  };

  // Do not move real focus, so the outcome does not depend on whether the page has focus.
  const spyOnFocus = (element: HTMLElement): MockInstance<HTMLElement['focus']> =>
    vi.spyOn(element, 'focus').mockImplementation(() => {});

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        SiDatatableModule,
        NgxDatatableModule.forRoot(SI_DATATABLE_CONFIG),
        WrapperComponent
      ]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    wrapperComponent = fixture.componentInstance;
    wrapperElement = fixture.nativeElement;
  });

  it('should navigate into table using arrow keys', async () => {
    await refresh();
    const table = getTableElement();
    table.focus();
    expect(document.activeElement).toBe(table);

    using firstRowFocus = spyOnFocus(queryTable(edgeSelector('first', false)));
    using lastRowFocus = spyOnFocus(queryTable(edgeSelector('last', false)));

    expect(await keypress('ArrowDown', table)).toHaveProperty('defaultPrevented', true);
    expect(firstRowFocus).toHaveBeenCalledOnce();

    expect(await keypress('ArrowUp', table)).toHaveProperty('defaultPrevented', true);
    expect(lastRowFocus).toHaveBeenCalledOnce();
  });

  it.each([
    { selectionType: 'multi', cell: false, target: 'row' },
    { selectionType: 'cell', cell: true, target: 'cell' }
  ] as const)(
    'should navigate into table and scroll when focusing the edge $target with virtualization',
    async ({ selectionType, cell }) => {
      wrapperComponent.selectionType.set(selectionType);
      wrapperComponent.virtualization.set(true);
      await refresh();
      const table = getTableElement();
      const scrollContainer = queryTable('[datatableScrollContainer]');

      using firstFocus = spyOnFocus(queryTable(edgeSelector('first', cell)));
      expect(await keypress('ArrowDown', table)).toHaveProperty('defaultPrevented', true);
      expect(firstFocus).toHaveBeenCalledOnce();

      // Start scrolled so that both scrolling down and up can be observed.
      scrollContainer.scrollTop = 100;
      queryTable(edgeSelector('last', cell)).dispatchEvent(
        new FocusEvent('focusin', { bubbles: true })
      );
      await refresh();
      expect(scrollContainer.scrollTop).toBeGreaterThan(100);

      // Query again after scrolling, as virtualization may have re-rendered the rows.
      using lastFocus = spyOnFocus(queryTable(edgeSelector('last', cell)));
      expect(await keypress('ArrowUp', table)).toHaveProperty('defaultPrevented', true);
      expect(lastFocus).toHaveBeenCalledOnce();

      const scrollTopBeforeUp = scrollContainer.scrollTop;
      queryTable(edgeSelector('first', cell)).dispatchEvent(
        new FocusEvent('focusin', { bubbles: true })
      );
      await refresh();
      expect(scrollContainer.scrollTop).toBeLessThan(scrollTopBeforeUp);
    }
  );

  it('should auto select on focus when enabled', async () => {
    wrapperComponent.selectionType.set('single');
    wrapperComponent.datatableInteractionAutoSelect.set(true);
    await refresh();
    expect(wrapperComponent.selected()).toHaveLength(0);

    const row = getTableElement().querySelector(
      '.datatable-row-wrapper > .datatable-body-row'
    ) as HTMLElement;
    row.dispatchEvent(new Event('focusin', { bubbles: true }));

    await refresh();

    expect(wrapperComponent.selected()).toEqual([wrapperComponent.rows()[0]]);
  });

  it('should not auto select on mouse click when enabled', async () => {
    wrapperComponent.selectionType.set('single');
    wrapperComponent.datatableInteractionAutoSelect.set(true);
    await refresh();
    expect(wrapperComponent.selected()).toHaveLength(0);

    const table = getTableElement();

    table.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    await refresh();

    const row = table.querySelector('.datatable-row-wrapper > .datatable-body-row') as HTMLElement;
    row.dispatchEvent(new Event('focusin', { bubbles: true }));

    await refresh();

    expect(wrapperComponent.selected()).toHaveLength(0);

    table.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    await refresh();

    row.dispatchEvent(new Event('focusin', { bubbles: true }));

    await refresh();

    expect(wrapperComponent.selected()).toEqual([wrapperComponent.rows()[0]]);
  });
});
