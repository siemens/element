/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { EntityStatusType } from '@siemens/element-ng/common';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiAvatarComponent } from './index';

@Component({
  template: `<si-avatar
    #ref
    [altText]="altText"
    [status]="status"
    [icon]="icon"
    [imageUrl]="imageUrl"
    [initials]="initials"
    [color]="color"
    [autoColor]="autoColor"
  />`,
  imports: [SiAvatarComponent]
})
class TestHostComponent {
  imageUrl?: string;
  icon?: string;
  initials?: string;
  color?: number = undefined;
  altText!: string;
  status?: EntityStatusType;
  autoColor = false;
}

describe('SiAvatarComponent', () => {
  let host: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [SiAvatarComponent, TestHostComponent, SiTranslateModule]
    }).compileComponents()
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    host.altText = 'Test';
    element = fixture.nativeElement.querySelector('si-avatar');
  });

  it('should show image', fakeAsync(() => {
    host.imageUrl = 'testImageUrl';
    fixture.detectChanges();
    tick();

    const img = element.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.alt).toBe('Test');
  }));

  it('should show icon', fakeAsync(() => {
    host.icon = 'element-user';
    fixture.detectChanges();
    tick();

    const el = element.querySelector<HTMLElement>('.element-user');
    expect(el).toBeTruthy();
    expect(el?.title).toBe('Test');
  }));

  it('should show initials', fakeAsync(() => {
    host.initials = 'JD';
    fixture.detectChanges();
    tick();

    const div = element.querySelector<HTMLElement>('.initials');
    expect(div).toBeTruthy();
    expect(div?.innerText).toBe('JD');
    expect(div?.title).toBe('Test');
  }));

  it('should show status icon', fakeAsync(() => {
    host.initials = 'JD';
    host.status = 'success';
    fixture.detectChanges();
    tick();

    expect(element.querySelector('.indicator')).toBeTruthy();
  }));

  it('should show different color', fakeAsync(() => {
    host.initials = 'JD';
    host.color = 14;
    fixture.detectChanges();
    tick();

    expect(element.style.getPropertyValue('--background')).toBe('var(--element-data-14)');
  }));

  it('should wrap data colors', fakeAsync(() => {
    host.initials = 'JD';
    host.color = 21;
    fixture.detectChanges();
    tick();

    expect(element.style.getPropertyValue('--background')).toBe('var(--element-data-4)');
  }));

  it('should set color automatically', fakeAsync(() => {
    host.initials = 'JD';
    host.autoColor = true;
    fixture.detectChanges();
    tick();

    expect(element.style.getPropertyValue('--background')).toBe('var(--element-data-4)');

    host.initials = 'DJ';
    fixture.detectChanges();
    tick();

    expect(element.style.getPropertyValue('--background')).toBe('var(--element-data-10)');
  }));

  describe('auto-calculated initials', () => {
    it('should support account with first and last name', () => {
      host.altText = 'Jane Smith';
      fixture.detectChanges();

      expect(element.querySelector<HTMLElement>('.initials')?.textContent).toEqual('JS');
    });

    it('should support account with first, middle and last name', () => {
      host.altText = 'Jane Aubrey Smith (stuff here) (and more stuff)';
      fixture.detectChanges();

      expect(element.querySelector<HTMLElement>('.initials')?.textContent).toEqual('JS');
    });

    it('should support account with first, middle and last name', () => {
      host.altText = 'Smith, Jane Aubrey (stuff here) (and more stuff)';
      fixture.detectChanges();

      expect(element.querySelector<HTMLElement>('.initials')?.textContent).toEqual('JS');
    });

    it('should support account with single name', () => {
      host.altText = 'Jane';
      fixture.detectChanges();

      expect(element.querySelector<HTMLElement>('.initials')?.textContent).toEqual('J');
    });

    it('should support account with single name and space prefix', () => {
      host.altText = ' Jane';
      fixture.detectChanges();

      expect(element.querySelector<HTMLElement>('.initials')?.textContent).toEqual('J');
    });

    it('should support account with single name and space postfix', () => {
      host.altText = 'Jane ';
      fixture.detectChanges();

      expect(element.querySelector<HTMLElement>('.initials')?.textContent).toEqual('J');
    });
  });
});
