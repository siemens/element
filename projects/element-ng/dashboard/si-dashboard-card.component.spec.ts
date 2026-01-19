/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { SiDashboardCardComponent } from './index';

@Component({
  imports: [SiDashboardCardComponent, RouterModule],
  template: `
    <si-dashboard-card
      [heading]="heading"
      [enableExpandInteraction]="enableExpandInteraction"
      [primaryActions]="primaryActions"
      [secondaryActions]="secondaryActions"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly card = viewChild.required(SiDashboardCardComponent);
  primaryActions: any;
  secondaryActions: any;
  heading = '';
  enableExpandInteraction = false;
}

describe('SiDashboardCardComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let element: HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterModule, NoopAnimationsModule, TestHostComponent]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;

    // Set required component input
    component.heading = '';
    component.primaryActions = [];
    component.secondaryActions = [];
  });

  it('should have a heading', () => {
    component.heading = 'TITLE_KEY';
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
      component.primaryActions = undefined as any;
      fixture.detectChanges();
      const contentActionBar = fixture.nativeElement.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
    });

    it('should be available with one primary action and not secondary action and disabled expand interaction', () => {
      component.primaryActions = [{ title: 'Action' }];
      fixture.detectChanges();
      const contentActionBar = fixture.nativeElement.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be available with one primary action added later and not secondary action and disabled expand interaction', () => {
      let contentActionBar = fixture.nativeElement.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
      component.primaryActions = [{ title: 'Action' }];
      fixture.detectChanges();
      contentActionBar = fixture.nativeElement.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be available with no primary action and one secondary action and disabled expand interaction', () => {
      component.secondaryActions = [{ title: 'Action' }];
      fixture.detectChanges();
      const contentActionBar = fixture.nativeElement.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be available with no primary action and one secondary action and enabled expand interaction', () => {
      component.secondaryActions = [{ title: 'Action' }];
      component.enableExpandInteraction = true;
      fixture.detectChanges();
      const contentActionBar = fixture.nativeElement.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be available with one primary action added later and not secondary action and disabled expand interaction', () => {
      let contentActionBar = fixture.nativeElement.querySelector('si-content-action-bar');
      expect(contentActionBar).toBeNull();
      component.secondaryActions = [{ title: 'Action' }];
      fixture.detectChanges();
      contentActionBar = fixture.nativeElement.querySelector('si-content-action-bar');
      expect(contentActionBar).not.toBeNull();
    });

    it('should be unavailable with no actions and disabled expand interaction after expanding by api', () => {
      fixture.detectChanges();
      component.card().expand();
      fixture.detectChanges();
      const contentActionBar = fixture.nativeElement.querySelector('si-content-action-bar');
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
      component.primaryActions = [{ title: 'Action' }];
      fixture.detectChanges();
      const contentActionBar = element.querySelector('[aria-label="Expand"]');
      expect(contentActionBar).toBeNull();
    });

    it('should be unavailable with no primary action and one secondary action', () => {
      component.secondaryActions = [{ title: 'Action' }];
      fixture.detectChanges();
      const contentActionBar = element.querySelector('[aria-label="Expand"]');
      expect(contentActionBar).toBeNull();
    });

    it('should be added when switching enableExpandInteraction to true', () => {
      let contentActionBar = fixture.nativeElement.querySelector('button');
      expect(contentActionBar).toBeNull();
      component.enableExpandInteraction = true;
      fixture.detectChanges();
      contentActionBar = element.querySelector('[title="Expand"]');
      expect(contentActionBar).not.toBeNull();
    });
  });

  it('expand and restore on by expand() and restore() api', () => {
    component.card().expand();
    fixture.detectChanges();
    expect(component.card().isExpanded()).toBeTrue();
    component.card().restore();
    fixture.detectChanges();
    expect(component.card().isExpanded()).toBeFalse();
  });

  it('expand and restore on click', () => {
    component.enableExpandInteraction = true;
    fixture.detectChanges();
    (element.querySelector('si-content-action-bar .dropdown-item') as HTMLElement).click();
    fixture.detectChanges();
    expect(component.card().isExpanded()).toBeTrue();
    (element.querySelector('si-content-action-bar .dropdown-item') as HTMLElement).click();
    fixture.detectChanges();
    expect(component.card().isExpanded()).toBeFalse();
  });

  it('expand and restore on click with one primary action', () => {
    component.enableExpandInteraction = true;
    component.primaryActions = [{ title: 'Action' }];
    fixture.detectChanges();
    // Second element in content action bar is our expand actions
    (element.querySelectorAll('si-content-action-bar .dropdown-item')[1] as HTMLElement).click();
    fixture.detectChanges();
    expect(component.card().isExpanded()).toBeTrue();
    (element.querySelectorAll('si-content-action-bar .dropdown-item')[1] as HTMLElement).click();
    fixture.detectChanges();
    expect(component.card().isExpanded()).toBeFalse();
  });

  it('expand and restore on click with one secondary action', () => {
    component.enableExpandInteraction = true;
    component.secondaryActions = [{ title: 'Action' }];
    fixture.detectChanges();
    (element.querySelector('si-content-action-bar .dropdown-item') as HTMLElement).click();
    fixture.detectChanges();
    expect(component.card().isExpanded()).toBeTrue();
    (element.querySelector('si-content-action-bar .dropdown-item') as HTMLElement).click();
    fixture.detectChanges();
    expect(component.card().isExpanded()).toBeFalse();
  });
});
