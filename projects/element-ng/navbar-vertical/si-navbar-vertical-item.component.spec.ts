/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
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

describe('SiNavbarVerticalItemComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  const mockNavbar = {
    collapsed: signal(false),
    itemTriggered: jasmine.createSpy('itemTriggered')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: SI_NAVBAR_VERTICAL, useValue: mockNavbar },
        provideZonelessChangeDetection()
      ]
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
          badgeColor: 'primary'
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
          badgeColor: 'primary'
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
          badgeColor: 'primary'
        });
        fixture.detectChanges();

        const badgeElement = fixture.nativeElement.querySelector('.badge');
        expect(badgeElement).toBeTruthy();
        expect(badgeElement.textContent.trim()).toBe(badge.trim());
      });
    });
  });

  describe('badge-text behavior (collapsed view)', () => {
    it('should display badge-text with formatted value when icon is present', () => {
      component.item.set({
        type: 'link',
        label: 'Test',
        href: '#',
        icon: 'element-test',
        badge: 250
      });
      fixture.detectChanges();

      const badgeTextElement = fixture.nativeElement.querySelector('.badge-text');
      expect(badgeTextElement).toBeTruthy();
      expect(badgeTextElement.textContent.trim()).toBe('+99');
    });

    it('should not display badge-text when no icon is present', () => {
      component.item.set({
        type: 'link',
        label: 'Test',
        href: '#',
        badge: 5
      });
      fixture.detectChanges();

      const badgeTextElement = fixture.nativeElement.querySelector('.badge-text');
      expect(badgeTextElement).toBeFalsy();
    });

    it('should hide item title when navbar is collapsed', () => {
      component.item.set({
        type: 'link',
        label: 'Test Item',
        href: '#',
        badge: 5
      });

      // Initially expanded
      mockNavbar.collapsed.set(false);
      fixture.detectChanges();

      let titleElement = fixture.nativeElement.querySelector('.item-title');
      expect(titleElement.classList.contains('visually-hidden')).toBe(false);

      // Switch to collapsed mode
      mockNavbar.collapsed.set(true);
      fixture.detectChanges();

      titleElement = fixture.nativeElement.querySelector('.item-title');
      expect(titleElement.classList.contains('visually-hidden')).toBe(true);
    });

    it('should format badge-text values consistently with main badge', () => {
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
          badge
        });
        fixture.detectChanges();

        const badgeTextElement = fixture.nativeElement.querySelector('.badge-text');
        expect(badgeTextElement).toBeTruthy();
        expect(badgeTextElement.textContent.trim()).toBe(expected);
      });
    });
  });
});
