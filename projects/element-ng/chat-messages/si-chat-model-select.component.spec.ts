/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { OverlayContainer } from '@angular/cdk/overlay';
import { inputBinding, signal, twoWayBinding, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, provideRouter, Router } from '@angular/router';
import { MenuItem, MenuItemRadio, SiMenuActionService } from '@siemens/element-ng/menu';
import { SelectItem } from '@siemens/element-ng/select';
import { userEvent } from 'vitest/browser';

import { SiChatInputComponent } from './si-chat-input.component';
import { SiChatModelSelectComponent } from './si-chat-model-select.component';

describe('SiChatModelSelectComponent', () => {
  const models: SelectItem<string>[] = [
    { type: 'option', value: 'balanced', label: 'Balanced', description: 'Everyday tasks' },
    { type: 'option', value: 'fast', label: 'Fast', description: 'Quick answers' },
    { type: 'option', value: 'locked', label: 'Locked', disabled: true }
  ];

  const setup = async (
    settings: {
      compact?: boolean;
      availableWidth?: number;
      disabled?: boolean;
      hasFilter?: boolean;
      footerActions?: MenuItem[];
      models?: SelectItem<string>[];
    } = {}
  ): Promise<{
    fixture: ComponentFixture<SiChatModelSelectComponent>;
    value: WritableSignal<string | undefined>;
    host: HTMLElement;
    trigger: HTMLElement;
    overlay: HTMLElement;
  }> => {
    const value = signal<string | undefined>('balanced');
    const fixture = TestBed.createComponent(SiChatModelSelectComponent, {
      bindings: [
        inputBinding('options', () => settings.models ?? models),
        twoWayBinding('value', value),
        inputBinding('compact', () => settings.compact ?? false),
        inputBinding('availableWidth', () => settings.availableWidth ?? Infinity),
        inputBinding('disabled', () => settings.disabled ?? false),
        inputBinding('hasFilter', () => settings.hasFilter ?? false),
        inputBinding('footerActions', () => settings.footerActions ?? [])
      ]
    });
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector<HTMLElement>('[role="combobox"]')!;
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    return { fixture, value, host, trigger, overlay };
  };

  it('renders the active model and descriptions with a selected marker', async () => {
    const { fixture, trigger, overlay } = await setup();
    expect(trigger.querySelector('.model-name')).toHaveTextContent('Balanced');
    expect(trigger).toHaveAccessibleName('Model: Balanced');
    await userEvent.click(trigger);
    await fixture.whenStable();
    expect(overlay.querySelector('.model-option .text-secondary')).toHaveTextContent(
      'Everyday tasks'
    );
    expect(
      overlay.querySelector('[role="option"][aria-selected="true"] .model-option span')
    ).toHaveTextContent('Balanced');
    expect(overlay.querySelectorAll('.selected-marker')).toHaveLength(1);
  });

  it('updates the bound ID and restores focus after selection', async () => {
    const { fixture, trigger, overlay, value } = await setup();
    await userEvent.click(trigger);
    await fixture.whenStable();
    const option = Array.from(overlay.querySelectorAll<HTMLElement>('[role="option"]')).find(item =>
      item.textContent?.includes('Fast')
    )!;
    await userEvent.click(option);
    await fixture.whenStable();
    expect(value()).toBe('fast');
    expect(trigger.querySelector('.model-name')).toHaveTextContent('Fast');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('does not open when disabled', async () => {
    const { fixture, trigger, overlay } = await setup({ disabled: true });
    trigger.click();
    await fixture.whenStable();
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    expect(overlay.querySelector('[role="option"]')).toBeNull();
  });

  it('provides an accessible active model name in compact mode', async () => {
    const { trigger } = await setup({ compact: true });
    expect(trigger).toHaveClass('btn-icon');
    expect(trigger).toHaveAccessibleName('Model: Balanced');
  });

  it('collapses when the available toolbar space cannot fit the label', async () => {
    const { trigger } = await setup({ availableWidth: 0 });
    await expect.poll(() => trigger.className).toContain('btn-icon');
  });

  it('filters the supplied options', async () => {
    const { fixture, trigger, overlay } = await setup({ hasFilter: true });
    await userEvent.click(trigger);
    await fixture.whenStable();
    await userEvent.fill(overlay.querySelector<HTMLInputElement>('input')!, 'Fast');
    await fixture.whenStable();
    expect(overlay.querySelector('.model-option span')).toHaveTextContent('Fast');
    expect(overlay.textContent).not.toContain('Everyday tasks');
  });

  it('invokes footer actions and closes the dropdown', async () => {
    const action = vi.fn();
    const { fixture, trigger, overlay } = await setup({
      footerActions: [{ type: 'action', label: 'Manage models', action }]
    });
    await userEvent.click(trigger);
    await fixture.whenStable();
    await userEvent.click(overlay.querySelector<HTMLElement>('[role="menuitem"]')!);
    await fixture.whenStable();
    expect(action).toHaveBeenCalledOnce();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('dispatches string actions once with the original item', async () => {
    const actionTriggered = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: SiMenuActionService, useValue: { actionTriggered } }]
    });
    const item: MenuItem = { type: 'action', label: 'Manage', action: 'manage' };
    const { fixture, trigger, overlay } = await setup({ footerActions: [item] });
    await userEvent.click(trigger);
    await fixture.whenStable();
    await userEvent.click(overlay.querySelector<HTMLElement>('[role="menuitem"]')!);
    await fixture.whenStable();
    expect(actionTriggered).toHaveBeenCalledExactlyOnceWith(item, undefined);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('does not activate or close for a disabled footer item', async () => {
    const action = vi.fn<() => void>();
    const { fixture, trigger, overlay } = await setup({
      footerActions: [{ type: 'action', label: 'Manage', action, disabled: true }]
    });
    await userEvent.click(trigger);
    await fixture.whenStable();
    overlay.querySelector<HTMLElement>('[role="menuitem"]')!.click();
    await fixture.whenStable();
    expect(action).not.toHaveBeenCalled();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes after a link without cancelling its default activation', async () => {
    const { fixture, trigger, overlay } = await setup({
      footerActions: [{ type: 'link', label: 'Manage', href: '#models' }]
    });
    await userEvent.click(trigger);
    await fixture.whenStable();
    const link = overlay.querySelector<HTMLAnchorElement>('a[role="menuitem"]')!;
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    const defaultAllowed = link.dispatchEvent(click);
    await fixture.whenStable();
    expect(defaultAllowed).toBe(true);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('navigates once and closes after router-link activation', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'models', children: [] }])]
    });
    const { fixture, trigger, overlay } = await setup({
      footerActions: [{ type: 'router-link', label: 'Manage', routerLink: '/models' }]
    });
    const router = TestBed.inject(Router);
    const navigated = vi.fn();
    const subscription = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        navigated();
      }
    });
    await userEvent.click(trigger);
    await fixture.whenStable();
    await userEvent.click(overlay.querySelector<HTMLElement>('a[role="menuitem"]')!);
    await fixture.whenStable();
    expect(router.url).toBe('/models');
    expect(navigated).toHaveBeenCalledOnce();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    subscription.unsubscribe();
  });

  it('preserves checkbox source identity and checked state when reopened', async () => {
    const action = vi.fn((_param: unknown, source: MenuItem) => {
      if (source.type === 'checkbox') {
        source.checked = !source.checked;
      }
    });
    const item: MenuItem = { type: 'checkbox', label: 'Use tools', checked: false, action };
    const { fixture, trigger, overlay } = await setup({ footerActions: [item] });
    await userEvent.click(trigger);
    await fixture.whenStable();
    await userEvent.click(overlay.querySelector<HTMLElement>('[role="menuitemcheckbox"]')!);
    await fixture.whenStable();
    expect(action).toHaveBeenCalledExactlyOnceWith(undefined, item);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await fixture.whenStable();
    expect(overlay.querySelector('[role="menuitemcheckbox"]')).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });

  it('closes after grouped radio activation and preserves changed selection', async () => {
    const first: MenuItemRadio = {
      type: 'radio',
      label: 'First',
      checked: true,
      action: vi.fn<() => void>()
    };
    const action = vi.fn((_param: unknown, source: MenuItem) => {
      if (source.type === 'radio' && first.type === 'radio') {
        first.checked = false;
        source.checked = true;
      }
    });
    const second: MenuItem = { type: 'radio', label: 'Second', checked: false, action };
    const { fixture, trigger, overlay } = await setup({
      footerActions: [
        { type: 'radio-group', children: [{ type: 'header', label: 'Mode' }, first, second] }
      ]
    });
    await userEvent.click(trigger);
    await fixture.whenStable();
    await userEvent.click(overlay.querySelectorAll<HTMLElement>('[role="menuitemradio"]')[1]);
    await fixture.whenStable();
    expect(action).toHaveBeenCalledExactlyOnceWith(undefined, second);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await fixture.whenStable();
    const radios = overlay.querySelectorAll('[role="menuitemradio"]');
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
  });

  it('opens by keyboard and closes with Escape', async () => {
    const { fixture, trigger } = await setup();
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await fixture.whenStable();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    await fixture.whenStable();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it.each(['pointer', 'keyboard'])(
    'opens footer submenus using %s and invokes their actions',
    async mode => {
      const action = vi.fn();
      const { fixture, trigger, overlay } = await setup({
        footerActions: [
          {
            type: 'group',
            label: 'Other models',
            children: [{ type: 'action', label: 'Coding', action }]
          }
        ]
      });
      await userEvent.click(trigger);
      await fixture.whenStable();
      const submenuTrigger = overlay.querySelector<HTMLElement>('[role="menuitem"]')!;
      if (mode === 'keyboard') {
        submenuTrigger.focus();
        await userEvent.keyboard('{ArrowRight}');
      } else {
        await userEvent.click(submenuTrigger);
      }
      await fixture.whenStable();
      const item = Array.from(overlay.querySelectorAll<HTMLElement>('[role="menuitem"]')).find(
        element => element.textContent?.includes('Coding')
      )!;
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      if (mode === 'keyboard') {
        await userEvent.keyboard('{Enter}');
      } else {
        await userEvent.click(item);
      }
      await fixture.whenStable();
      expect(action).toHaveBeenCalledOnce();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveFocus();
    }
  );

  it('keeps the chat draft independent of selection', async () => {
    const selected = signal<string | undefined>('balanced');
    const draft = signal('A draft');
    const fixture = TestBed.createComponent(SiChatInputComponent, {
      bindings: [
        inputBinding('models', () => models),
        twoWayBinding('selectedModel', selected),
        twoWayBinding('value', draft)
      ]
    });
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector<HTMLElement>('[role="combobox"]')!;
    await userEvent.click(trigger);
    await fixture.whenStable();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const option = Array.from(overlay.querySelectorAll<HTMLElement>('[role="option"]')).find(item =>
      item.textContent?.includes('Fast')
    )!;
    await userEvent.click(option);
    await fixture.whenStable();
    expect(selected()).toBe('fast');
    expect(draft()).toBe('A draft');
    expect(trigger).toHaveFocus();
  });
});
