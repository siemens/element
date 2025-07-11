/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { Component, input, signal, ViewEncapsulation } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiShadowRootDirective } from './si-shadow-root.directive';

describe('ShadowRootDirective', () => {
  @Component({
    selector: 'si-test',
    imports: [CdkConnectedOverlay, CdkOverlayOrigin],
    template: ` <button #trigger="cdkOverlayOrigin" type="button" cdkOverlayOrigin>Open</button>
      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOpen]="open()"
        [cdkConnectedOverlayOrigin]="trigger"
      >
        <span id="in-shadow" class="test-style">Text</span>
      </ng-template>`,
    styles: `
      .test-style {
        color: #fff;
      }
    `,
    encapsulation: ViewEncapsulation.ShadowDom,
    hostDirectives: [SiShadowRootDirective]
  })
  class WithOverlayComponent {
    readonly open = input(false);
  }

  @Component({
    imports: [WithOverlayComponent],
    template: `
      <span id="out-shadow" class="test-style">Text</span>
      <si-test [open]="open()" />
    `,
    styles: `
      .test-style {
        color: #000 !important;
      }
    `
  })
  class TestHostComponent {
    readonly open = signal(false);
  }

  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
  });

  it('should have styles in the overlay available', () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    // This checks that the styles are not interfering with each other as !important would override
    // if there were no shadow root.
    expect(getComputedStyle(document.getElementById('out-shadow')!).color).toBe('rgb(0, 0, 0)');
    expect(
      getComputedStyle(
        document.querySelector('element-overlay-root')!.shadowRoot!.getElementById('in-shadow')!
      ).color
    ).toBe('rgb(255, 255, 255)');
  });
});
