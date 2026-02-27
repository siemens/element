/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { ContentActionBarMainItem, ViewType } from '@siemens/element-ng/content-action-bar';
import { MenuItem } from '@siemens/element-ng/menu';

import { SiCardComponent } from './index';

describe('SiCardComponent', () => {
  let fixture: ComponentFixture<SiCardComponent>;
  let element: HTMLElement;
  const heading = signal('');
  const primaryActions = signal<ContentActionBarMainItem[]>([]);
  const secondaryActions = signal<MenuItem[]>([]);
  const actionBarViewType = signal<ViewType>('collapsible');
  const actionBarTitle = signal('');
  const imgSrc = signal<string | undefined>(undefined);
  const imgAlt = signal<string | undefined>(undefined);
  const imgDir = signal<'horizontal' | 'vertical' | undefined>('vertical');
  const imgObjectFit = signal<'contain' | 'cover' | 'fill' | 'none' | 'scale-down' | undefined>(
    undefined
  );
  const imgObjectPosition = signal<string | undefined>(undefined);

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterModule]
    })
  );

  beforeEach(() => {
    heading.set('');
    primaryActions.set([]);
    secondaryActions.set([]);
    actionBarViewType.set('collapsible');
    actionBarTitle.set('');
    imgSrc.set(undefined);
    imgAlt.set(undefined);
    imgDir.set('vertical');
    imgObjectFit.set(undefined);
    imgObjectPosition.set(undefined);
    fixture = TestBed.createComponent(SiCardComponent, {
      bindings: [
        inputBinding('heading', heading),
        inputBinding('primaryActions', primaryActions),
        inputBinding('secondaryActions', secondaryActions),
        inputBinding('actionBarViewType', actionBarViewType),
        inputBinding('actionBarTitle', actionBarTitle),
        inputBinding('imgSrc', imgSrc),
        inputBinding('imgAlt', imgAlt),
        inputBinding('imgDir', imgDir),
        inputBinding('imgObjectFit', imgObjectFit),
        inputBinding('imgObjectPosition', imgObjectPosition)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should have a heading', () => {
    heading.set('TITLE_KEY');
    fixture.detectChanges();
    expect(element.querySelector('.card-header')!.innerHTML).toContain('TITLE_KEY');
  });

  describe('content action bar', () => {
    it('should not be available without actions', () => {
      fixture.detectChanges();
      const contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
    });

    it('should be unavailable with no actions and disabled expand interaction', () => {
      fixture.detectChanges();
      const contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
    });

    it('should be unavailable with undefined primary actions and no secondary actions and disabled expand interaction', () => {
      primaryActions.set(undefined as any);
      fixture.detectChanges();
      const contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
    });

    it('should be available with one primary action and not secondary action and disabled expand interaction', () => {
      primaryActions.set([{ label: 'Action', type: 'action', action: () => {} }]);
      fixture.detectChanges();
      const contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be available with one primary action added later and not secondary action', () => {
      fixture.detectChanges();
      let contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
      primaryActions.set([{ label: 'Action', type: 'action', action: () => {} }]);
      fixture.detectChanges();
      contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be available with no primary action and one secondary action and disabled expand interaction', () => {
      secondaryActions.set([{ label: 'Action', type: 'action', action: () => {} }]);
      fixture.detectChanges();
      const contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be available with no primary action and one secondary action', () => {
      secondaryActions.set([{ label: 'Action', type: 'action', action: () => {} }]);
      fixture.detectChanges();
      const contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be available with one secondary action', () => {
      fixture.detectChanges();
      let contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
      secondaryActions.set([{ label: 'Action', type: 'action', action: () => {} }]);
      fixture.detectChanges();
      contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });
  });

  describe('expand restore button', () => {
    it('should not be available without actions', () => {
      fixture.detectChanges();
      const contentActionBar = element.querySelector('.element-zoom');
      expect(contentActionBar).toBeNull();
    });

    it('should be unavailable without actions and disabled expand interaction', () => {
      fixture.detectChanges();
      const contentActionBar = element.querySelector('.element-zoom');
      expect(contentActionBar).toBeNull();
    });

    it('should be unavailable with one primary action and no secondary action', () => {
      primaryActions.set([{ label: 'Action', type: 'action', action: () => {} }]);
      fixture.detectChanges();
      const contentActionBar = element.querySelector('.element-zoom');
      expect(contentActionBar).toBeNull();
    });

    it('should be unavailable with no primary action and one secondary action', () => {
      secondaryActions.set([{ label: 'Action', type: 'action', action: () => {} }]);
      fixture.detectChanges();
      const contentActionBar = element.querySelector('.element-zoom');
      expect(contentActionBar).toBeNull();
    });
  });

  describe('image', () => {
    const getComputedStyleProp = (el: Element | null, prop: string): any =>
      el ? getComputedStyle(el).getPropertyValue(prop) : undefined;

    it('should be added on imgSrc with vertical direction', () => {
      fixture.detectChanges();
      let img = element.querySelector('img');
      expect(img).toBeNull();

      imgSrc.set('./assets/landing-page-steel.webp');
      fixture.detectChanges();
      img = element.querySelector('img');
      expect(img).not.toBeNull();
      expect(img?.classList.contains('card-img-top')).toBe(true);
      expect(img?.classList.contains('card-img-start')).toBe(false);
    });

    it('direction should be changed to horizontal', () => {
      imgSrc.set('./assets/landing-page-steel.webp');
      imgDir.set('horizontal');
      fixture.detectChanges();

      const img = element.querySelector('img');
      expect(img).not.toBeNull();
      expect(img?.classList.contains('card-img-top')).toBe(false);
      expect(img?.classList.contains('card-img-start')).toBe(true);
    });

    it('alt text should be set', () => {
      imgSrc.set('./assets/landing-page-steel.webp');
      fixture.detectChanges();

      const img = element.querySelector('img');
      expect(img?.attributes.getNamedItem('alt')).toBeNull();

      imgAlt.set('alt text');
      fixture.detectChanges();
      expect(img?.attributes.getNamedItem('alt')?.value).toBe('alt text');
    });

    it('object fit should be scale-down as default and should be changed to cover', () => {
      imgSrc.set('./assets/landing-page-steel.webp');
      fixture.detectChanges();

      const img = element.querySelector('img');
      expect(getComputedStyleProp(img, 'object-fit')?.toString()).toBe('scale-down');

      imgObjectFit.set('cover');
      fixture.detectChanges();

      expect(getComputedStyleProp(img, 'object-fit')?.toString()).toBe('cover');
    });

    it('object position should be changed by setting left', () => {
      imgSrc.set('./assets/landing-page-steel.webp');
      fixture.detectChanges();

      const img = element.querySelector('img');
      expect(getComputedStyleProp(img, 'object-position')?.toString()).toBe('50% 0%');

      imgObjectPosition.set('left');
      fixture.detectChanges();

      expect(getComputedStyleProp(img, 'object-position')?.toString()).toBe('0% 50%');
    });
  });
});
