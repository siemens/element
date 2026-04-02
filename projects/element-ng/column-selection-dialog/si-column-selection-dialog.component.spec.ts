/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, twoWayBinding, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalRef } from '@siemens/element-ng/modal';
import { afterEach } from 'vitest';

import { SiColumnSelectionDialogComponent } from './si-column-selection-dialog.component';
import { Column } from './si-column-selection-dialog.types';

describe('ColumnDialogComponent', () => {
  let fixture: ComponentFixture<SiColumnSelectionDialogComponent>;
  let element: HTMLElement;
  let modalRef: ModalRef<any, any>;
  let columns: WritableSignal<Column[]>;
  let restoreEnabled: WritableSignal<boolean>;

  const headerData: Column[] = [
    {
      id: 'firstRow',
      title: 'first row',
      visible: true,
      draggable: false,
      disabled: false,
      editable: true
    },
    {
      id: 'secondRow',
      title: 'second row',
      visible: true,
      draggable: true,
      disabled: false
    },
    {
      id: 'thirdRow',
      title: 'third row',
      visible: true,
      draggable: true,
      disabled: false
    },
    {
      id: 'fourthRow',
      title: 'fourth row',
      visible: true,
      draggable: false,
      disabled: false
    },
    {
      id: 'fifthRow',
      title: 'fifth row',
      visible: true,
      draggable: true,
      disabled: false
    }
  ];
  const cloneData = (): Column[] => JSON.parse(JSON.stringify(headerData)) as Column[];

  const moveItem = (index: number, dir: 'Up' | 'Down'): boolean =>
    element
      .querySelector<HTMLElement>(`si-column-selection-editor:nth-child(${index + 1})`)!
      .dispatchEvent(new KeyboardEvent('keydown', { key: `Arrow${dir}`, altKey: true }));

  const textOfItem = (index: number): string =>
    element.querySelector<HTMLElement>(
      `si-column-selection-editor:nth-child(${index + 1}) .form-control`
    )!.textContent ?? '';

  const toggleItem = (index: number): void =>
    element
      .querySelector<HTMLElement>(`si-column-selection-editor:nth-child(${index + 1}) .btn-circle`)!
      .click();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModalRef]
    }).compileComponents();
    modalRef = TestBed.inject(ModalRef);

    columns = signal<Column[]>([]);
    restoreEnabled = signal(false);

    fixture = TestBed.createComponent(SiColumnSelectionDialogComponent, {
      bindings: [twoWayBinding('columns', columns), inputBinding('restoreEnabled', restoreEnabled)]
    });
    element = fixture.nativeElement;
  });

  afterEach(() => vi.useRealTimers());

  it('should create', async () => {
    columns.set(cloneData());
    await fixture.whenStable();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should create backup data', async () => {
    const backupSpy = vi.spyOn(fixture.componentInstance as any, 'setupColumnData');
    columns.set(cloneData());
    await fixture.whenStable();

    expect(backupSpy).toHaveBeenCalled();
  });

  it('should emit result on submit', async () => {
    vi.spyOn(modalRef, 'hide');
    columns.set(cloneData());
    await fixture.whenStable();

    columns()[0].visible = !columns()[0].visible;
    element.querySelector<HTMLButtonElement>('.btn-primary')!.click();

    expect(modalRef.hide).toHaveBeenCalledWith({
      type: 'ok',
      columns: columns()
    });
  });

  it('should emit result on cancel', async () => {
    vi.spyOn(modalRef, 'hide');
    columns.set(headerData.map(i => ({ ...i })));
    await fixture.whenStable();

    columns()[0].visible = !columns()[0].visible;
    element.querySelector<HTMLButtonElement>('.btn-secondary')!.click();

    expect(modalRef.hide).toHaveBeenCalledWith({
      type: 'cancel',
      columns: headerData
    });
  });

  it('should emit result on restore default', async () => {
    const spy = vi.spyOn(modalRef.hidden, 'next');
    columns.set(headerData);
    restoreEnabled.set(true);
    await fixture.whenStable();

    columns()[0].visible = !columns()[0].visible;
    element.querySelector<HTMLButtonElement>('.btn.btn-tertiary.me-auto')!.click();

    expect(modalRef.hidden.next).toHaveBeenCalledWith({
      type: 'restoreDefault',
      columns: columns(),
      updateColumns: expect.any(Function)
    });

    vi.mocked(spy).mock.lastCall![0]!.updateColumns!([]);
    expect(columns()).toEqual([]);
    expect((fixture.componentInstance as any).visibleIds).toEqual([]);
  });

  it('should not have restore default button', async () => {
    columns.set(headerData);
    restoreEnabled.set(false);
    await fixture.whenStable();

    expect(
      element.querySelector<HTMLButtonElement>('.btn.btn-tertiary.me-auto')
    ).not.toBeInTheDocument();
  });

  it('should emit result on visibility change', async () => {
    vi.spyOn(modalRef.hidden, 'next');
    columns.set(cloneData());
    await fixture.whenStable();

    toggleItem(1);

    // Only the first item is toggled
    const expectedData = cloneData().map((item, index) => ({
      ...item,
      visible: index === 1 ? false : item.visible
    }));

    expect(modalRef.hidden.next).toHaveBeenCalledWith({
      type: 'instant',
      columns: expectedData
    });
  });

  it('should not force columns to be draggable if first and last are', async () => {
    columns.set(headerData);
    await fixture.whenStable();

    const dragItems = element.querySelectorAll('.cdk-drag');

    expect(
      Array.from(dragItems).every(dragItem => dragItem.classList.contains('cdk-drag-disabled'))
    ).toBe(false);
  });

  it('should not force columns to be draggable if previous/next are', async () => {
    const otherHeaderData = [...headerData];
    otherHeaderData[0] = { ...otherHeaderData[0], draggable: false };
    otherHeaderData[otherHeaderData.length - 1] = {
      ...otherHeaderData[otherHeaderData.length - 1],
      draggable: false
    };
    columns.set(otherHeaderData);
    await fixture.whenStable();

    const dragItems = Array.from(element.querySelectorAll('.cdk-drag'));

    expect(
      dragItems
        .slice(1, dragItems.length - 1)
        .every(dragItem => !dragItem.classList.contains('cdk-drag-disabled'))
    ).toBe(false);
  });

  it('should move items on drop', async () => {
    columns.set(cloneData());
    await fixture.whenStable();

    expect(textOfItem(1)).toBe('second row');
    expect(textOfItem(2)).toBe('third row');
    const event = new Event('cdkDropListDropped');
    Object.defineProperty(event, 'currentIndex', { get: () => 1 });
    Object.defineProperty(event, 'previousIndex', { get: () => 2 });
    element.querySelector('.modal-body div')?.dispatchEvent(event);
    await fixture.whenStable();

    expect(textOfItem(1)).toBe('third row');
    expect(textOfItem(2)).toBe('second row');
  });

  it('should rename a column', async () => {
    const spy = vi.spyOn(modalRef.hidden, 'next');
    columns.set(cloneData());
    await fixture.whenStable();

    document
      .querySelector<HTMLSpanElement>('si-column-selection-editor span.form-control')!
      .click();
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const inputField = document.querySelector<HTMLInputElement>(
      'si-column-selection-editor input.form-control'
    )!;
    inputField.value = 'New Column Name';
    inputField.dispatchEvent(new Event('input'));
    expect(spy).toHaveBeenCalledWith({
      type: 'instant',
      columns: expect.arrayContaining([
        expect.objectContaining({
          id: 'firstRow',
          title: 'New Column Name'
        })
      ])
    });

    inputField.dispatchEvent(new Event('blur'));
    expect(
      document.querySelector<HTMLSpanElement>('si-column-selection-editor span.form-control')
    ).toBeInTheDocument();
  });

  it('should toggle edit mode with keyboard', async () => {
    const spy = vi.spyOn(modalRef.hidden, 'next');
    vi.useFakeTimers();
    columns.set(cloneData());
    await fixture.whenStable();
    document
      .querySelector<HTMLSpanElement>('si-column-selection-editor')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    vi.advanceTimersToNextFrame();
    await fixture.whenStable();
    expect(spy).not.toHaveBeenCalled();
    const inputField = document.querySelector<HTMLInputElement>(
      'si-column-selection-editor input.form-control'
    )!;
    expect(inputField).toBeInTheDocument();
    inputField.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    vi.advanceTimersToNextFrame();
    await fixture.whenStable();
    expect(
      document.querySelector<HTMLInputElement>('si-column-selection-editor input.form-control')
    ).not.toBeInTheDocument();
    expect(document.activeElement).toBe(
      document.querySelector<HTMLSpanElement>('si-column-selection-editor')
    );
  });

  describe('using a keyboard', () => {
    beforeEach(async () => {
      columns.set(cloneData());
      await fixture.whenStable();
    });

    it('should move an item up', async () => {
      moveItem(2, 'Up');
      await fixture.whenStable();
      expect(textOfItem(1)).toBe('third row');
    });

    it('should move an item down', async () => {
      moveItem(1, 'Down');
      await fixture.whenStable();
      expect(textOfItem(1)).toBe('third row');
    });

    it('should skip non-draggable items in between', async () => {
      moveItem(4, 'Up');
      await fixture.whenStable();
      expect(textOfItem(2)).toBe('fifth row');
    });

    it('should not move an item if no next draggable item is found', async () => {
      moveItem(1, 'Up');
      await fixture.whenStable();
      expect(textOfItem(1)).toBe('second row');
    });
  });
});
