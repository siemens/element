/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SiSidePanelModule } from './si-side-panel.module';
import { SiSidePanelService } from './si-side-panel.service';

@Component({
  imports: [SiSidePanelModule],
  template: `<si-side-panel-content heading="Title" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {}

describe('SiSidePanelContentComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;
  let sidePanelService: SiSidePanelService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SiSidePanelModule, TestHostComponent]
    }).compileComponents();
  }));

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
});
