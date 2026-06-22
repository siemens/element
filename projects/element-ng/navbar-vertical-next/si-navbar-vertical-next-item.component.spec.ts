/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SiTooltipDirective, SiTooltipService } from '@siemens/element-ng/tooltip';

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
  </a>`,
  changeDetection: ChangeDetectionStrategy.OnPush
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
  </a>`,
  changeDetection: ChangeDetectionStrategy.OnPush
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
    alwaysFlyout: signal(false),
    inlineCollapse: signal(false),
    chipPortalAttached: signal(false),
    chipMode: signal(false),
    itemTriggered: vi.fn()
  };

  beforeEach(async () => {
    mockNavbar.collapsed.set(false);
    mockNavbar.textOnly.set(false);
    mockNavbar.alwaysFlyout.set(false);
    mockNavbar.inlineCollapse.set(false);
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

  describe('pinned input', () => {
    @Component({
      imports: [SiNavbarVerticalNextItemComponent],
      template: `<a
        si-navbar-vertical-next-item
        [pinned]="pinned()"
        [activeOverride]="activeOverride()"
      >
        Pinned Test Item
      </a>`
    })
    class TestHostWithPinnedComponent {
      readonly pinned = signal(false);
      readonly activeOverride = signal<boolean | undefined>(undefined);
    }

    @Component({
      imports: [SiNavbarVerticalNextItemComponent, SiTooltipDirective],
      template: `<a si-navbar-vertical-next-item [pinned]="pinned()" [siTooltip]="tooltipText()">
        Pinned Test Item
      </a>`
    })
    class TestHostWithPinnedAndConsumerTooltipComponent {
      readonly pinned = signal(false);
      readonly tooltipText = signal('Consumer tooltip');
    }

    let pinnedFixture: ComponentFixture<TestHostWithPinnedComponent>;
    let pinnedComponent: TestHostWithPinnedComponent;

    beforeEach(async () => {
      TestBed.resetTestingModule();
      mockNavbar.chipMode.set(false);
      mockNavbar.chipPortalAttached.set(false);
      await TestBed.configureTestingModule({
        providers: [{ provide: SI_NAVBAR_VERTICAL_NEXT, useValue: mockNavbar }]
      }).compileComponents();

      pinnedFixture = TestBed.createComponent(TestHostWithPinnedComponent);
      pinnedComponent = pinnedFixture.componentInstance;
      pinnedFixture.detectChanges();
    });

    afterEach(() => vi.restoreAllMocks());

    it('should not add is-pinned-chip class when chipMode is false', async () => {
      pinnedComponent.pinned.set(true);
      await pinnedFixture.whenStable();

      const link = pinnedFixture.nativeElement.querySelector('a');
      expect(link).not.toHaveClass('is-pinned-chip');
      expect(link).not.toHaveClass('is-chip');
    });

    it('should add is-pinned-chip class when chipMode is true and item is not active', async () => {
      mockNavbar.chipMode.set(true);
      pinnedComponent.pinned.set(true);
      await pinnedFixture.whenStable();

      const link = pinnedFixture.nativeElement.querySelector('a');
      expect(link).toHaveClass('is-pinned-chip');
      expect(link).toHaveClass('is-chip');
    });

    it('should not add is-pinned-chip class when chipMode is true but item is active', async () => {
      mockNavbar.chipMode.set(true);
      pinnedComponent.pinned.set(true);
      pinnedComponent.activeOverride.set(true);
      await pinnedFixture.whenStable();

      const link = pinnedFixture.nativeElement.querySelector('a');
      expect(link).not.toHaveClass('is-pinned-chip');
    });

    it('should not add is-pinned-chip class when item is not pinned', async () => {
      mockNavbar.chipMode.set(true);
      pinnedComponent.pinned.set(false);
      await pinnedFixture.whenStable();

      const link = pinnedFixture.nativeElement.querySelector('a');
      expect(link).not.toHaveClass('is-pinned-chip');
    });

    it('should not add is-pinned-chip class when textOnly is true', async () => {
      mockNavbar.chipMode.set(true);
      mockNavbar.textOnly.set(true);
      pinnedComponent.pinned.set(true);
      await pinnedFixture.whenStable();

      const link = pinnedFixture.nativeElement.querySelector('a');
      expect(link).not.toHaveClass('is-pinned-chip');
      expect(link).not.toHaveClass('is-chip');
    });

    it('should attach a tooltip with the projected label when item becomes a pinned chip', async () => {
      const createTooltipSpy = vi
        .spyOn(SiTooltipService.prototype, 'createTooltip')
        .mockImplementation(() => ({ destroy: vi.fn() }));

      mockNavbar.chipMode.set(true);
      pinnedComponent.pinned.set(true);
      await pinnedFixture.whenStable();

      expect(createTooltipSpy).toHaveBeenCalledTimes(1);
      const config = createTooltipSpy.mock.calls[0][0];
      expect(config).toMatchObject({ placement: 'bottom' });

      const tooltipSource = config.tooltip() as { nativeElement: HTMLElement };
      expect(tooltipSource.nativeElement.textContent?.trim()).toBe('Pinned Test Item');
    });

    it('should not attach an auto-tooltip when consumer applies an active [siTooltip]', async () => {
      const createTooltipSpy = vi
        .spyOn(SiTooltipService.prototype, 'createTooltip')
        .mockImplementation(() => ({ destroy: vi.fn() }));

      const consumerFixture = TestBed.createComponent(
        TestHostWithPinnedAndConsumerTooltipComponent
      );
      consumerFixture.detectChanges();

      mockNavbar.chipMode.set(true);
      consumerFixture.componentInstance.pinned.set(true);
      await consumerFixture.whenStable();

      // The consumer's SiTooltipDirective also calls createTooltip (with `placement: 'auto'`).
      // Verify the component did not add its own tooltip on top by checking no call
      // used the component's `placement: 'bottom'`.
      const autoTooltipCall = createTooltipSpy.mock.calls.find(
        ([config]) => config.placement === 'bottom'
      );
      expect(autoTooltipCall).toBeUndefined();
    });
  });
});
