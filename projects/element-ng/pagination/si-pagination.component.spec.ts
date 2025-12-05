/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { SiPaginationComponent as TestComponent } from '.';

describe('SiPaginationComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;

  const getItems = (): NodeListOf<HTMLElement> =>
    element.querySelectorAll('li:not(:is(:first-child, :last-child)) .page-item:not(.separator)');
  const getNavButtons = (): NodeListOf<HTMLButtonElement> =>
    element.querySelectorAll('li:is(:first-child, :last-child) .page-item');
  const getSeparators = (): NodeListOf<HTMLElement> => element.querySelectorAll('.separator');
  const getCurrentItem = (): HTMLElement =>
    element.querySelector('.page-item.active') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, TestComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.componentRef.setInput('forwardButtonText', 'forward');
    fixture.componentRef.setInput('backButtonText', 'back');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('show all items when <= 7 pages', () => {
    fixture.componentRef.setInput('totalPages', 7);
    fixture.componentRef.setInput('currentPage', 3);

    fixture.detectChanges();

    expect(getItems().length).toBe(7);
    expect(getSeparators().length).toBe(0);
  });

  it('show separator on end', () => {
    fixture.componentRef.setInput('totalPages', 20);
    fixture.componentRef.setInput('currentPage', 4);

    fixture.detectChanges();

    expect(getItems().length).toBe(6);
    expect(getSeparators().length).toBe(1);
    expect(getCurrentItem().innerHTML).toContain('4');
  });

  it('show separator on end', () => {
    fixture.componentRef.setInput('totalPages', 20);
    fixture.componentRef.setInput('currentPage', 17);

    fixture.detectChanges();

    expect(getItems().length).toBe(6);
    expect(getSeparators().length).toBe(1);
    expect(getCurrentItem().innerHTML).toContain('17');
  });

  it('show separator on both sides', () => {
    fixture.componentRef.setInput('totalPages', 20);
    fixture.componentRef.setInput('currentPage', 9);

    fixture.detectChanges();

    expect(getItems().length).toBe(5);
    expect(getSeparators().length).toBe(2);
    expect(getCurrentItem().innerHTML).toContain('9');
  });

  it('should enable/disable buttons', () => {
    fixture.componentRef.setInput('totalPages', 3);
    fixture.componentRef.setInput('currentPage', 1);

    fixture.detectChanges();

    let buttons = getNavButtons();

    expect(buttons.item(0).disabled).toBe(true);
    expect(buttons.item(1).disabled).toBe(false);
    expect(getCurrentItem().innerHTML).toContain('1');

    (buttons.item(1) as HTMLElement).click();
    fixture.detectChanges();

    buttons = getNavButtons();
    expect(buttons.item(0).disabled).toBe(false);
    expect(buttons.item(1).disabled).toBe(false);
    expect(getCurrentItem().innerHTML).toContain('2');

    (buttons.item(1) as HTMLElement).click();
    fixture.detectChanges();

    buttons = getNavButtons();
    expect(buttons.item(0).disabled).toBe(false);
    expect(buttons.item(1).disabled).toBe(true);
    expect(getCurrentItem().innerHTML).toContain('3');
  });
});
