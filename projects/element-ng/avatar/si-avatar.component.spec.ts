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

  it('should show image', async () => {
    imageUrl.set('testImageUrl');
    await fixture.whenStable();

    const img = element.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img?.alt).toBe('Test');
  });

  it('should show icon', async () => {
    icon.set('element-user');
    await fixture.whenStable();

    const el = element.querySelector<HTMLElement>('si-icon');
    expect(el).toBeInTheDocument();
    expect(el?.title).toBe('Test');
  });

  it('should show initials', async () => {
    initials.set('JD');
    await fixture.whenStable();

    const div = element.querySelector<HTMLElement>('.initials');
    expect(div).toBeInTheDocument();
    expect(div).toHaveTextContent('JD');
    expect(div?.title).toBe('Test');
  });

  it('should show status icon', async () => {
    initials.set('JD');
    status.set('success');
    await fixture.whenStable();

    expect(element.querySelector('.indicator')).toBeInTheDocument();
  });

  it('should show different color', async () => {
    initials.set('JD');
    color.set(14);
    await fixture.whenStable();

    expect(element.style.getPropertyValue('--background')).toBe('var(--element-data-14)');
  });

  it('should wrap data colors', async () => {
    initials.set('JD');
    color.set(21);
    await fixture.whenStable();

    expect(element.style.getPropertyValue('--background')).toBe('var(--element-data-4)');
  });

  it('should set color automatically', async () => {
    initials.set('JD');
    autoColor.set(true);
    await fixture.whenStable();

    expect(element.style.getPropertyValue('--background')).toBe('var(--element-data-4)');

    initials.set('DJ');
    await fixture.whenStable();

    expect(element.style.getPropertyValue('--background')).toBe('var(--element-data-10)');
  });

  describe('auto-calculated initials', () => {
    it('should support account with first and last name', async () => {
      altText.set('Jane Smith');
      await fixture.whenStable();

      expect(element.querySelector<HTMLElement>('.initials')).toHaveTextContent('JS');
    });

    it('should support account with first, middle and last name', async () => {
      altText.set('Jane Aubrey Smith (stuff here) (and more stuff)');
      await fixture.whenStable();

      expect(element.querySelector<HTMLElement>('.initials')).toHaveTextContent('JS');
    });

    it('should support account with first, middle and last name', async () => {
      altText.set('Smith, Jane Aubrey (stuff here) (and more stuff)');
      await fixture.whenStable();

      expect(element.querySelector<HTMLElement>('.initials')).toHaveTextContent('JS');
    });

    it('should support account with single name', async () => {
      altText.set('Jane');
      await fixture.whenStable();

      expect(element.querySelector<HTMLElement>('.initials')).toHaveTextContent('J');
    });

    it('should support account with single name and space prefix', async () => {
      altText.set(' Jane');
      await fixture.whenStable();

      expect(element.querySelector<HTMLElement>('.initials')).toHaveTextContent('J');
    });

    it('should support account with single name and space postfix', async () => {
      altText.set('Jane ');
      await fixture.whenStable();

      expect(element.querySelector<HTMLElement>('.initials')).toHaveTextContent('J');
    });
  });
});
