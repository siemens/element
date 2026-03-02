/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { SiDashboardCardComponent } from './index';

describe('SiDashboardCardComponent', () => {
  let fixture: ComponentFixture<SiDashboardCardComponent>;
  let element: HTMLElement;
  let heading: WritableSignal<string>;
  let primaryActions: WritableSignal<any>;
  let secondaryActions: WritableSignal<any>;
  let enableExpandInteraction: WritableSignal<boolean>;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterModule]
    })
  );

  beforeEach(() => {
    heading = signal('');
    primaryActions = signal([]);
    secondaryActions = signal([]);
    enableExpandInteraction = signal(false);
    fixture = TestBed.createComponent(SiDashboardCardComponent, {
      bindings: [
        inputBinding('heading', heading),
        inputBinding('primaryActions', primaryActions),
        inputBinding('secondaryActions', secondaryActions),
        inputBinding('enableExpandInteraction', enableExpandInteraction)
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
      primaryActions.set([{ title: 'Action' }]);
      fixture.detectChanges();
      const contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be available with one primary action added later and not secondary action and disabled expand interaction', () => {
      let contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
      primaryActions.set([{ title: 'Action' }]);
      fixture.detectChanges();
      contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be available with no primary action and one secondary action and disabled expand interaction', () => {
      secondaryActions.set([{ title: 'Action' }]);
      fixture.detectChanges();
      const contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be available with no primary action and one secondary action and enabled expand interaction', () => {
      secondaryActions.set([{ title: 'Action' }]);
      enableExpandInteraction.set(true);
      fixture.detectChanges();
      const contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be available with one secondary action added later and not primary action and disabled expand interaction', () => {
      let contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
      secondaryActions.set([{ title: 'Action' }]);
      fixture.detectChanges();
      contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be unavailable with no actions and disabled expand interaction after expanding by api', () => {
      fixture.detectChanges();
      fixture.componentInstance.expand();
      fixture.detectChanges();
      const contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
    });
  });

  describe('expand restore button', () => {
    it('should not be available without actions', () => {
      fixture.detectChanges();
      const contentActionBar = element.querySelector('[aria-label="Expand"]');
      expect(contentActionBar).toBeNull();
    });

    it('should be unavailable without actions and disabled expand interaction', () => {
      fixture.detectChanges();
      const contentActionBar = element.querySelector('[aria-label="Expand"]');
      expect(contentActionBar).toBeNull();
    });

    it('should be unavailable with one primary action and no secondary action', () => {
      primaryActions.set([{ title: 'Action' }]);
      fixture.detectChanges();
      const contentActionBar = element.querySelector('[aria-label="Expand"]');
      expect(contentActionBar).toBeNull();
    });

    it('should be unavailable with no primary action and one secondary action', () => {
      secondaryActions.set([{ title: 'Action' }]);
      fixture.detectChanges();
      const contentActionBar = element.querySelector('[aria-label="Expand"]');
      expect(contentActionBar).toBeNull();
    });

    it('should be added when switching enableExpandInteraction to true', () => {
      let contentActionBar = element.querySelector('button');
      expect(contentActionBar).toBeNull();
      enableExpandInteraction.set(true);
      fixture.detectChanges();
      contentActionBar = element.querySelector('[aria-label="Expand"]');
      expect(contentActionBar).not.toBeNull();
    });
  });

  it('expand and restore on by expand() and restore() api', () => {
    fixture.componentInstance.expand();
    fixture.detectChanges();
    expect(fixture.componentInstance.isExpanded()).toBe(true);
    fixture.componentInstance.restore();
    fixture.detectChanges();
    expect(fixture.componentInstance.isExpanded()).toBe(false);
  });

  it('expand and restore on click', () => {
    enableExpandInteraction.set(true);
    fixture.detectChanges();
    element
      .querySelector<HTMLElement>('si-content-action-bar button[aria-label="Expand"]')!
      .click();
    fixture.detectChanges();
    expect(fixture.componentInstance.isExpanded()).toBe(true);
    element
      .querySelector<HTMLElement>('si-content-action-bar button[aria-label="Restore"]')!
      .click();
    fixture.detectChanges();
    expect(fixture.componentInstance.isExpanded()).toBe(false);
  });

  it('expand and restore on click with one primary action', () => {
    enableExpandInteraction.set(true);
    primaryActions.set([{ title: 'Action' }]);
    fixture.detectChanges();
    // Second element in content action bar is our expand actions
    element
      .querySelector<HTMLElement>('si-content-action-bar button[aria-label="Expand"]')!
      .click();
    fixture.detectChanges();
    expect(fixture.componentInstance.isExpanded()).toBe(true);
    element
      .querySelector<HTMLElement>('si-content-action-bar button[aria-label="Restore"]')!
      .click();
    fixture.detectChanges();
    expect(fixture.componentInstance.isExpanded()).toBe(false);
  });

  it('expand and restore on click with one secondary action', () => {
    enableExpandInteraction.set(true);
    secondaryActions.set([{ title: 'Action' }]);
    fixture.detectChanges();
    element
      .querySelector<HTMLElement>('si-content-action-bar button[aria-label="Expand"]')!
      .click();
    fixture.detectChanges();
    expect(fixture.componentInstance.isExpanded()).toBe(true);
    element
      .querySelector<HTMLElement>('si-content-action-bar button[aria-label="Restore"]')!
      .click();
    fixture.detectChanges();
    expect(fixture.componentInstance.isExpanded()).toBe(false);
  });
});
