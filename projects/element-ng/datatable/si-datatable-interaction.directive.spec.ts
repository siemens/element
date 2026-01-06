/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

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
      [rows]="rows"
      [columns]="columns"
      [headerHeight]="tableConfig.headerHeight"
      [footerHeight]="0"
      [rowHeight]="tableConfig.rowHeightSmall"
      [externalPaging]="false"
      [selectionType]="selectionType"
      [count]="rows.length"
      [virtualization]="virtualization"
      [scrollbarV]="true"
      [datatableInteractionAutoSelect]="datatableInteractionAutoSelect"
      [(selected)]="selected"
    />
  `
})
class WrapperComponent {
  selectionType: 'single' | 'multi' | 'multiClick' | 'cell' | undefined = 'multi';
  virtualization = false;
  datatableInteractionAutoSelect = false;
  selected: any[] = [];

  tableConfig = SI_DATATABLE_CONFIG;
  rows: any[] = [];
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
    for (let i = 1; i <= 250; i++) {
      this.rows.push({
        id: i,
        firstname: 'First ' + i,
        lastname: 'Last ' + i,
        age: 50
      });
    }
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
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const keypress = async (key: string, keyCode?: number): Promise<void> => {
    document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key, keyCode }));
    await refresh();
  };

  const arrowDown = async (times = 1): Promise<void> => {
    for (let i = 0; i < times; i++) {
      await keypress('ArrowDown', 40);
    }
  };

  const arrowUp = async (times = 1): Promise<void> => {
    for (let i = 0; i < times; i++) {
      await keypress('ArrowUp', 38);
    }
  };

  const getTableElement = (): HTMLElement => wrapperElement.firstElementChild as HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        SiDatatableModule,
        NgxDatatableModule.forRoot(SI_DATATABLE_CONFIG),
        WrapperComponent
      ],
      providers: [provideZonelessChangeDetection()]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    wrapperComponent = fixture.componentInstance;
    wrapperElement = fixture.nativeElement;
  });

  it('should navigate into table using arrow keys', async () => {
    await refresh();

    // Skip test when browser is not focussed to prevent failures.
    if (document.hasFocus()) {
      getTableElement().focus();

      expect(document.activeElement).toBe(getTableElement());

      await arrowDown();

      expect(document.activeElement).toBe(
        getTableElement().querySelector('.datatable-row-wrapper > .datatable-body-row')
      );

      getTableElement().focus();

      expect(document.activeElement).toBe(getTableElement());

      await arrowUp();

      expect(document.activeElement).toBe(
        getTableElement().querySelector('.datatable-row-wrapper:last-child > .datatable-body-row')
      );
    }
  });

  it('should navigate into and inside arrow keys when using virtualization', async () => {
    wrapperComponent.virtualization = true;
    await refresh();

    // Skip test when browser is not focussed to prevent failures.
    if (document.hasFocus()) {
      getTableElement().focus();

      expect(document.activeElement).toBe(getTableElement());

      await arrowDown();

      expect(document.activeElement).toBe(
        getTableElement().querySelector('.datatable-row-wrapper > .datatable-body-row')
      );

      await arrowDown(8);

      const scrollTopBeforeDown = getTableElement().querySelector('.datatable-body')!.scrollTop;

      await arrowDown();

      expect(getTableElement().querySelector('.datatable-body')!.scrollTop).not.toBe(
        scrollTopBeforeDown
      );

      getTableElement().focus();

      expect(document.activeElement).toBe(getTableElement());

      await arrowUp();

      expect(document.activeElement).toBe(
        getTableElement().querySelector('.datatable-row-wrapper:last-child > .datatable-body-row')
      );

      await arrowUp(7);

      const scrollTopBeforeUp = getTableElement().querySelector('.datatable-body')!.scrollTop;

      await arrowUp();

      expect(getTableElement().querySelector('.datatable-body')!.scrollTop).not.toBe(
        scrollTopBeforeUp
      );
    }
  });

  it('should navigate into and inside table using arrow keys when using virtualization and cell selection', async () => {
    wrapperComponent.selectionType = 'cell';
    wrapperComponent.virtualization = true;
    await refresh();

    // Skip test when browser is not focussed to prevent failures.
    if (document.hasFocus()) {
      getTableElement().focus();

      expect(document.activeElement).toBe(getTableElement());

      await arrowDown();

      expect(document.activeElement).toBe(
        getTableElement().querySelector(
          '.datatable-row-wrapper > .datatable-body-row .datatable-body-cell'
        )
      );

      await arrowDown(8);

      const scrollTopBeforeDown = getTableElement().querySelector('.datatable-body')!.scrollTop;

      await arrowDown();

      expect(getTableElement().querySelector('.datatable-body')!.scrollTop).not.toBe(
        scrollTopBeforeDown
      );

      getTableElement().focus();

      expect(document.activeElement).toBe(getTableElement());

      await arrowUp();

      expect(document.activeElement).toBe(
        getTableElement().querySelector(
          '.datatable-row-wrapper:last-child > .datatable-body-row .datatable-body-cell'
        )
      );

      await arrowUp(7);

      const scrollTopBeforeUp = getTableElement().querySelector('.datatable-body')!.scrollTop;

      await arrowUp();

      expect(getTableElement().querySelector('.datatable-body')!.scrollTop).not.toBe(
        scrollTopBeforeUp
      );
    }
  });

  it('should auto select on focus when enabled', async () => {
    wrapperComponent.selectionType = 'single';
    wrapperComponent.datatableInteractionAutoSelect = true;
    await refresh();

    // Skip test when browser is not focussed to prevent failures.
    if (document.hasFocus()) {
      expect(wrapperComponent.selected).toHaveLength(0);

      const row = getTableElement().querySelector(
        '.datatable-row-wrapper > .datatable-body-row'
      ) as HTMLElement;
      row.dispatchEvent(new Event('focusin', { bubbles: true }));

      await refresh();

      expect(wrapperComponent.selected).toContain({
        id: 1,
        firstname: 'First 1',
        lastname: 'Last 1',
        age: 50
      });
    }
  });

  it('should not auto select on mouse click when enabled', async () => {
    wrapperComponent.selectionType = 'single';
    wrapperComponent.datatableInteractionAutoSelect = true;
    await refresh();

    // Skip test when browser is not focussed to prevent failures.
    if (document.hasFocus()) {
      expect(wrapperComponent.selected).toHaveLength(0);

      const table = getTableElement();

      table.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

      await refresh();

      const row = table.querySelector(
        '.datatable-row-wrapper > .datatable-body-row'
      ) as HTMLElement;
      row.dispatchEvent(new Event('focusin', { bubbles: true }));

      await refresh();

      expect(wrapperComponent.selected).toHaveLength(0);

      table.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

      await refresh();

      row.dispatchEvent(new Event('focusin', { bubbles: true }));

      await refresh();

      expect(wrapperComponent.selected).toContain({
        id: 1,
        firstname: 'First 1',
        lastname: 'Last 1',
        age: 50
      });
    }
  });
});
