/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { SiHeaderDropdownItemComponent } from './si-header-dropdown-item.component';
import { SiHeaderDropdownTriggerDirective } from './si-header-dropdown-trigger.directive';
import { SiHeaderDropdownComponent } from './si-header-dropdown.component';
import { HeaderWithDropdowns, SI_HEADER_WITH_DROPDOWNS } from './si-header.model';
import { SiHeaderDropdownTriggerHarness } from './testing/si-header-dropdown-trigger.harness';

@Component({
  imports: [
    SiHeaderDropdownComponent,
    SiHeaderDropdownItemComponent,
    SiHeaderDropdownTriggerDirective
  ],
  template: `
    <button id="outside-button" type="button">Outside</button>

    <button #trigger1 type="button" [siHeaderDropdownTriggerFor]="dropdown1">Trigger-1</button>

    <ng-template #dropdown1>
      <si-header-dropdown>
        <si-header-dropdown-item>Item 1-1</si-header-dropdown-item>
        <si-header-dropdown-item #trigger2 [siHeaderDropdownTriggerFor]="dropdown2">
          Item 1-2
        </si-header-dropdown-item>
      </si-header-dropdown>
    </ng-template>

    <ng-template #dropdown2>
      <si-header-dropdown>
        <si-header-dropdown-item>Item 2-1</si-header-dropdown-item>
      </si-header-dropdown>
    </ng-template>
  `,
  providers: [{ provide: SI_HEADER_WITH_DROPDOWNS, useExisting: TestHostComponent }]
})
class TestHostComponent implements HeaderWithDropdowns {
  inlineDropdown = new BehaviorSubject(false);
  readonly trigger1 = viewChild.required('trigger1', { read: SiHeaderDropdownTriggerDirective });
  readonly trigger2 = viewChild.required('trigger2', { read: SiHeaderDropdownTriggerDirective });
}

describe('SiHeaderDropdown', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let loader: HarnessLoader;
  let trigger1Harness: SiHeaderDropdownTriggerHarness;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    });
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    trigger1Harness = await loader.getHarness(SiHeaderDropdownTriggerHarness.withText('Trigger-1'));
  });

  describe('in desktop mode', () => {
    it('should open overlay', async () => {
      await trigger1Harness.toggle();

      expect(await trigger1Harness.isOpen()).toBeTrue();
      expect(await trigger1Harness.isDesktop()).toBeTrue();
    });

    it('should close all on outside click', async () => {
      await trigger1Harness.toggle();
      const trigger2Harness = await trigger1Harness
        .getDropdown()
        .then(dropdown => dropdown.getTrigger('Item 1-2'));
      await trigger2Harness.toggle();

      expect(await trigger2Harness.isOpen()).toBeTrue();
      document.getElementById('outside-button')!.click();
      expect(await trigger1Harness.isOpen()).toBeFalse();
    });

    it('should close only current on toggle click', async () => {
      await trigger1Harness.toggle();
      const dropdown1 = await trigger1Harness.getDropdown();
      const trigger2Harness = await dropdown1.getTrigger('Item 1-2');
      await trigger2Harness.toggle();

      expect(await trigger2Harness.isOpen()).toBeTrue();

      await trigger2Harness.toggle();
      expect(await trigger2Harness.isOpen()).toBeFalse();
      expect(await dropdown1.isOpen()).toBeTrue();
    });

    it('should close on resize', async () => {
      await trigger1Harness.toggle();
      expect(await trigger1Harness.isOpen()).toBeTrue();
      fixture.componentInstance.inlineDropdown.next(false);
      expect(await trigger1Harness.isOpen()).toBeFalse();
    });

    it('should close on item click', async () => {
      await trigger1Harness.toggle();
      await trigger1Harness
        .getDropdown()
        .then(dropdown => dropdown.getItem('Item 1-1'))
        .then(item => item.click());

      expect(await trigger1Harness.isOpen()).toBeFalse();
    });

    it('should emit only once on close', async () => {
      await trigger1Harness.toggle();
      const openChangeSpy = spyOn(fixture.componentInstance.trigger1().openChange, 'emit');
      const dropdown1 = await trigger1Harness.getDropdown();
      const trigger2Harness = await dropdown1.getTrigger('Item 1-2');
      await trigger2Harness.toggle();
      const openChangeTrigger2Spy = spyOn(fixture.componentInstance.trigger2().openChange, 'emit');

      await trigger2Harness
        .getDropdown()
        .then(dropdown => dropdown.getItem('Item 2-1'))
        .then(item => item.click());
      expect(openChangeSpy).toHaveBeenCalledTimes(1);
      expect(openChangeTrigger2Spy).toHaveBeenCalledTimes(0);
    });
  });

  describe('in mobile mode', () => {
    beforeEach(() => fixture.componentInstance.inlineDropdown.next(true));

    it('should open inline in mobile view', async () => {
      await trigger1Harness.toggle();

      expect(await trigger1Harness.isOpen()).toBeTrue();
      expect(await trigger1Harness.isDesktop()).toBeFalse();
    });

    it('should close only current on toggle click', async () => {
      await trigger1Harness.toggle();
      const dropdown1 = await trigger1Harness.getDropdown();
      const trigger2Harness = await dropdown1.getTrigger('Item 1-2');
      await trigger2Harness.toggle();

      expect(await trigger2Harness.isOpen()).toBeTrue();

      await trigger2Harness.toggle();
      expect(await trigger2Harness.isOpen()).toBeFalse();
      expect(await dropdown1.isOpen()).toBeTrue();
    });

    it('should close on resize', async () => {
      await trigger1Harness.toggle();
      expect(await trigger1Harness.isOpen()).toBeTrue();
      fixture.componentInstance.inlineDropdown.next(true);
      expect(await trigger1Harness.isOpen()).toBeFalse();
    });

    it('should close on item click', async () => {
      await trigger1Harness.toggle();
      await trigger1Harness
        .getDropdown()
        .then(dropdown => dropdown.getItem('Item 1-1'))
        .then(item => item.click());

      expect(await trigger1Harness.isOpen()).toBeFalse();
    });
  });
});
