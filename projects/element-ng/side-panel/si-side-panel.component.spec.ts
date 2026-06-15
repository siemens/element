/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkPortal, PortalModule } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, signal, SimpleChange, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { ElementDimensions, ResizeObserverService } from '../resize-observer';
import { SiSidePanelComponent } from './si-side-panel.component';
import { SiSidePanelModule } from './si-side-panel.module';
import { SiSidePanelService } from './si-side-panel.service';
import { SidePanelMode } from './side-panel.model';

@Component({
  imports: [SiSidePanelModule, PortalModule],
  template: `<si-side-panel
      [collapsible]="collapsible()"
      [collapsed]="collapsed()"
      [mode]="mode()"
      (contentResize)="contentResize($event)"
    >
      <span>content</span>
    </si-side-panel>
    <ng-template #dynamicContent cdkPortal>
      <si-side-panel-content heading="side-panel">
        <div class="dynamic-content">Different content</div>
      </si-side-panel-content>
    </ng-template> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly sidePanel = viewChild.required(SiSidePanelComponent);
  readonly content = viewChild<CdkPortal, CdkPortal>('dynamicContent', { read: CdkPortal });
  readonly mode = signal<SidePanelMode>('over');
  readonly collapsible = signal(false);
  readonly collapsed = signal<boolean | undefined>(undefined);
  contentResize(e: ElementDimensions): void {}
}

describe('SiSidePanelComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;
  let service: SiSidePanelService;
  const resizeObserver = new Subject<ElementDimensions>();

  beforeEach(async () => {
    const resizeSpy = {
      observe: vi.fn((e: Element, t: number, i: boolean, im?: boolean) => {
        return resizeObserver;
      })
    };
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ResizeObserverService,
          useValue: resizeSpy
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    element = fixture.nativeElement;
    service = TestBed.inject(SiSidePanelService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should collapse', async () => {
    component.mode.set('scroll');
    await fixture.whenStable();

    service.open();
    vi.useFakeTimers();
    vi.advanceTimersByTime(0);
    fixture.detectChanges();

    const sidePanelElement = element.querySelector('si-side-panel')!;
    expect(sidePanelElement).not.toHaveClass('rpanel-collapsed');

    service.close();

    vi.advanceTimersByTime(500);
    fixture.detectChanges();

    expect(sidePanelElement).toHaveClass('rpanel-collapsed');
    vi.useRealTimers();
  });

  it('resize should not trigger contentResize output', async () => {
    const spy = vi.spyOn(component, 'contentResize');
    component.collapsed.set(false);
    await fixture.whenStable();
    resizeObserver.next({ width: 104, height: 104 });

    expect(spy).not.toHaveBeenCalled();
  });

  it('resize should trigger contentResize output', async () => {
    const spy = vi.spyOn(component, 'contentResize');
    component.collapsed.set(true);
    await fixture.whenStable();
    resizeObserver.next({ width: 104, height: 104 });

    expect(spy).toHaveBeenCalled();
  });

  it('should call service close on collapsed', async () => {
    const spy = vi.spyOn(service, 'close');
    component.collapsed.set(true);
    await fixture.whenStable();

    expect(spy).toHaveBeenCalled();
  });

  it('should call service open when not collapsed', () => {
    const spy = vi.spyOn(service, 'open');
    component.collapsed.set(false);
    component.sidePanel().ngOnChanges({
      collapsed: new SimpleChange(undefined, component.collapsed(), false)
    });

    expect(spy).toHaveBeenCalled();
  });

  describe('with toggleSidePanel', () => {
    it('should call service toggle when collapsible', async () => {
      component.collapsible.set(true);
      await fixture.whenStable();
      const spy = vi.spyOn(service, 'toggle');

      component.sidePanel().toggleSidePanel();
      expect(spy).toHaveBeenCalled();
    });

    it('should call service close when not collapsible', () => {
      component.collapsible.set(false);
      const spy = vi.spyOn(service, 'close');

      component.sidePanel().toggleSidePanel();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('with flexible content', () => {
    it('should show dynamic side panel content', async () => {
      const template = component.content();
      service.setSidePanelContent(template);
      await fixture.whenStable();

      const title = element.querySelector<HTMLDivElement>('p.si-h5');
      expect(title).toHaveTextContent('side-panel');
      const content = element.querySelector<HTMLDivElement>('div.dynamic-content');
      expect(content).toBeTruthy();
    });

    it('should show temp content', async () => {
      service.showTemporaryContent(component.content());
      await fixture.whenStable();

      const title = element.querySelector<HTMLDivElement>('p.si-h5');
      expect(title).toHaveTextContent('side-panel');
      const innerElements = Array.from(element.querySelectorAll<HTMLDivElement>('div.inner'));
      expect(innerElements).toHaveLength(2);
      // Ensure temp content is visible
      expect(innerElements.at(1)).not.toHaveClass('d-none');
      const content = element.querySelector<HTMLDivElement>('div.dynamic-content');
      expect(content).toBeTruthy();
    });

    it('should hide temp content', async () => {
      service.showTemporaryContent(component.content());
      await fixture.whenStable();
      service.hideTemporaryContent();
      await fixture.whenStable();

      const innerElements = Array.from(element.querySelectorAll<HTMLDivElement>('div.inner'));
      expect(innerElements).toHaveLength(2);
      // Ensure temp content is hidden
      expect(innerElements.at(1)).toHaveClass('d-none');
    });
  });
});
