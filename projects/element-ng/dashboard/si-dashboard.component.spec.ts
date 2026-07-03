/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, viewChild, viewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ElementDimensions, ResizeObserverService } from '@siemens/element-ng/resize-observer';
import { Subject } from 'rxjs';

import { SiDashboardCardComponent, SiDashboardComponent } from './index';

@Component({
  imports: [SiDashboardCardComponent, SiDashboardComponent, NgTemplateOutlet],
  template: `
    <si-dashboard
      heading="Dashboard"
      style="height: 300px"
      [enableExpandInteractions]="enableExpandInteractions()"
    >
      <ng-container menubar><select></select></ng-container>
      <ng-container dashboard>
        @for (item of cards(); track $index) {
          <si-dashboard-card
            class="row"
            [heading]="'heading ' + ($index + 1)"
            [primaryActions]="primaryActions()"
            [secondaryActions]="secondaryActions()"
            [showMenubar]="showMenubar()[$index]"
          >
            <ng-container *ngTemplateOutlet="cardTemplate" body />
            <ng-template #cardTemplate>
              <p class="card-body card-text">{{ item }}</p>
            </ng-template>
          </si-dashboard-card>
        }
      </ng-container>
    </si-dashboard>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {
  readonly dashboard = viewChild.required(SiDashboardComponent);
  readonly cardComponents = viewChildren(SiDashboardCardComponent);
  readonly primaryActions = signal<any>(undefined);
  readonly secondaryActions = signal<any>(undefined);
  readonly enableExpandInteractions = signal(false);
  readonly cards = signal(['Item1', 'Item2']);
  readonly showMenubar = signal([true, true]);
}

describe('SiDashboardComponent', () => {
  let component: WrapperComponent;
  let fixture: ComponentFixture<WrapperComponent>;
  let element: HTMLElement;
  const dashboardResizeObserver = new Subject<ElementDimensions>();
  const frameResizeObserver = new Subject<ElementDimensions>();

  beforeEach(async () => {
    const resizeSpy = {
      observe: vi.fn().mockName('ResizeObserverService.observe')
    };
    resizeSpy.observe.mockImplementation((e: Element, t: number, i: boolean, im?: boolean) => {
      if (e === element.querySelector('dashboard')) {
        return dashboardResizeObserver;
      }
      return frameResizeObserver;
    });

    await TestBed.configureTestingModule({
      imports: [WrapperComponent],
      providers: [
        {
          provide: ResizeObserverService,
          useValue: resizeSpy
        }
      ]
    }).compileComponents();
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(WrapperComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  describe('with enableExpandInteraction', () => {
    beforeEach(async () => {
      component.enableExpandInteractions.set(true);
      await fixture.whenStable();
    });

    it('should show expand menu', () => {
      component.cardComponents().forEach(c => {
        expect(c.enableExpandInteractionComputed()).toBe(true);
      });
    });

    it('should register on cards and call dashboard expand when card expand is invoked', () => {
      const expandSpy = vi.spyOn(component.dashboard(), 'expand');
      component.cardComponents().forEach(c => {
        c.expand();
        expect(expandSpy).toHaveBeenCalledWith(c);
      });
    });

    it('should trigger dashboard restoreDashboard when card restore is invoked', () => {
      const expandSpy = vi.spyOn(component.dashboard() as any, 'restoreDashboard');

      component.cardComponents().at(-1)!.restore();
      expect(expandSpy).toHaveBeenCalled();
      expect(component.cardComponents().at(-1)!.hide()).toBe(false);
    });

    it('should not call expand multiple times after initCards re-subscriptions', async () => {
      const expandSpy = vi.spyOn(component.dashboard(), 'expand');
      const card = component.cardComponents().at(0)!;

      // toggle enableExpandInteractions to trigger initCards re-subscriptions via ngOnChanges
      component.enableExpandInteractions.set(false);
      await fixture.whenStable();

      component.enableExpandInteractions.set(true);
      await fixture.whenStable();

      component.enableExpandInteractions.set(false);
      await fixture.whenStable();

      component.enableExpandInteractions.set(true);
      await fixture.whenStable();

      // after multiple initCards cycles, expanding should only trigger expand once
      card.expand();
      expect(expandSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('resize should trigger setDashboardFrameEndPadding on resize', () => {
    const setPaddingSpy = vi.spyOn<SiDashboardComponent, any>(
      component.dashboard(),
      'setDashboardFrameEndPadding'
    );
    dashboardResizeObserver.next({ width: 100, height: 100 });
    frameResizeObserver.next({ width: 104, height: 104 });

    expect(setPaddingSpy).toHaveBeenCalledTimes(2);
  });

  it('#expand() shall expand a card', async () => {
    let expandDiv = fixture.debugElement.queryAll(By.css('div.position-relative'))[0];
    expect(expandDiv).toBeDefined();
    expect(expandDiv.classes['d-none']).toBe(true);

    const card = component.cardComponents().at(-1)!;
    expect(card).toBeDefined();
    component.dashboard().expand(card);
    await fixture.whenStable();

    expandDiv = fixture.debugElement.queryAll(By.css('div.position-relative'))[0];
    expect(expandDiv.classes['d-none']).toBeUndefined();
  });

  it('#restore() shall restore the dashboard', async () => {
    const card = component.cardComponents().at(-1)!;
    component.dashboard().expand(card);
    await fixture.whenStable();

    let expandDiv = fixture.debugElement.queryAll(By.css('div.position-relative'))[0];
    expect(expandDiv.classes['d-none']).toBeUndefined();

    component.dashboard().restore();
    await fixture.whenStable();

    expandDiv = fixture.debugElement.queryAll(By.css('div.position-relative'))[0];
    expect(expandDiv.classes['d-none']).toBeDefined();
  });

  it('expand card with card#hideMenubar shall hide the menu bar', async () => {
    const card = component.cardComponents().at(-1)!;
    component.showMenubar.set([true, false]);
    await fixture.whenStable();
    let select = fixture.debugElement.queryAll(By.css('select'))[0];
    expect(select).toBeDefined();

    component.dashboard().expand(card);
    await fixture.whenStable();
    select = fixture.debugElement.queryAll(By.css('select'))[0];
    expect(select).toBeUndefined();
  });

  it('#expand() called twice on different cards should restore first an apply expand on second', async () => {
    const card = component.cardComponents().at(-1)!;
    component.showMenubar.set([true, false]);
    await fixture.whenStable();
    let select = fixture.debugElement.queryAll(By.css('select'))[0];
    expect(select).toBeDefined();

    component.dashboard().expand(card);
    await fixture.whenStable();
    select = fixture.debugElement.queryAll(By.css('select'))[0];
    expect(select).toBeUndefined();
    let expanded = fixture.debugElement.queryAll(By.css('div.position-relative'))[0];
    let header = expanded.children[0].queryAll(By.css('.card-header'))[0].nativeElement.outerText;
    expect(header).toContain('heading 2');

    const firstCard = component.cardComponents().at(0)!;
    component.dashboard().expand(firstCard);
    await fixture.whenStable();

    select = fixture.debugElement.queryAll(By.css('select'))[0];
    expect(select).toBeDefined();

    expanded = fixture.debugElement.queryAll(By.css('div.position-relative'))[0];
    header = expanded.children[0].queryAll(By.css('.card-header'))[0].nativeElement.outerText;
    expect(header).toContain('heading 1');
  });
});
