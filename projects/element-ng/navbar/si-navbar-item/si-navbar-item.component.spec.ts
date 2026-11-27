/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MenuItem } from '@siemens/element-ng/common';
import { SiNavbarPrimaryComponent } from '@siemens/element-ng/navbar';
import { NEVER } from 'rxjs';

import { SiNavbarItemComponent } from './si-navbar-item.component';

describe('SiNavbarItemComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
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

  it('should update badge count on parent', async () => {
    const item = signal<MenuItem>({});
    const quickAction = signal(true);
    const fixture = TestBed.createComponent(SiNavbarItemComponent, {
      bindings: [inputBinding('item', item), inputBinding('quickAction', quickAction)]
    });
    const navbar = TestBed.inject<SiNavbarPrimaryComponent>(SiNavbarPrimaryComponent);
    await fixture.whenStable();
    expect(navbar.collapsibleActions()!.badgeCount()).toBe(0);
    item.set({ badgeDot: true });
    await fixture.whenStable();
    expect(navbar.collapsibleActions()!.badgeCount()).toBe(1);
    item.set({});
    await fixture.whenStable();
    expect(navbar.collapsibleActions()!.badgeCount()).toBe(0);
  });
});
