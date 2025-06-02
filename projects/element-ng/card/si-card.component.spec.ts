/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ContentActionBarMainItem, ViewType } from '@siemens/element-ng/content-action-bar';
import { MenuItem } from '@siemens/element-ng/menu';
import { runOnPushChangeDetection } from '@siemens/element-ng/test-helpers';

import { SiCardComponent } from './index';

@Component({
  template: `
    <div>
      <si-card
        [heading]="heading"
        [primaryActions]="primaryActions"
        [secondaryActions]="secondaryActions"
        [actionBarViewType]="actionBarViewType"
        [actionBarTitle]="actionBarTitle"
        [imgSrc]="imgSrc"
        [imgAlt]="imgAlt"
        [imgDir]="imgDir"
        [imgObjectFit]="imgObjectFit"
        [imgObjectPosition]="imgObjectPosition"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiCardComponent, RouterModule]
})
class WrapperComponent {
  heading = '';
  primaryActions: ContentActionBarMainItem[] = [];
  secondaryActions: MenuItem[] = [];
  actionBarViewType: ViewType = 'collapsible';
  actionBarTitle = '';

  imgSrc?: string;
  imgAlt?: string;
  imgDir?: 'horizontal' | 'vertical' = 'vertical';
  imgObjectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  imgObjectPosition?: string;
}

describe('SiCardComponent', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let wrapperComponent: WrapperComponent;
  let element: HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterModule, NoopAnimationsModule, WrapperComponent]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    wrapperComponent = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should have a heading', () => {
    wrapperComponent.heading = 'TITLE_KEY';
    fixture.detectChanges();
    expect(element.querySelector('.card-header')!.innerHTML).toContain('TITLE_KEY');
  });

  describe('content action bar', () => {
    it('should not be available without actions', () => {
      fixture.detectChanges();
      const contentActionBar =
        fixture.debugElement.nativeElement.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
    });

    it('should be unavailable with no actions and disabled expand interaction', () => {
      fixture.detectChanges();
      const contentActionBar = fixture.nativeElement.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
    });

    it('should be unavailable with undefined primary actions and no secondary actions and disabled expand interaction', () => {
      wrapperComponent.primaryActions = undefined as any;
      fixture.detectChanges();
      const contentActionBar = fixture.nativeElement.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
    });

    it('should be available with one primary action and not secondary action and disabled expand interaction', () => {
      wrapperComponent.primaryActions = [{ label: 'Action', type: 'action', action: () => {} }];
      runOnPushChangeDetection(fixture);
      const contentActionBar = fixture.nativeElement.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be available with one primary action added later and not secondary action', () => {
      runOnPushChangeDetection(fixture);
      let contentActionBar = fixture.nativeElement.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
      wrapperComponent.primaryActions = [{ label: 'Action', type: 'action', action: () => {} }];
      runOnPushChangeDetection(fixture);
      contentActionBar = fixture.nativeElement.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be available with no primary action and one secondary action and disabled expand interaction', () => {
      wrapperComponent.secondaryActions = [{ label: 'Action', type: 'action', action: () => {} }];
      fixture.detectChanges();
      const contentActionBar = fixture.nativeElement.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be available with no primary action and one secondary action', () => {
      wrapperComponent.secondaryActions = [{ label: 'Action', type: 'action', action: () => {} }];
      fixture.detectChanges();
      const contentActionBar = fixture.nativeElement.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be available with one secondary action', () => {
      runOnPushChangeDetection(fixture);
      let contentActionBar = fixture.nativeElement.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
      wrapperComponent.secondaryActions = [{ label: 'Action', type: 'action', action: () => {} }];
      runOnPushChangeDetection(fixture);
      contentActionBar = fixture.nativeElement.querySelector('si-content-action-bar');
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
      wrapperComponent.primaryActions = [{ label: 'Action', type: 'action', action: () => {} }];
      fixture.detectChanges();
      const contentActionBar = element.querySelector('.element-zoom');
      expect(contentActionBar).toBeNull();
    });

    it('should be unavailable with no primary action and one secondary action', () => {
      wrapperComponent.secondaryActions = [{ label: 'Action', type: 'action', action: () => {} }];
      fixture.detectChanges();
      const contentActionBar = element.querySelector('.element-zoom');
      expect(contentActionBar).toBeNull();
    });
  });

  describe('image', () => {
    const getComputedStyleProp = (el: Element | null, prop: string): any =>
      el ? getComputedStyle(el).getPropertyValue(prop) : undefined;

    it('should be added on imgSrc with vertical direction', () => {
      runOnPushChangeDetection(fixture);
      let img = element.querySelector('img');
      expect(img).toBeNull();

      wrapperComponent.imgSrc = './testing/assets/element-logo.png';
      runOnPushChangeDetection(fixture);
      img = element.querySelector('img');
      expect(img).not.toBeNull();
      expect(img?.classList.contains('card-img-top')).toBe(true);
      expect(img?.classList.contains('card-img-start')).toBe(false);
    });

    it('direction should be changed to horizontal', () => {
      wrapperComponent.imgSrc = './testing/assets/element-logo.png';
      wrapperComponent.imgDir = 'horizontal';
      runOnPushChangeDetection(fixture);

      const img = element.querySelector('img');
      expect(img).not.toBeNull();
      expect(img?.classList.contains('card-img-top')).toBe(false);
      expect(img?.classList.contains('card-img-start')).toBe(true);
    });

    it('alt text should be set', () => {
      wrapperComponent.imgSrc = './testing/assets/element-logo.png';
      runOnPushChangeDetection(fixture);

      let img = element.querySelector('img');
      expect(img?.attributes.getNamedItem('alt')).toBeNull();

      wrapperComponent.imgAlt = 'alt text';
      runOnPushChangeDetection(fixture);
      img = element.querySelector('img');
      expect(img?.attributes.getNamedItem('alt')?.value).toBe('alt text');
    });

    it('object fit should be scale-down as default and should be changed to cover', () => {
      wrapperComponent.imgSrc = './testing/assets/element-logo.png';
      runOnPushChangeDetection(fixture);

      let img = element.querySelector('img');
      expect(getComputedStyleProp(img, 'object-fit')?.toString()).toBe('scale-down');

      wrapperComponent.imgObjectFit = 'cover';
      runOnPushChangeDetection(fixture);

      img = element.querySelector('img');
      expect(getComputedStyleProp(img, 'object-fit')?.toString()).toBe('cover');
    });

    it('object position should be changed by setting left', () => {
      wrapperComponent.imgSrc = './testing/assets/element-logo.png';
      runOnPushChangeDetection(fixture);

      let img = element.querySelector('img');
      expect(getComputedStyleProp(img, 'object-position')?.toString()).toBe('50% 0%');

      wrapperComponent.imgObjectPosition = 'left';
      runOnPushChangeDetection(fixture);

      img = element.querySelector('img');
      expect(getComputedStyleProp(img, 'object-position')?.toString()).toBe('0% 50%');
    });
  });
});
