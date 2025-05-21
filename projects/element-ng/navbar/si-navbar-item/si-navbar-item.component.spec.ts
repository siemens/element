/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuItem } from '@siemens/element-ng/common';
import { SiNavbarPrimaryComponent } from '@siemens/element-ng/navbar';
import { runOnPushChangeDetection } from '@siemens/element-ng/test-helpers';
import { NEVER } from 'rxjs';

import { SiNavbarItemComponent } from './si-navbar-item.component';

@Component({
  template: ` <si-navbar-item #testComponent [item]="item" [quickAction]="quickAction" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiNavbarItemComponent]
})
class WrapperComponent {
  item!: MenuItem;
  quickAction = false;

  readonly navbarSecondary = viewChild.required('testComponent', { read: ElementRef });
}

describe('SiNavbarItemComponent', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let wrapperComponent: WrapperComponent;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [WrapperComponent],
      providers: [
        {
          provide: SiNavbarPrimaryComponent,
          useValue: {
            collapsibleActions: signal({ badgeCount: signal(0), mobileExpanded: signal(false) }),
            header: signal({ closeMobileMenus: NEVER }),
            navItemCount: signal(0)
          }
        }
      ]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    wrapperComponent = fixture.componentInstance;
  });

  it('should update badge count on parent', () => {
    const navbar = TestBed.inject<SiNavbarPrimaryComponent>(SiNavbarPrimaryComponent);
    wrapperComponent.item = {};
    wrapperComponent.quickAction = true;
    runOnPushChangeDetection(fixture);
    expect(navbar.collapsibleActions()!.badgeCount()).toBe(0);
    wrapperComponent.item = {
      badgeDot: true
    };
    runOnPushChangeDetection(fixture);
    expect(navbar.collapsibleActions()!.badgeCount()).toBe(1);
    wrapperComponent.item = {};
    runOnPushChangeDetection(fixture);
    expect(navbar.collapsibleActions()!.badgeCount()).toBe(0);
  });
});
