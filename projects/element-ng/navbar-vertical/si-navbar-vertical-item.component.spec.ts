/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiNavbarVerticalItemComponent } from './si-navbar-vertical-item.component';
import { NavbarVerticalItemLink } from './si-navbar-vertical.model';
import { SI_NAVBAR_VERTICAL } from './si-navbar-vertical.provider';

@Component({
  imports: [SiNavbarVerticalItemComponent],
  template: ` <a class="navbar-vertical-item" [si-navbar-vertical-item]="item()"> Test Item </a> `
})
class TestHostComponent {
  readonly item = signal<NavbarVerticalItemLink>({
    type: 'link',
    label: 'Test Item',
    href: '#'
  });
}

@Component({
  imports: [SiNavbarVerticalItemComponent],
  template: ` <a class="navbar-vertical-item" [si-navbar-vertical-item]="item()"> Test Item </a> `
})
class TestHostWithBadgeVisibilityComponent {
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
    itemTriggered: jasmine.createSpy('itemTriggered')
  };

  beforeEach(async () => {
    mockNavbar.collapsed.set(false);
    mockNavbar.textOnly.set(false);
    mockNavbar.itemTriggered.calls.reset();

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
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
        expect(badgeElement.textContent.trim()).toBe(badge.toString());
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
        expect(badgeElement.textContent.trim()).toBe('+99');
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
        expect(badgeElement.textContent.trim()).toBe(badge.trim());
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
      expect(badgeElement.classList.contains('badge-collapsed')).toBe(true);
      expect(badgeElement.textContent.trim()).toBe('+99');
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
      expect(badgeElement.textContent.trim()).toBe('5');
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
        expect(badgeElement.textContent.trim()).toBe(expected);
      });
    });
  });

  describe('hideBadgeWhenCollapsed behavior', () => {
    let badgeTestComponent: TestHostWithBadgeVisibilityComponent;
    let badgeTestFixture: ComponentFixture<TestHostWithBadgeVisibilityComponent>;

    beforeEach(async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [TestHostWithBadgeVisibilityComponent],
        providers: [{ provide: SI_NAVBAR_VERTICAL, useValue: mockNavbar }]
      }).compileComponents();

      badgeTestFixture = TestBed.createComponent(TestHostWithBadgeVisibilityComponent);
      badgeTestComponent = badgeTestFixture.componentInstance;
      badgeTestFixture.detectChanges();
    });

    it('should add class when true', () => {
      badgeTestComponent.item.set({
        type: 'link',
        label: 'Test',
        href: '#',
        badge: 5,
        badgeColor: 'default',
        hideBadgeWhenCollapsed: true
      });
      badgeTestFixture.detectChanges();

      const linkElement = badgeTestFixture.nativeElement.querySelector('a.navbar-vertical-item');
      expect(linkElement.classList.contains('hide-badge-collapsed')).toBe(true);
    });

    it('should not add class when false', () => {
      badgeTestComponent.item.set({
        type: 'link',
        label: 'Test',
        href: '#',
        badge: 5,
        badgeColor: 'default',
        hideBadgeWhenCollapsed: false
      });
      badgeTestFixture.detectChanges();

      const linkElement = badgeTestFixture.nativeElement.querySelector('a.navbar-vertical-item');
      expect(linkElement.classList.contains('hide-badge-collapsed')).toBe(false);
    });

    it('should default to false', () => {
      badgeTestComponent.item.set({
        type: 'link',
        label: 'Test',
        href: '#',
        badge: 5,
        badgeColor: 'default'
      });
      badgeTestFixture.detectChanges();

      const linkElement = badgeTestFixture.nativeElement.querySelector('a.navbar-vertical-item');
      expect(linkElement.classList.contains('hide-badge-collapsed')).toBe(false);
    });

    it('should toggle class when value changes', () => {
      badgeTestComponent.item.set({
        type: 'link',
        label: 'Test',
        href: '#',
        badge: 5,
        badgeColor: 'default',
        hideBadgeWhenCollapsed: false
      });
      badgeTestFixture.detectChanges();
      let linkElement = badgeTestFixture.nativeElement.querySelector('a.navbar-vertical-item');
      expect(linkElement.classList.contains('hide-badge-collapsed')).toBe(false);

      badgeTestComponent.item.set({
        type: 'link',
        label: 'Test',
        href: '#',
        badge: 5,
        badgeColor: 'default',
        hideBadgeWhenCollapsed: true
      });
      badgeTestFixture.detectChanges();
      linkElement = badgeTestFixture.nativeElement.querySelector('a.navbar-vertical-item');
      expect(linkElement.classList.contains('hide-badge-collapsed')).toBe(true);

      badgeTestComponent.item.set({
        type: 'link',
        label: 'Test',
        href: '#',
        badge: 5,
        badgeColor: 'default',
        hideBadgeWhenCollapsed: false
      });
      badgeTestFixture.detectChanges();
      linkElement = badgeTestFixture.nativeElement.querySelector('a.navbar-vertical-item');
      expect(linkElement.classList.contains('hide-badge-collapsed')).toBe(false);
    });
  });
});
