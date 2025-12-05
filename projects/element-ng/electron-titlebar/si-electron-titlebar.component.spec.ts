/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuItem } from '@siemens/element-ng/menu';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SiElectrontitlebarComponent } from './si-electron-titlebar.component';

@Component({
  imports: [SiElectrontitlebarComponent],
  template: `
    <si-electron-titlebar
      [appTitle]="appTitle"
      [canGoBack]="canGoBack"
      [canGoForward]="canGoForward"
      [hasFocus]="hasFocus"
      [menuItems]="menuItems"
      (forward)="goForward()"
      (back)="goBack()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  appTitle!: string;
  canGoBack!: boolean;
  canGoForward!: boolean;
  hasFocus!: boolean;
  menuItems!: MenuItem[];
  goForward = (): void => {};
  goBack = (): void => {};
}

describe('SiElectrontitlebarComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;

  const forwardButton = (): HTMLButtonElement =>
    element.querySelector<HTMLButtonElement>('[aria-label="Forward"]')!;
  const backButton = (): HTMLButtonElement =>
    element.querySelector<HTMLButtonElement>('[aria-label="Back"]')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should allow you to specify an app title', () => {
    component.appTitle = 'my appTitle';
    component.canGoBack = false;
    component.canGoForward = false;
    component.menuItems = [{ label: 'Zoom in', type: 'action', action: () => alert('Zoom in') }];
    fixture.detectChanges();

    const appTitle = fixture.nativeElement.querySelector('.electron-title-bar-container span');
    expect(appTitle.textContent).toEqual('my appTitle');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('check forward/back state', () => {
    component.appTitle = 'required appTitle';
    component.canGoBack = false;
    component.canGoForward = false;
    component.menuItems = [{ label: 'Zoom in', type: 'action', action: () => alert('Zoom in') }];
    fixture.detectChanges();

    component.menuItems = [{ label: 'Zoom in', type: 'action', action: () => alert('Zoom in') }];
    const disabledButtons = fixture.nativeElement.querySelectorAll('button:disabled');
    expect(disabledButtons.length).toEqual(2);

    expect(forwardButton().disabled).toBe(true);
    expect(backButton().disabled).toBe(true);
    fixture.detectChanges();
  });

  it('check forward/back functionality', () => {
    component.appTitle = 'required appTitle';
    component.canGoBack = false;
    component.canGoForward = false;
    component.menuItems = [{ label: 'Zoom in', type: 'action', action: () => alert('Zoom in') }];
    vi.spyOn(component, 'goForward');
    vi.spyOn(component, 'goBack');
    fixture.detectChanges();
    forwardButton().dispatchEvent(new Event('click'));
    expect(component.goForward).toHaveBeenCalled();
    backButton().dispatchEvent(new Event('click'));
    expect(component.goBack).toHaveBeenCalled();
  });
});
