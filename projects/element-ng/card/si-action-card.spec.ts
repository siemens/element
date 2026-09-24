/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { SiActionCardComponent } from './index';
import { SiActionCardHarness } from './testing/si-action-card.harnes';
@Component({
  imports: [SiActionCardComponent, RouterModule],
  template: `
    <div>
      <button
        type="button"
        si-action-card
        [disabled]="disabled()"
        [heading]="heading"
        [subHeading]="subHeading"
        [selectable]="selectable()"
        >Action card</button
      >
    </div>
  `
})
class WrapperComponent {
  heading = 'Test';
  subHeading = 'Description';
  readonly selectable = input(false);
  readonly disabled = input(false);
}

describe('SiActionCardComponent', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let loader: HarnessLoader;
  let actionCardHarness: SiActionCardHarness;

  beforeEach(async () => {
    fixture = TestBed.createComponent(WrapperComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    actionCardHarness = await loader.getHarness(SiActionCardHarness);
  });

  it('should not be selected by default', async () => {
    fixture.detectChanges();
    expect(await actionCardHarness.isSelected()).toBe(false);
  });

  it('should be selectable when enabled', async () => {
    fixture.componentRef.setInput('selectable', true);
    expect(await actionCardHarness.isSelected()).toBe(false);
    await actionCardHarness.clickActionButton();
    expect(await actionCardHarness.isSelected()).toBe(true);
  });

  it('should toggle selected state on click', async () => {
    fixture.componentRef.setInput('selectable', true);
    expect(await actionCardHarness.isSelected()).toBe(false);
    await actionCardHarness.clickActionButton();
    expect(await actionCardHarness.isSelected()).toBe(true);
    await actionCardHarness.clickActionButton();
    expect(await actionCardHarness.isSelected()).toBe(false);
  });

  it('should not be selectable when disabled', async () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('selectable', true);
    expect(await actionCardHarness.isSelected()).toBe(false);
    await actionCardHarness.clickActionButton();
    expect(await actionCardHarness.isSelected()).toBe(false);
  });

  it('should reference generated heading and content ids', async () => {
    await fixture.whenStable();
    const actionCard: HTMLElement = fixture.nativeElement.querySelector('[si-action-card]');
    const labelledBy = actionCard.getAttribute('aria-labelledby')!;
    const describedBy = actionCard.getAttribute('aria-describedby')!.split(' ');

    expect(actionCard.querySelector(`[id="${labelledBy}"]`)).toHaveTextContent('Test');
    expect(describedBy).toHaveLength(2);
    expect(actionCard.querySelector(`[id="${describedBy[0]}"]`)).toHaveTextContent('Description');
    expect(actionCard.querySelector(`[id="${describedBy[1]}"]`)).not.toBeNull();
  });
});
