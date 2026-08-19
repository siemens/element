/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { AccordionHarness } from '@angular/aria/accordion/testing';
import { HarnessLoader, parallel } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, inject, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiAccordionHCollapseService } from './si-accordion-hcollapse.service';
import { SiAccordionComponent } from './si-accordion.component';
import { SiCollapsiblePanelComponent } from './si-collapsible-panel.component';

@Component({
  imports: [SiAccordionComponent, SiCollapsiblePanelComponent],
  template: `
    <si-accordion [expandFirstPanel]="expandFirstPanel()" [fullHeight]="fullHeight()">
      <si-collapsible-panel heading="one"><div>content</div></si-collapsible-panel>
      <si-collapsible-panel heading="two"><div>content</div></si-collapsible-panel>
      <si-collapsible-panel heading="three"><div>content</div></si-collapsible-panel>
    </si-accordion>
  `,
  providers: [SiAccordionHCollapseService]
})
class TestHostComponent {
  readonly hcollapseService = inject(SiAccordionHCollapseService);
  readonly component = viewChild.required(SiAccordionComponent);
  readonly expandFirstPanel = signal(true);
  readonly fullHeight = signal(false);
}

describe('SiAccordion', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  const getAccordions = (): Promise<AccordionHarness[]> => loader.getAllHarnesses(AccordionHarness);

  const checkExpanded = async (...states: boolean[]): Promise<void> => {
    const accordions = await getAccordions();
    const expandedStates = await parallel(() =>
      accordions.map(accordion => accordion.isExpanded())
    );

    expect(accordions).toHaveLength(states.length);
    expect(expandedStates).toEqual(states);
  };

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('expands the first panel by default', async () => {
    fixture.detectChanges();
    await checkExpanded(true, false, false);
  });

  it('configure the first panel to be closed', async () => {
    component.expandFirstPanel.set(false);
    fixture.detectChanges();
    await checkExpanded(false, false, false);
  });

  it('configure the first panel to be open', async () => {
    component.expandFirstPanel.set(true);
    fixture.detectChanges();
    await checkExpanded(true, false, false);
  });

  it('expands a panel and closes others', async () => {
    fixture.detectChanges();
    const accordions = await getAccordions();

    await accordions[1].expand();
    await checkExpanded(false, true, false);

    await accordions[1].collapse();
    await checkExpanded(false, false, false);
  });

  it('connects each trigger with its panel', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    const headers = element.querySelectorAll<HTMLElement>('.collapsible-header');
    const panels = element.querySelectorAll<HTMLElement>('.collapsible-content');

    headers.forEach((header, index) => {
      expect(header).toHaveAttribute('role', 'button');
      expect(header).toHaveAttribute('aria-controls', panels[index].id);
      expect(panels[index]).toHaveAttribute('role', 'region');
      expect(panels[index]).toHaveAttribute('aria-labelledby', header.id);
    });
  });

  it('toggles a focused panel with Enter', async () => {
    fixture.detectChanges();
    const accordions = await getAccordions();
    const headers = element.querySelectorAll<HTMLElement>('.collapsible-header');
    await accordions[1].focus();

    headers[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();

    await checkExpanded(false, true, false);
  });

  it('preserves full-height layout classes', async () => {
    component.fullHeight.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(element.querySelector('si-accordion')).toHaveClass('full-height');
    expect(element.querySelector('si-collapsible-panel')).toHaveClass('full-height');
    expect(element.querySelector('.collapsible-content')).toHaveClass('full-height');
  });

  it('opens the selected panel from horizontal-collapse mode', async () => {
    const openSidePanel = vi.fn();
    component.hcollapseService.open$.subscribe(openSidePanel);
    fixture.detectChanges();
    component.hcollapseService.hcollapsed.set(true);
    await fixture.whenStable();
    const accordions = await getAccordions();

    await accordions[1].expand();

    expect(element.querySelector('si-accordion')).toHaveClass('hcollapsed');
    expect(element.querySelectorAll('si-collapsible-panel')[1]).toHaveClass('hcollapsed');
    await checkExpanded(false, true, false);
    expect(openSidePanel).toHaveBeenCalledOnce();
  });

  it('moves focus between panel headers with arrow keys', async () => {
    fixture.detectChanges();
    const accordions = await getAccordions();
    const headers = element.querySelectorAll<HTMLElement>('.collapsible-header');
    await accordions[0].focus();

    headers[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

    expect(await accordions[1].isFocused()).toBe(true);
  });
});
