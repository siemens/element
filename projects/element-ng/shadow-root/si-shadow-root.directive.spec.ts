/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiShadowRootDirective } from './si-shadow-root.directive';

describe('ShadowRootDirective', () => {
  @Component({
    selector: 'si-late-styled',
    template: `<span id="late-styled" class="late-style">Late styled</span>`,
    styles: `
      .late-style {
        color: #f00;
      }
    `
  })
  class LateStyledComponent {}

  @Component({
    selector: 'si-test',
    imports: [CdkConnectedOverlay, CdkOverlayOrigin, LateStyledComponent],
    template: ` <button #trigger="cdkOverlayOrigin" type="button" cdkOverlayOrigin>Open</button>
      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOpen]="open()"
        [cdkConnectedOverlayOrigin]="trigger"
      >
        <span id="in-shadow" class="test-style">Text</span>
        @if (showLateStyled()) {
          <si-late-styled />
        }
      </ng-template>`,
    styles: `
      .test-style {
        color: #fff;
      }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.ShadowDom,
    hostDirectives: [SiShadowRootDirective]
  })
  class WithOverlayComponent {
    readonly open = input(false);
    readonly showLateStyled = input(false);
  }

  @Component({
    imports: [WithOverlayComponent],
    template: `
      <span id="out-shadow" class="test-style">Text</span>
      <si-test [open]="open()" [showLateStyled]="showLateStyled()" />
    `,
    styles: `
      .test-style {
        color: #000 !important;
      }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  class TestHostComponent {
    readonly open = signal(false);
    readonly showLateStyled = signal(false);
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

  it('should copy styles registered after the overlay container was created', async () => {
    fixture.componentInstance.open.set(true);

    fixture.componentInstance.showLateStyled.set(true);
    await fixture.whenStable();

    const overlayShadowRoot = document.querySelector('element-overlay-root')!.shadowRoot!;
    expect(getComputedStyle(overlayShadowRoot.getElementById('late-styled')!).color).toBe(
      'rgb(255, 0, 0)'
    );
  });
});
