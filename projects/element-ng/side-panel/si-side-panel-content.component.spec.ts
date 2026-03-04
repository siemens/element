/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiSidePanelModule } from './si-side-panel.module';
import { SiSidePanelService } from './si-side-panel.service';
import { SidePanelDisplayMode, SidePanelNavigateConfig } from './side-panel.model';

@Component({
  imports: [SiSidePanelModule],
  template: `<si-side-panel [collapsed]="false">
    <si-side-panel-content
      heading="Title"
      [displayMode]="displayMode()"
      [navigateConfig]="navigateConfig"
    />
  </si-side-panel>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly displayMode = signal<SidePanelDisplayMode | undefined>(undefined);
  readonly navigateConfig: SidePanelNavigateConfig = {
    type: 'link',
    label: 'Navigate',
    href: '/details'
  };
}

describe('SiSidePanelContentComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;
  let sidePanelService: SiSidePanelService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiSidePanelModule, TestHostComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement;
    sidePanelService = TestBed.inject(SiSidePanelService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle side panel on click', () => {
    spyOn(sidePanelService, 'toggle');
    const toggleBtnEl: HTMLElement | null = element.querySelector('.collapse-toggle button');
    toggleBtnEl?.click();
    fixture.detectChanges();

    expect(sidePanelService.toggle).toHaveBeenCalled();
  });

  it('should show fullscreen/navigation button based on display mode', () => {
    const getNavigateLink = (): HTMLAnchorElement | null =>
      element.querySelector<HTMLAnchorElement>('a[href="/details"]');

    expect(element.querySelector('.fullscreen-button')).toBeNull();
    expect(getNavigateLink()).toBeNull();

    component.displayMode.set('overlay');
    fixture.detectChanges();

    expect(element.querySelector('.fullscreen-button')).toBeTruthy();
    expect(getNavigateLink()).toBeNull();

    component.displayMode.set('navigate');
    fixture.detectChanges();

    expect(element.querySelector('.fullscreen-button')).toBeNull();
    expect(getNavigateLink()).toBeTruthy();
  });

  it('should hide fullscreen button on css breakpoints that force fullscreen mode', () => {
    component.displayMode.set('overlay');
    fixture.detectChanges();

    const fullscreenButton = element.querySelector<HTMLButtonElement>('.fullscreen-button');
    const sidePanel = element.querySelector<HTMLElement>('si-side-panel');
    expect(fullscreenButton).toBeTruthy();
    expect(sidePanel).toBeTruthy();

    expect(getComputedStyle(fullscreenButton!).display).not.toBe('none');

    sidePanel!.classList.add('rpanel-resize-xs');
    expect(getComputedStyle(fullscreenButton!).display).toBe('none');

    sidePanel!.classList.remove('rpanel-resize-xs');
    sidePanel!.classList.add('rpanel-resize-sm', 'rpanel-size--extended');
    expect(getComputedStyle(fullscreenButton!).display).toBe('none');

    sidePanel!.classList.remove('rpanel-size--extended');
    expect(getComputedStyle(fullscreenButton!).display).not.toBe('none');
  });
});
