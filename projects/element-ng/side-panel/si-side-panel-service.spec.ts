/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkPortal, PortalModule } from '@angular/cdk/portal';
import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SiSidePanelService } from './si-side-panel.service';

@Component({
  selector: 'si-mock-component',
  imports: [PortalModule],
  template: `<ng-template #helpPanel cdkPortal>
      <h3>Help Panel</h3>
    </ng-template>
    <div>Test Mock Component</div>`
})
class MockComponent {
  readonly helpPanel = viewChild.required<CdkPortal, CdkPortal>('helpPanel', { read: CdkPortal });
}
describe('SiSidePanelService', () => {
  let service: SiSidePanelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PortalModule, MockComponent],
      providers: [SiSidePanelService]
    }).compileComponents();
  });

  beforeEach(() => {
    service = TestBed.inject(SiSidePanelService);
  });

  it('should set side panel content', () => {
    service.setSidePanelContent(undefined);
    service.content$.subscribe(content => expect(content).toBeUndefined());
  });

  it('should toggle content', () => {
    service.open();
    expect(service.isOpen()).toBeTrue();

    service.toggle();
    expect(service.isOpen()).toBeFalse();
  });
});
