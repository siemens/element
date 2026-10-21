/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { Component, signal, viewChild, viewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ElementDimensions, ResizeObserverService } from '@siemens/element-ng/resize-observer';
import { Subject } from 'rxjs';

import { SiDashboardCardComponent, SiDashboardComponent } from './index';

const menubarOffset = (element: HTMLElement): string =>
  getComputedStyle(element.querySelector('select')!.parentElement!).marginInlineStart;

@Component({
  imports: [SiDashboardCardComponent, SiDashboardComponent, NgTemplateOutlet],
  template: `
    <si-dashboard
      style="height: 300px"
      [heading]="heading()"
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
  `
})
class WrapperComponent {
  readonly dashboard = viewChild.required(SiDashboardComponent);
  readonly cardComponents = viewChildren(SiDashboardCardComponent);
  readonly heading = signal<string | undefined>('Dashboard');
  readonly primaryActions = signal<any>(undefined);
  readonly secondaryActions = signal<any>(undefined);
  readonly enableExpandInteractions = signal(false);
  readonly cards = signal(['Item1', 'Item2']);
  readonly showMenubar = signal([true, true]);
}

@Component({
  imports: [SiDashboardComponent],
  template: `
    <si-dashboard style="height: 300px" [heading]="heading()">
      @if (showHeader()) {
        <div class="si-layout-header" header>
          <h2 class="si-layout-title si-layout-top-element">Custom heading</h2>
          <p class="si-layout-subtitle">Custom description</p>
        </div>
      }
      <ng-container menubar><select></select></ng-container>
      <ng-container dashboard />
    </si-dashboard>
  `
})
class CustomHeaderWrapperComponent {
  readonly heading = signal<string | undefined>(undefined);
  readonly showHeader = signal(true);
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

    it('keeps focus on the expand and restore action', async () => {
      const card = component.cardComponents()[0];
      const cardElement: HTMLElement = card.element.nativeElement;
      cardElement
        .querySelector<HTMLElement>('si-menu-bar')!
        .style.setProperty('visibility', 'visible', 'important');
      const expandButton = cardElement.querySelector<HTMLButtonElement>(
        'button[aria-label="Expand"]'
      )!;
      expandButton.focus();
      expect(document.activeElement).toBe(expandButton);
      expandButton.click();
      await fixture.whenStable();

      const restoreButton = cardElement.querySelector<HTMLButtonElement>(
        'button[aria-label="Restore"]'
      )!;
      expect(document.activeElement).toBe(restoreButton);

      restoreButton.click();
      await fixture.whenStable();
      expect(document.activeElement).toBe(expandButton);
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

  describe('header', () => {
    beforeEach(() => {
      element.style.setProperty('--si-layout-header-first-element-offset', '40px');
    });

    it('should render the heading as page title', () => {
      expect(element.querySelector('h2.si-layout-title')).toHaveTextContent('Dashboard');
      expect(menubarOffset(element)).toBe('0px');
    });

    it('should reserve space for the navigation in the menu bar without heading', async () => {
      component.heading.set(undefined);
      await fixture.whenStable();

      expect(element.querySelector('h2')).not.toBeInTheDocument();
      expect(menubarOffset(element)).toBe('40px');
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

describe('SiDashboardComponent with custom header', () => {
  let fixture: ComponentFixture<CustomHeaderWrapperComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomHeaderWrapperComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomHeaderWrapperComponent);
    element = fixture.nativeElement;
    element.style.setProperty('--si-layout-header-first-element-offset', '40px');
    fixture.detectChanges();
  });

  it('should render the projected header', () => {
    expect(element.querySelector('h2.si-layout-title')).toHaveTextContent('Custom heading');
    expect(element.querySelector('.si-layout-subtitle')).toHaveTextContent('Custom description');
  });

  it('should not reserve space for the navigation in the menu bar', () => {
    expect(menubarOffset(element)).toBe('0px');
  });

  it('should reserve space for the navigation in the menu bar if no header is rendered', async () => {
    fixture.componentInstance.showHeader.set(false);
    await fixture.whenStable();

    expect(element.querySelector('h2')).not.toBeInTheDocument();
    expect(menubarOffset(element)).toBe('40px');
  });

  it('should not render the heading input', async () => {
    fixture.componentInstance.heading.set('Dashboard');
    await fixture.whenStable();

    const headings = element.querySelectorAll('h2');
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Custom heading');
  });
});
