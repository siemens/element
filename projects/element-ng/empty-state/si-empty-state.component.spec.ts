/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiEmptyStateComponent as TestComponent } from '.';

@Component({
  imports: [TestComponent],
  template: `
    <si-empty-state
      icon="element-icon"
      heading="No Devices"
      content="No devices were detected."
      style="display: block"
      [responsiveMode]="mode()"
      [style.block-size.px]="height()"
    >
      @if (actions()) {
        <button type="button">Retry</button>
      }
    </si-empty-state>
  `
})
class ResponsiveHostComponent {
  readonly height = signal(220);
  readonly actions = signal(true);
  readonly mode = signal(true);
}

describe('SiEmptyStateComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;
  let icon: WritableSignal<string | undefined>;
  let heading: WritableSignal<TranslatableString>;
  let content: WritableSignal<TranslatableString | undefined>;

  beforeEach(() => {
    icon = signal('element-icon');
    heading = signal<TranslatableString>('No Devices');
    content = signal<TranslatableString | undefined>('No devices were detected. Please retry!');

    fixture = TestBed.createComponent(TestComponent, {
      bindings: [
        inputBinding('icon', icon),
        inputBinding('heading', heading),
        inputBinding('content', content)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should display the correct data', async () => {
    await fixture.whenStable();

    expect(element.querySelector('span.si-h3')!).toHaveTextContent('No Devices');
    expect(element.querySelector('h3')).toBeNull();
    expect(element.querySelector('p')!).toHaveTextContent(
      'No devices were detected. Please retry!'
    );
    expect(element.querySelector('.element-icon')!.innerHTML).toBeDefined();
  });

  it('should not render icon or description when not provided', async () => {
    icon.set(undefined);
    content.set(undefined);
    await fixture.whenStable();

    expect(element.querySelector('si-icon')).toBeNull();
    expect(element.querySelector('p.text-pre-wrap')).toBeNull();
  });

  it('should disable responsive mode by default and accept boolean attributes', async () => {
    await fixture.whenStable();
    expect(element.querySelector('.list-group-item-empty')).not.toHaveClass('auto-responsive');
    const responsiveMode = signal<unknown>('');
    const booleanFixture = TestBed.createComponent(TestComponent, {
      bindings: [inputBinding('heading', heading), inputBinding('responsiveMode', responsiveMode)]
    });
    await booleanFixture.whenStable();
    const container = booleanFixture.nativeElement.querySelector('.list-group-item-empty');
    expect(container).toHaveClass('auto-responsive');

    responsiveMode.set(true);
    await booleanFixture.whenStable();
    expect(container).toHaveClass('auto-responsive');

    responsiveMode.set('false');
    await booleanFixture.whenStable();
    expect(container).not.toHaveClass('auto-responsive');

    responsiveMode.set(false);
    await booleanFixture.whenStable();
    expect(container).not.toHaveClass('auto-responsive');
  });

  describe('with automatic responsive behaviour', () => {
    let responsiveFixture: ComponentFixture<ResponsiveHostComponent>;
    let responsiveHost: ResponsiveHostComponent;
    let responsiveElement: HTMLElement;

    beforeEach(() => {
      responsiveFixture = TestBed.createComponent(ResponsiveHostComponent);
      responsiveHost = responsiveFixture.componentInstance;
      responsiveElement = responsiveFixture.nativeElement;
    });

    const variants = [
      { actions: true, height: 220, icon: true, description: true },
      { actions: true, height: 219, icon: false, description: true },
      { actions: true, height: 140, icon: false, description: true },
      { actions: true, height: 139, icon: false, description: false },
      { actions: true, height: 112, icon: false, description: false },
      { actions: false, height: 164, icon: true, description: true },
      { actions: false, height: 163, icon: false, description: true },
      { actions: false, height: 84, icon: false, description: true },
      { actions: false, height: 83, icon: false, description: false },
      { actions: false, height: 60, icon: false, description: false }
    ];

    it.each(variants)(
      'should show the richest variant at $height px with actions: $actions',
      async variant => {
        responsiveHost.height.set(variant.height);
        responsiveHost.actions.set(variant.actions);
        await responsiveFixture.whenStable();

        expect(
          getComputedStyle(responsiveElement.querySelector('.state-icon')!).display === 'none'
        ).toBe(!variant.icon);
        expect(
          getComputedStyle(responsiveElement.querySelector('.state-content')!).display === 'none'
        ).toBe(!variant.description);
      }
    );

    it('should use the available host height for the query container', async () => {
      responsiveHost.height.set(220);
      await responsiveFixture.whenStable();

      expect(
        responsiveElement.querySelector<HTMLElement>('.list-group-item-empty')!.offsetHeight
      ).toBe(220);
    });

    it.each([
      { actions: true, minimumHeight: 112 },
      { actions: false, minimumHeight: 60 }
    ])(
      'should enforce a $minimumHeight px minimum height with actions: $actions',
      async ({ actions, minimumHeight }) => {
        responsiveHost.actions.set(actions);
        responsiveHost.height.set(1);
        await responsiveFixture.whenStable();

        expect(
          responsiveElement.querySelector<HTMLElement>('.list-group-item-empty')!.offsetHeight
        ).toBe(minimumHeight);
      }
    );

    it('should remove the empty actions slot from the layout', async () => {
      responsiveHost.actions.set(false);
      await responsiveFixture.whenStable();

      expect(getComputedStyle(responsiveElement.querySelector('.state-actions')!).display).toBe(
        'none'
      );
    });

    it('should keep icon and description visible when switching to no responsive mode', async () => {
      responsiveHost.height.set(112);
      await responsiveFixture.whenStable();

      expect(responsiveElement.querySelector('.state-icon')).not.toBeVisible();
      expect(responsiveElement.querySelector('.state-content')).not.toBeVisible();

      responsiveHost.mode.set(false);
      await responsiveFixture.whenStable();

      expect(getComputedStyle(responsiveElement.querySelector('.state-icon')!).display).not.toBe(
        'none'
      );
      expect(responsiveElement.querySelector('.state-content')).toBeVisible();
    });
  });
});
