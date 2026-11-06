/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiNavbarVerticalItemComponent } from './si-navbar-vertical-item.component';
import { NavbarVerticalItemLink } from './si-navbar-vertical.model';
import { SI_NAVBAR_VERTICAL } from './si-navbar-vertical.provider';

@Component({
  imports: [SiNavbarVerticalItemComponent],
  template: `<a class="navbar-vertical-item" [si-navbar-vertical-item]="item()"> Test Item </a>`
})
class TestHostComponent {
  readonly item = signal<NavbarVerticalItemLink>({
    type: 'link',
    label: 'Test Item',
    href: '#'
  });
}

describe('SiNavbarVerticalItemComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  const mockNavbar = {
    collapsed: signal(false),
    textOnly: signal(false),
    itemTriggered: vi.fn()
  };

  beforeEach(async () => {
    mockNavbar.collapsed.set(false);
    mockNavbar.textOnly.set(false);

    await TestBed.configureTestingModule({
      providers: [{ provide: SI_NAVBAR_VERTICAL, useValue: mockNavbar }]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('formattedBadge() behavior through template', () => {
    it('should not display badge for undefined badge', () => {
      component.item.set({
        type: 'link',
        label: 'Test',
        href: '#',
        badge: undefined
      });
      fixture.detectChanges();

      const badgeElement = fixture.nativeElement.querySelector('.badge');
      expect(badgeElement).toBeFalsy();
    });

    it('should not display badge for zero or empty badge values', () => {
      const testCases = [0, ''];

      testCases.forEach(badge => {
        component.item.set({
          type: 'link',
          label: 'Test',
          href: '#',
          badge
        });
        fixture.detectChanges();

        const badgeElement = fixture.nativeElement.querySelector('.badge');
        expect(badgeElement).toBeFalsy();
      });
    });

    it('should display number as string for numbers <= 99', () => {
      const testCases = [1, 4, 10, 44, 99];

      testCases.forEach(badge => {
        component.item.set({
          type: 'link',
          label: 'Test',
          href: '#',
          badge,
          badgeColor: 'info'
        });
        fixture.detectChanges();

        const badgeElement = fixture.nativeElement.querySelector('.badge');
        expect(badgeElement).toBeTruthy();
        expect(badgeElement).toHaveTextContent(badge.toString());
      });
    });

    it('should display "+99" for numbers > 99', () => {
      const testCases = [100, 101, 150, 999, 1000];

      testCases.forEach(badge => {
        component.item.set({
          type: 'link',
          label: 'Test',
          href: '#',
          badge,
          badgeColor: 'info'
        });
        fixture.detectChanges();

        const badgeElement = fixture.nativeElement.querySelector('.badge');
        expect(badgeElement).toBeTruthy();
        expect(badgeElement).toHaveTextContent('+99');
      });
    });

    it('should display all string values as-is (no parsing)', () => {
      const testCases = [
        '1',
        '4',
        '10',
        '44',
        '99', // Numeric strings
        '100',
        '101',
        '999',
        '1000', // Large numeric strings
        'new',
        'updated',
        'alert',
        'info', // Non-numeric strings
        '99+',
        '100+',
        'test123', // Mixed format strings
        '  50  ',
        '0' // Edge case strings
      ];

      testCases.forEach(badge => {
        component.item.set({
          type: 'link',
          label: 'Test',
          href: '#',
          badge,
          badgeColor: 'info'
        });
        fixture.detectChanges();

        const badgeElement = fixture.nativeElement.querySelector('.badge');
        expect(badgeElement).toBeTruthy();
        expect(badgeElement).toHaveTextContent(badge.trim());
      });
    });
  });

  describe('badge behavior (collapsed view)', () => {
    it('should display badge with collapsed class when navbar is collapsed', () => {
      // Set navbar to collapsed mode
      mockNavbar.collapsed.set(true);

      component.item.set({
        type: 'link',
        label: 'Test',
        href: '#',
        icon: 'element-test',
        badge: 250,
        badgeColor: 'info'
      });
      fixture.detectChanges();

      const badgeElement = fixture.nativeElement.querySelector('.badge');
      expect(badgeElement).toBeTruthy();
      expect(badgeElement).toHaveClass('badge-collapsed');
      expect(badgeElement).toHaveTextContent('+99');
    });

    it('should not display badge when navbar is textOnly', () => {
      // Set navbar to textOnly mode
      mockNavbar.textOnly.set(true);

      component.item.set({
        type: 'link',
        label: 'Test',
        href: '#',
        badge: 5,
        badgeColor: 'info'
      });
      fixture.detectChanges();

      const badgeElement = fixture.nativeElement.querySelector('.badge');
      expect(badgeElement).toBeFalsy();
    });

    it('should display badge when navbar is not textOnly', () => {
      // Ensure navbar is not in textOnly mode
      mockNavbar.textOnly.set(false);

      component.item.set({
        type: 'link',
        label: 'Test',
        href: '#',
        badge: 5,
        badgeColor: 'info'
      });
      fixture.detectChanges();

      const badgeElement = fixture.nativeElement.querySelector('.badge');
      expect(badgeElement).toBeTruthy();
      expect(badgeElement).toHaveTextContent('5');
    });

    it('should format badge values consistently with main badge', () => {
      const testCases = [
        { badge: 4, expected: '4' },
        { badge: 44, expected: '44' },
        { badge: 99, expected: '99' },
        { badge: 100, expected: '+99' },
        { badge: 999, expected: '+99' },
        { badge: 'new', expected: 'new' },
        { badge: '150', expected: '150' } // String numbers displayed as-is
      ];

      testCases.forEach(({ badge, expected }) => {
        component.item.set({
          type: 'link',
          label: 'Test',
          href: '#',
          icon: 'element-test',
          badge,
          badgeColor: 'info'
        });
        fixture.detectChanges();

        const badgeElement = fixture.nativeElement.querySelector('.badge');
        expect(badgeElement).toBeTruthy();
        expect(badgeElement).toHaveTextContent(expected);
      });
    });
  });

  describe('hideBadgeWhenCollapsed behavior', () => {
    const renderItemLink = async (hideBadgeWhenCollapsed?: boolean): Promise<Element | null> => {
      component.item.set({
        type: 'link',
        label: 'Test',
        href: '#',
        badge: 5,
        badgeColor: 'default',
        hideBadgeWhenCollapsed
      });
      await fixture.whenStable();
      return fixture.nativeElement.querySelector('a.navbar-vertical-item');
    };

    it('should add class when true', async () => {
      expect(await renderItemLink(true)).toHaveClass('hide-badge-collapsed');
    });

    it('should not add class when false', async () => {
      expect(await renderItemLink(false)).not.toHaveClass('hide-badge-collapsed');
    });

    it('should default to false', async () => {
      expect(await renderItemLink()).not.toHaveClass('hide-badge-collapsed');
    });

    it('should toggle class when value changes', async () => {
      expect(await renderItemLink(false)).not.toHaveClass('hide-badge-collapsed');
      expect(await renderItemLink(true)).toHaveClass('hide-badge-collapsed');
      expect(await renderItemLink(false)).not.toHaveClass('hide-badge-collapsed');
    });
  });
});
