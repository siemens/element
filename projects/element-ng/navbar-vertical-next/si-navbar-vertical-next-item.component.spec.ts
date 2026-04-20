/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiNavbarVerticalNextItemComponent } from './si-navbar-vertical-next-item.component';
import { SI_NAVBAR_VERTICAL_NEXT } from './si-navbar-vertical-next.provider';

@Component({
  imports: [SiNavbarVerticalNextItemComponent],
  template: `<a
    si-navbar-vertical-next-item
    [badge]="badge()"
    [badgeColor]="badgeColor()"
    [hideBadgeWhenCollapsed]="hideBadgeWhenCollapsed()"
    [icon]="icon()"
  >
    Test Item
  </a>`
})
class TestHostComponent {
  readonly badge = signal<string | number | undefined>(undefined);
  readonly badgeColor = signal<string | undefined>(undefined);
  readonly hideBadgeWhenCollapsed = signal(false);
  readonly icon = signal<string | undefined>(undefined);
}

@Component({
  imports: [SiNavbarVerticalNextItemComponent],
  template: `<a
    si-navbar-vertical-next-item
    [badge]="badge()"
    [badgeColor]="badgeColor()"
    [hideBadgeWhenCollapsed]="hideBadgeWhenCollapsed()"
  >
    Test Item
  </a>`
})
class TestHostWithBadgeVisibilityComponent {
  readonly badge = signal<string | number | undefined>(undefined);
  readonly badgeColor = signal<string | undefined>(undefined);
  readonly hideBadgeWhenCollapsed = signal(false);
}

describe('SiNavbarVerticalNextItemComponent', () => {
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
      providers: [{ provide: SI_NAVBAR_VERTICAL_NEXT, useValue: mockNavbar }]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => vi.clearAllMocks());

  describe('formattedBadge() behavior through template', () => {
    it('should not display badge for undefined badge', () => {
      component.badge.set(undefined);
      fixture.detectChanges();

      const badgeElement = fixture.nativeElement.querySelector('.badge');
      expect(badgeElement).toBeFalsy();
    });

    it('should display badge with zero value', () => {
      component.badge.set(0);
      fixture.detectChanges();

      const badgeElement = fixture.nativeElement.querySelector('.badge');
      expect(badgeElement).toBeTruthy();
      expect(badgeElement).toHaveTextContent('0');
    });

    it('should hide badge when value is empty string', () => {
      component.badge.set('');
      fixture.detectChanges();

      const badgeElement = fixture.nativeElement.querySelector('.badge');
      expect(badgeElement).toBeFalsy();
    });

    it('should display number as string for numbers <= 99', () => {
      const testCases = [1, 4, 10, 44, 99];

      testCases.forEach(badge => {
        component.badge.set(badge);
        component.badgeColor.set('info');
        fixture.detectChanges();

        const badgeElement = fixture.nativeElement.querySelector('.badge');
        expect(badgeElement).toBeTruthy();
        expect(badgeElement).toHaveTextContent(badge.toString());
      });
    });

    it('should display "+99" for numbers > 99', () => {
      const testCases = [100, 101, 150, 999, 1000];

      testCases.forEach(badge => {
        component.badge.set(badge);
        component.badgeColor.set('info');
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
        component.badge.set(badge);
        component.badgeColor.set('info');
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

      component.icon.set('element-test');
      component.badge.set(250);
      component.badgeColor.set('info');
      fixture.detectChanges();

      const badgeElement = fixture.nativeElement.querySelector('.badge');
      expect(badgeElement).toBeTruthy();
      expect(badgeElement).toHaveClass('badge-collapsed');
      expect(badgeElement).toHaveTextContent('+99');
    });

    it('should not display badge when navbar is textOnly', () => {
      // Set navbar to textOnly mode
      mockNavbar.textOnly.set(true);

      component.badge.set(5);
      component.badgeColor.set('info');
      fixture.detectChanges();

      const badgeElement = fixture.nativeElement.querySelector('.badge');
      expect(badgeElement).toBeFalsy();
    });

    it('should display badge when navbar is not textOnly', () => {
      // Ensure navbar is not in textOnly mode
      mockNavbar.textOnly.set(false);

      component.badge.set(5);
      component.badgeColor.set('info');
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
        component.icon.set('element-test');
        component.badge.set(badge);
        component.badgeColor.set('info');
        fixture.detectChanges();

        const badgeElement = fixture.nativeElement.querySelector('.badge');
        expect(badgeElement).toBeTruthy();
        expect(badgeElement).toHaveTextContent(expected);
      });
    });
  });

  describe('hideBadgeWhenCollapsed behavior', () => {
    let badgeTestComponent: TestHostWithBadgeVisibilityComponent;
    let badgeTestFixture: ComponentFixture<TestHostWithBadgeVisibilityComponent>;

    beforeEach(async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        providers: [{ provide: SI_NAVBAR_VERTICAL_NEXT, useValue: mockNavbar }]
      }).compileComponents();

      badgeTestFixture = TestBed.createComponent(TestHostWithBadgeVisibilityComponent);
      badgeTestComponent = badgeTestFixture.componentInstance;
      badgeTestFixture.detectChanges();
    });

    it('should add class when true', () => {
      badgeTestComponent.badge.set(5);
      badgeTestComponent.badgeColor.set('default');
      badgeTestComponent.hideBadgeWhenCollapsed.set(true);
      badgeTestFixture.detectChanges();

      const linkElement = badgeTestFixture.nativeElement.querySelector('a.navbar-vertical-item');
      expect(linkElement).toHaveClass('hide-badge-collapsed');
    });

    it('should not add class when false', () => {
      badgeTestComponent.badge.set(5);
      badgeTestComponent.badgeColor.set('default');
      badgeTestComponent.hideBadgeWhenCollapsed.set(false);
      badgeTestFixture.detectChanges();

      const linkElement = badgeTestFixture.nativeElement.querySelector('a.navbar-vertical-item');
      expect(linkElement).not.toHaveClass('hide-badge-collapsed');
    });

    it('should default to false', () => {
      badgeTestComponent.badge.set(5);
      badgeTestComponent.badgeColor.set('default');
      badgeTestFixture.detectChanges();

      const linkElement = badgeTestFixture.nativeElement.querySelector('a.navbar-vertical-item');
      expect(linkElement).not.toHaveClass('hide-badge-collapsed');
    });

    it('should toggle class when value changes', () => {
      badgeTestComponent.badge.set(5);
      badgeTestComponent.badgeColor.set('default');
      badgeTestComponent.hideBadgeWhenCollapsed.set(false);
      badgeTestFixture.detectChanges();
      let linkElement = badgeTestFixture.nativeElement.querySelector('a.navbar-vertical-item');
      expect(linkElement).not.toHaveClass('hide-badge-collapsed');

      badgeTestComponent.hideBadgeWhenCollapsed.set(true);
      badgeTestFixture.detectChanges();
      linkElement = badgeTestFixture.nativeElement.querySelector('a.navbar-vertical-item');
      expect(linkElement).toHaveClass('hide-badge-collapsed');

      badgeTestComponent.hideBadgeWhenCollapsed.set(false);
      badgeTestFixture.detectChanges();
      linkElement = badgeTestFixture.nativeElement.querySelector('a.navbar-vertical-item');
      expect(linkElement).not.toHaveClass('hide-badge-collapsed');
    });
  });
});
