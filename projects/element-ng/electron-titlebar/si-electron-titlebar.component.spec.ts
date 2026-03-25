/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, outputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuItem } from '@siemens/element-ng/menu';

import { SiElectrontitlebarComponent } from './si-electron-titlebar.component';

describe('SiElectrontitlebarComponent', () => {
  let fixture: ComponentFixture<SiElectrontitlebarComponent>;
  let element: HTMLElement;
  let appTitle: WritableSignal<string>;
  let canGoBack: WritableSignal<boolean>;
  let canGoForward: WritableSignal<boolean>;
  let hasFocus: WritableSignal<boolean>;
  let menuItems: WritableSignal<MenuItem[]>;
  let forwardSpy: (event: void) => void;
  let backSpy: (event: void) => void;

  const forwardButton = (): HTMLButtonElement =>
    element.querySelector<HTMLButtonElement>('[aria-label="Forward"]')!;
  const backButton = (): HTMLButtonElement =>
    element.querySelector<HTMLButtonElement>('[aria-label="Back"]')!;

  beforeEach(() => {
    appTitle = signal('required appTitle');
    canGoBack = signal(false);
    canGoForward = signal(false);
    hasFocus = signal(true);
    menuItems = signal<MenuItem[]>([
      { label: 'Zoom in', type: 'action', action: () => alert('Zoom in') }
    ]);
    forwardSpy = vi.fn();
    backSpy = vi.fn();

    fixture = TestBed.createComponent(SiElectrontitlebarComponent, {
      bindings: [
        inputBinding('appTitle', appTitle),
        inputBinding('canGoBack', canGoBack),
        inputBinding('canGoForward', canGoForward),
        inputBinding('hasFocus', hasFocus),
        inputBinding('menuItems', menuItems),
        outputBinding('forward', forwardSpy),
        outputBinding('back', backSpy)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should allow you to specify an app title', async () => {
    appTitle.set('my appTitle');
    await fixture.whenStable();

    const appTitleElement = element.querySelector('.electron-title-bar-container span');
    expect(appTitleElement).toHaveTextContent('my appTitle');
  });

  it('check forward/back state', async () => {
    canGoBack.set(false);
    canGoForward.set(false);
    await fixture.whenStable();

    const disabledButtons = element.querySelectorAll('button:disabled');
    expect(disabledButtons.length).toEqual(2);

    expect(forwardButton()).toBeDisabled();
    expect(backButton()).toBeDisabled();
  });

  it('check forward/back functionality', async () => {
    await fixture.whenStable();

    forwardButton().dispatchEvent(new Event('click'));
    expect(forwardSpy).toHaveBeenCalled();

    backButton().dispatchEvent(new Event('click'));
    expect(backSpy).toHaveBeenCalled();
  });
});
