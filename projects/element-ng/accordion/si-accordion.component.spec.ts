/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiAccordionComponent } from './si-accordion.component';
import { SiCollapsiblePanelComponent } from './si-collapsible-panel.component';

@Component({
  imports: [SiTranslateModule, SiAccordionComponent, SiCollapsiblePanelComponent],
  template: `
    <si-accordion [expandFirstPanel]="expandFirstPanel()">
      <si-collapsible-panel heading="one"><div>content</div></si-collapsible-panel>
      <si-collapsible-panel heading="two"><div>content</div></si-collapsible-panel>
      <si-collapsible-panel heading="three"><div>content</div></si-collapsible-panel>
    </si-accordion>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly component = viewChild.required(SiAccordionComponent);
  readonly expandFirstPanel = signal(true);
}

describe('SiAccordion', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SiTranslateModule, NoopAnimationsModule, TestHostComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  const checkExpanded = (...states: boolean[]): void => {
    const headers = element.querySelectorAll('.collapsible-header') as NodeListOf<HTMLElement>;
    headers.forEach((header, index) => {
      expect(header.classList.contains('open')).toBe(states[index]);
    });
  };

  const clickOnHeader = (index: number): void => {
    const headers = element.querySelectorAll('.collapsible-header') as NodeListOf<HTMLElement>;
    headers[index].click();
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('expands the first panel by default', () => {
    fixture.detectChanges();
    checkExpanded(true, false, false);
  });

  it('configure the first panel to be closed ', () => {
    component.expandFirstPanel.set(false);
    fixture.detectChanges();
    checkExpanded(false, false, false);
  });

  it('configure the first panel to be open ', () => {
    component.expandFirstPanel.set(true);
    fixture.detectChanges();
    checkExpanded(true, false, false);
  });

  it('expands a panel and closes others', fakeAsync(() => {
    fixture.detectChanges();

    // open second panel
    clickOnHeader(1);
    flush();
    fixture.detectChanges();
    checkExpanded(false, true, false);

    // close second panel
    clickOnHeader(1);
    flush();
    fixture.detectChanges();
    checkExpanded(false, false, false);
  }));
});
