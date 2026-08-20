/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { Component, inject, input, signal, ViewEncapsulation } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SiThemeService } from '@siemens/element-ng/theme';

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
    encapsulation: ViewEncapsulation.ShadowDom,
    hostDirectives: [SiShadowRootDirective]
  })
  class WithOverlayComponent {
    readonly open = input(false);
    readonly showLateStyled = input(false);
    readonly themeService = inject(SiThemeService);
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
    `
  })
  class TestHostComponent {
    readonly open = signal(false);
    readonly showLateStyled = signal(false);
  }

  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
  });

  it('should apply the scoped theme to an overlay created later', () => {
    fixture.detectChanges();
    const component = fixture.debugElement.query(By.directive(WithOverlayComponent))
      .componentInstance as WithOverlayComponent;
    component.themeService.applyThemeType('dark');

    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    const overlayHost = document.querySelector('element-overlay-root')!;
    expect(overlayHost.classList).toContain('app--dark');
    component.themeService.applyThemeType('light');
    expect(overlayHost.classList).not.toContain('app--dark');
  });

  it('should apply theme-switch events to the shadow root', () => {
    fixture.detectChanges();
    const shadowHost = fixture.debugElement.query(By.directive(WithOverlayComponent))
      .nativeElement as HTMLElement;

    window.dispatchEvent(new CustomEvent('theme-switch', { detail: { dark: true } }));

    expect(shadowHost.classList).toContain('app--dark');
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
