/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalRef } from '@spike-rabbit/element-ng/modal';

import { SiColumnSelectionDialogComponent } from './si-column-selection-dialog.component';
import { Column } from './si-column-selection-dialog.types';

describe('ColumnDialogComponent', () => {
  let component: SiColumnSelectionDialogComponent;
  let componentRef: ComponentRef<SiColumnSelectionDialogComponent>;
  let element: HTMLElement;
  let fixture: ComponentFixture<SiColumnSelectionDialogComponent>;
  let modalRef: ModalRef<any, any>;
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
    })
      .overrideComponent(SiColumnSelectionDialogComponent, {
        set: { changeDetection: ChangeDetectionStrategy.Default }
      })
      .compileComponents();
    modalRef = TestBed.inject(ModalRef);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiColumnSelectionDialogComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    element = fixture.nativeElement;
  });

  it('should create', () => {
    component.columns.set(cloneData());
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should create backup data', () => {
    component.columns.set(cloneData());

    const backupSpy: jasmine.Spy = spyOn(component as any, 'setupColumnData');

    fixture.detectChanges();

    expect(backupSpy).toHaveBeenCalled();
  });

  it('should emit result on submit', () => {
    spyOn(modalRef, 'hide');
    component.columns.set(cloneData());
    fixture.detectChanges();

    component.columns()[0].visible = !component.columns()[0].visible;
    element.querySelector<HTMLButtonElement>('.btn-primary')!.click();

    expect(modalRef.hide).toHaveBeenCalledWith({
      type: 'ok',
      columns: component.columns()
    });
  });

  it('should emit result on cancel', () => {
    spyOn(modalRef, 'hide');
    component.columns.set(headerData.map(i => ({ ...i })));
    fixture.detectChanges();

    component.columns()[0].visible = !component.columns()[0].visible;
    element.querySelector<HTMLButtonElement>('.btn-secondary')!.click();

    expect(modalRef.hide).toHaveBeenCalledWith({
      type: 'cancel',
      columns: headerData
    });
  });

  it('should emit result on restore default', () => {
    const spy = spyOn(modalRef.hidden, 'next');
    component.columns.set(headerData);
    componentRef.setInput('restoreEnabled', true);
    fixture.detectChanges();

    component.columns()[0].visible = !component.columns()[0].visible;
    element.querySelector<HTMLButtonElement>('.btn.btn-tertiary.me-auto')!.click();

    expect(modalRef.hidden.next).toHaveBeenCalledWith({
      type: 'restoreDefault',
      columns: component.columns(),
      updateColumns: jasmine.any(Function)
    });

    spy.calls.mostRecent().args[0]!.updateColumns!([]);
    expect(component.columns()).toEqual([]);
    expect((component as any).visibleIds).toEqual([]);
  });

  it('should not have restore default button', () => {
    component.columns.set(headerData);
    componentRef.setInput('restoreEnabled', false);
    fixture.detectChanges();
    expect(element.querySelector<HTMLButtonElement>('.btn.btn-tertiary.me-auto')).toBeNull();
  });

  it('should emit result on visibility change', () => {
    spyOn(modalRef.hidden, 'next');
    component.columns.set(cloneData());
    fixture.detectChanges();

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

  it('should not force columns to be draggable if first and last are', () => {
    component.columns.set(headerData);
    fixture.detectChanges();

    const dragItems = element.querySelectorAll('.cdk-drag');

    expect(
      Array.from(dragItems).every(dragItem => dragItem.classList.contains('cdk-drag-disabled'))
    ).toBeFalse();
  });

  it('should not force columns to be draggable if previous/next are', () => {
    const otherHeaderData = [...headerData];
    otherHeaderData[0] = { ...otherHeaderData[0], draggable: false };
    otherHeaderData[otherHeaderData.length - 1] = {
      ...otherHeaderData[otherHeaderData.length - 1],
      draggable: false
    };
    component.columns.set(otherHeaderData);
    fixture.detectChanges();

    const dragItems = Array.from(element.querySelectorAll('.cdk-drag'));

    expect(
      dragItems
        .slice(1, dragItems.length - 1)
        .every(dragItem => !dragItem.classList.contains('cdk-drag-disabled'))
    ).toBeFalse();
  });

  it('should move items on drop', () => {
    component.columns.set(cloneData());
    fixture.detectChanges();

    expect(textOfItem(1)).toBe('second row');
    expect(textOfItem(2)).toBe('third row');
    const event = new Event('cdkDropListDropped');
    Object.defineProperty(event, 'currentIndex', { get: () => 1 });
    Object.defineProperty(event, 'previousIndex', { get: () => 2 });
    element.querySelector('.modal-body div')?.dispatchEvent(event);
    fixture.detectChanges();

    expect(textOfItem(1)).toBe('third row');
    expect(textOfItem(2)).toBe('second row');
  });

  it('should rename a column', async () => {
    const spy = spyOn(modalRef.hidden, 'next');
    component.columns.set(cloneData());
    fixture.detectChanges();
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
      columns: jasmine.arrayContaining([
        jasmine.objectContaining({
          id: 'firstRow',
          title: 'New Column Name'
        })
      ])
    });

    inputField.dispatchEvent(new Event('blur'));
    expect(
      document.querySelector<HTMLSpanElement>('si-column-selection-editor span.form-control')
    ).toBeTruthy();
  });

  it('should toggle edit mode with keyboard', async () => {
    const spy = spyOn(modalRef.hidden, 'next');
    component.columns.set(cloneData());
    fixture.autoDetectChanges();
    document
      .querySelector<HTMLSpanElement>('si-column-selection-editor')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await fixture.whenStable();
    expect(spy).not.toHaveBeenCalled();
    const inputField = document.querySelector<HTMLInputElement>(
      'si-column-selection-editor input.form-control'
    )!;
    expect(inputField).toBeTruthy();
    inputField.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(
      document.querySelector<HTMLInputElement>('si-column-selection-editor input.form-control')
    ).toBeFalsy();
    expect(document.activeElement).toBe(
      document.querySelector<HTMLSpanElement>('si-column-selection-editor')
    );
  });

  describe('using a keyboard', () => {
    beforeEach(() => {
      component.columns.set(cloneData());
      fixture.detectChanges();
    });

    it('should move an item up', () => {
      moveItem(2, 'Up');
      fixture.detectChanges();
      expect(textOfItem(1)).toBe('third row');
    });

    it('should move an item down', () => {
      moveItem(1, 'Down');
      fixture.detectChanges();
      expect(textOfItem(1)).toBe('third row');
    });

    it('should skip non-draggable items in between', () => {
      moveItem(4, 'Up');
      fixture.detectChanges();
      expect(textOfItem(2)).toBe('fifth row');
    });

    it('should not move an item if no next draggable item is found', () => {
      moveItem(1, 'Up');
      fixture.detectChanges();
      expect(textOfItem(1)).toBe('second row');
    });
  });
});
