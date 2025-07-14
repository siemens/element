/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiSkipLinkTargetDirective } from './si-skip-link-target.directive';

@Component({
  imports: [SiSkipLinkTargetDirective],
  template: `
    <button siSkipLinkTarget="T1" type="button">Target 1</button>
    <button siSkipLinkTarget="T2" type="button">Target 2</button>
  `
})
class TestHostComponent {}

describe('SkipLinksComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    });
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should jump to target', () => {
    document
      .querySelector<HTMLButtonElement>('si-skip-links .skip-link-wrapper:nth-child(2) button')!
      .click();
    expect((document.activeElement as HTMLButtonElement).innerText).toEqual('Target 2');
  });
});
