/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntityStatusType } from '@siemens/element-ng/common';

import { SiAvatarComponent } from './index';

describe('SiAvatarComponent', () => {
  let fixture: ComponentFixture<SiAvatarComponent>;
  let element: HTMLElement;
  const imageUrl = signal<string | undefined>(undefined);
  const icon = signal<string | undefined>(undefined);
  const initials = signal<string | undefined>(undefined);
  const color = signal<number | undefined>(undefined);
  const altText = signal('Test');
  const status = signal<EntityStatusType | undefined>(undefined);
  const autoColor = signal(false);

  beforeEach(() => {
    imageUrl.set(undefined);
    icon.set(undefined);
    initials.set(undefined);
    color.set(undefined);
    altText.set('Test');
    status.set(undefined);
    autoColor.set(false);
    fixture = TestBed.createComponent(SiAvatarComponent, {
      bindings: [
        inputBinding('altText', altText),
        inputBinding('status', status),
        inputBinding('icon', icon),
        inputBinding('imageUrl', imageUrl),
        inputBinding('initials', initials),
        inputBinding('color', color),
        inputBinding('autoColor', autoColor)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should show image', () => {
    imageUrl.set('testImageUrl');
    fixture.detectChanges();

    const img = element.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.alt).toBe('Test');
  });

  it('should show icon', () => {
    icon.set('element-user');
    fixture.detectChanges();

    const el = element.querySelector<HTMLElement>('si-icon');
    expect(el).toBeTruthy();
    expect(el?.title).toBe('Test');
  });

  it('should show initials', () => {
    initials.set('JD');
    fixture.detectChanges();

    const div = element.querySelector<HTMLElement>('.initials');
    expect(div).toBeTruthy();
    expect(div?.innerText).toBe('JD');
    expect(div?.title).toBe('Test');
  });

  it('should show status icon', () => {
    initials.set('JD');
    status.set('success');
    fixture.detectChanges();

    expect(element.querySelector('.indicator')).toBeTruthy();
  });

  it('should show different color', () => {
    initials.set('JD');
    color.set(14);
    fixture.detectChanges();

    expect(element.style.getPropertyValue('--background')).toBe('var(--element-data-14)');
  });

  it('should wrap data colors', () => {
    initials.set('JD');
    color.set(21);
    fixture.detectChanges();

    expect(element.style.getPropertyValue('--background')).toBe('var(--element-data-4)');
  });

  it('should set color automatically', () => {
    initials.set('JD');
    autoColor.set(true);
    fixture.detectChanges();

    expect(element.style.getPropertyValue('--background')).toBe('var(--element-data-4)');

    initials.set('DJ');
    fixture.detectChanges();

    expect(element.style.getPropertyValue('--background')).toBe('var(--element-data-10)');
  });

  describe('auto-calculated initials', () => {
    it('should support account with first and last name', () => {
      altText.set('Jane Smith');
      fixture.detectChanges();

      expect(element.querySelector<HTMLElement>('.initials')?.textContent).toEqual('JS');
    });

    it('should support account with first, middle and last name', () => {
      altText.set('Jane Aubrey Smith (stuff here) (and more stuff)');
      fixture.detectChanges();

      expect(element.querySelector<HTMLElement>('.initials')?.textContent).toEqual('JS');
    });

    it('should support account with first, middle and last name', () => {
      altText.set('Smith, Jane Aubrey (stuff here) (and more stuff)');
      fixture.detectChanges();

      expect(element.querySelector<HTMLElement>('.initials')?.textContent).toEqual('JS');
    });

    it('should support account with single name', () => {
      altText.set('Jane');
      fixture.detectChanges();

      expect(element.querySelector<HTMLElement>('.initials')?.textContent).toEqual('J');
    });

    it('should support account with single name and space prefix', () => {
      altText.set(' Jane');
      fixture.detectChanges();

      expect(element.querySelector<HTMLElement>('.initials')?.textContent).toEqual('J');
    });

    it('should support account with single name and space postfix', () => {
      altText.set('Jane ');
      fixture.detectChanges();

      expect(element.querySelector<HTMLElement>('.initials')?.textContent).toEqual('J');
    });
  });
});
