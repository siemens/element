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
  let subHeading: WritableSignal<string>;
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
    subHeading = signal('');
    primaryActions = signal([]);
    secondaryActions = signal([]);
    enableExpandInteraction = signal(false);
    fixture = TestBed.createComponent(SiDashboardCardComponent, {
      bindings: [
        inputBinding('heading', heading),
        inputBinding('subHeading', subHeading),
        inputBinding('primaryActions', primaryActions),
        inputBinding('secondaryActions', secondaryActions),
        inputBinding('enableExpandInteraction', enableExpandInteraction)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should have a heading', async () => {
    heading.set('TITLE_KEY');
    await fixture.whenStable();
    expect(element.querySelector('.card-header')!).toHaveTextContent('TITLE_KEY');
  });

  it('should have a subHeading', async () => {
    heading.set('TITLE_KEY');
    subHeading.set('SUB_TITLE_KEY');
    await fixture.whenStable();
    expect(element.querySelector('.card-header .heading')!).toHaveTextContent('SUB_TITLE_KEY');
  });

  it('should not render subHeading when not set', async () => {
    heading.set('TITLE_KEY');
    await fixture.whenStable();
    const subHeadingEl = element.querySelector('.card-header .si-body.text-secondary');
    expect(subHeadingEl).toBeNull();
  });

  describe('content action bar', () => {
    it('should not be available without actions', async () => {
      await fixture.whenStable();
      const contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
    });

    it('should be unavailable with no actions and disabled expand interaction', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      const contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
    });

    it('should be unavailable with undefined primary actions and no secondary actions and disabled expand interaction', async () => {
      primaryActions.set(undefined as any);
      fixture.detectChanges();
      await fixture.whenStable();
      const contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
    });

    it('should be available with one primary action and not secondary action and disabled expand interaction', async () => {
      primaryActions.set([{ title: 'Action' }]);
      await fixture.whenStable();
      const contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be available with one primary action added later and not secondary action and disabled expand interaction', async () => {
      let contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
      primaryActions.set([{ title: 'Action' }]);
      await fixture.whenStable();
      contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be available with no primary action and one secondary action and disabled expand interaction', async () => {
      secondaryActions.set([{ title: 'Action' }]);
      await fixture.whenStable();
      const contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be available with no primary action and one secondary action and enabled expand interaction', async () => {
      secondaryActions.set([{ title: 'Action' }]);
      enableExpandInteraction.set(true);
      await fixture.whenStable();
      const contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be available with one secondary action added later and not primary action and disabled expand interaction', async () => {
      let contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
      secondaryActions.set([{ title: 'Action' }]);
      await fixture.whenStable();
      contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be unavailable with no actions and disabled expand interaction after expanding by api', async () => {
      fixture.detectChanges();
      fixture.componentInstance.expand();
      await fixture.whenStable();
      const contentActionBar = element.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
    });
  });

  describe('expand restore button', () => {
    it('should not be available without actions', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      const contentActionBar = element.querySelector('[aria-label="Expand"]');
      expect(contentActionBar).toBeNull();
    });

    it('should be unavailable without actions and disabled expand interaction', async () => {
      await fixture.whenStable();
      const contentActionBar = element.querySelector('[aria-label="Expand"]');
      expect(contentActionBar).toBeNull();
    });

    it('should be unavailable with one primary action and no secondary action', async () => {
      primaryActions.set([{ title: 'Action' }]);
      await fixture.whenStable();
      const contentActionBar = element.querySelector('[aria-label="Expand"]');
      expect(contentActionBar).toBeNull();
    });

    it('should be unavailable with no primary action and one secondary action', async () => {
      secondaryActions.set([{ title: 'Action' }]);
      await fixture.whenStable();
      const contentActionBar = element.querySelector('[aria-label="Expand"]');
      expect(contentActionBar).toBeNull();
    });

    it('should be added when switching enableExpandInteraction to true', async () => {
      let contentActionBar = element.querySelector('button');
      expect(contentActionBar).toBeNull();
      enableExpandInteraction.set(true);
      await fixture.whenStable();
      contentActionBar = element.querySelector('[aria-label="Expand"]');
      expect(contentActionBar).not.toBeNull();
    });
  });

  it('expand and restore on by expand() and restore() api', async () => {
    fixture.componentInstance.expand();
    await fixture.whenStable();
    expect(fixture.componentInstance.isExpanded()).toBe(true);
    fixture.componentInstance.restore();
    await fixture.whenStable();
    expect(fixture.componentInstance.isExpanded()).toBe(false);
  });

  it('expand and restore on click', async () => {
    enableExpandInteraction.set(true);
    await fixture.whenStable();
    element
      .querySelector<HTMLElement>('si-content-action-bar button[aria-label="Expand"]')!
      .click();
    await fixture.whenStable();
    expect(fixture.componentInstance.isExpanded()).toBe(true);
    element
      .querySelector<HTMLElement>('si-content-action-bar button[aria-label="Restore"]')!
      .click();
    await fixture.whenStable();
    expect(fixture.componentInstance.isExpanded()).toBe(false);
  });

  it('expand and restore on click with one primary action', async () => {
    enableExpandInteraction.set(true);
    primaryActions.set([{ title: 'Action' }]);
    await fixture.whenStable();
    // Second element in content action bar is our expand actions
    element
      .querySelector<HTMLElement>('si-content-action-bar button[aria-label="Expand"]')!
      .click();
    await fixture.whenStable();
    expect(fixture.componentInstance.isExpanded()).toBe(true);
    element
      .querySelector<HTMLElement>('si-content-action-bar button[aria-label="Restore"]')!
      .click();
    await fixture.whenStable();
    expect(fixture.componentInstance.isExpanded()).toBe(false);
  });

  it('expand and restore on click with one secondary action', async () => {
    enableExpandInteraction.set(true);
    secondaryActions.set([{ title: 'Action' }]);
    await fixture.whenStable();
    element
      .querySelector<HTMLElement>('si-content-action-bar button[aria-label="Expand"]')!
      .click();
    await fixture.whenStable();
    expect(fixture.componentInstance.isExpanded()).toBe(true);
    element
      .querySelector<HTMLElement>('si-content-action-bar button[aria-label="Restore"]')!
      .click();
    await fixture.whenStable();
    expect(fixture.componentInstance.isExpanded()).toBe(false);
  });
});
