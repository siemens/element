/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiSidePanelContentComponent } from './si-side-panel-content.component';
import { SiSidePanelService } from './si-side-panel.service';

describe('SiSidePanelContentComponent', () => {
  let fixture: ComponentFixture<SiSidePanelContentComponent>;
  let element: HTMLElement;
  let sidePanelService: SiSidePanelService;
  let heading: WritableSignal<string>;

  beforeEach(() => {
    heading = signal('Title');
    fixture = TestBed.createComponent(SiSidePanelContentComponent, {
      bindings: [inputBinding('heading', heading)]
    });
    fixture.detectChanges();
    element = fixture.nativeElement;
    sidePanelService = TestBed.inject(SiSidePanelService);
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should toggle side panel on click', () => {
    spyOn(sidePanelService, 'toggle');
    const toggleBtnEl: HTMLElement | null = element.querySelector('.collapse-toggle button');
    toggleBtnEl?.click();
    fixture.detectChanges();

    expect(sidePanelService.toggle).toHaveBeenCalled();
  });
});
