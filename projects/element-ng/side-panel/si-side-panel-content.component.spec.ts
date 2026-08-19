/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';

import { SiSidePanelContentComponent } from './si-side-panel-content.component';
import { SiSidePanelModule } from './si-side-panel.module';
import { SiSidePanelService } from './si-side-panel.service';
import { SidePanelDisplayMode, SidePanelNavigateConfig } from './side-panel.model';

@Component({
  imports: [SiSidePanelModule],
  template: `<si-side-panel [collapsed]="false">
    <si-side-panel-content
      heading="Title"
      backButtonLabel="Back to devices"
      [showBackButton]="showBackButton()"
      [displayMode]="displayMode()"
      [navigateConfig]="navigateConfig"
      (back)="back()"
    />
  </si-side-panel>`
})
class TestHostComponent {
  readonly sidePanelContent = viewChild.required(SiSidePanelContentComponent);
  readonly showBackButton = signal(false);
  readonly displayMode = signal<SidePanelDisplayMode | undefined>(undefined);
  readonly back = vi.fn();
  readonly navigateConfig: SidePanelNavigateConfig = {
    type: 'link',
    label: 'Navigate',
    href: '/details'
  };
}

describe('SiSidePanelContentComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;
  let sidePanelService: SiSidePanelService;
  let component: TestHostComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
    sidePanelService = TestBed.inject(SiSidePanelService);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should toggle side panel on click', () => {
    vi.spyOn(sidePanelService, 'toggle');
    const toggleBtnEl: HTMLElement | null = element.querySelector('.collapse-toggle button');
    toggleBtnEl?.click();
    fixture.detectChanges();

    expect(sidePanelService.toggle).toHaveBeenCalled();
  });

  it('should show the optional back button and emit when activated', async () => {
    const backButton = page.getByRole('button', { name: 'Back to devices' });

    await expect.element(backButton).not.toBeInTheDocument();

    component.showBackButton.set(true);
    await fixture.whenStable();

    await expect.element(backButton).toBeInTheDocument();

    component.sidePanelContent().focusBackButton();
    await expect.element(backButton).toHaveFocus();

    await userEvent.click(backButton);

    expect(component.back).toHaveBeenCalledOnce();
  });

  it('should show fullscreen/navigation button based on display mode', () => {
    const getNavigateLink = (): HTMLAnchorElement | null =>
      element.querySelector<HTMLAnchorElement>('a[href="/details"]');

    expect(element.querySelector('.fullscreen-button')).not.toBeInTheDocument();
    expect(getNavigateLink()).not.toBeInTheDocument();

    component.displayMode.set('overlay');
    fixture.detectChanges();

    expect(element.querySelector('.fullscreen-button')).toBeInTheDocument();
    expect(getNavigateLink()).not.toBeInTheDocument();

    component.displayMode.set('navigate');
    fixture.detectChanges();

    expect(element.querySelector('.fullscreen-button')).not.toBeInTheDocument();
    expect(getNavigateLink()).toBeInTheDocument();
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
