/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { OverlayContainer } from '@angular/cdk/overlay';
import { inputBinding, outputBinding, signal, twoWayBinding, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, provideRouter, Router } from '@angular/router';
import { MenuItem, MenuItemRadio, SiMenuActionService } from '@siemens/element-ng/menu';
import { userEvent } from 'vitest/browser';

import { SiChatInputComponent } from './si-chat-input.component';
import { ChatModelItem, SiChatModelSelectComponent } from './si-chat-model-select.component';

describe('SiChatModelSelectComponent', () => {
  const models: ChatModelItem[] = [
    { type: 'option', value: 'balanced', label: 'Balanced', description: 'Everyday tasks' },
    { type: 'option', value: 'fast', label: 'Fast', description: 'Quick answers' },
    { type: 'option', value: 'locked', label: 'Locked', disabled: true }
  ];

  const setup = async (
    settings: {
      compact?: boolean;
      availableWidth?: number;
      disabled?: boolean;
      footerActions?: MenuItem[];
      models?: ChatModelItem[];
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
        inputBinding('footerActions', () => settings.footerActions ?? [])
      ]
    });
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector<HTMLElement>('button')!;
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    return { fixture, value, host, trigger, overlay };
  };

  it('renders the active model and descriptions with a selected marker', async () => {
    const { fixture, trigger, overlay } = await setup();
    expect(trigger.querySelector('.model-name')).toHaveTextContent('Balanced');
    expect(trigger).toHaveAccessibleName('Model: Balanced');
    await userEvent.click(trigger);
    await fixture.whenStable();
    expect(overlay.querySelector('.item-description')).toHaveTextContent('Everyday tasks');
    expect(
      overlay.querySelector('[role="menuitemradio"][aria-checked="true"] .model-option > span')
    ).toHaveTextContent('Balanced');
    expect(overlay.querySelectorAll('[role="menuitemradio"][aria-checked="true"]')).toHaveLength(1);
  });

  it('updates the bound ID and restores focus after selection', async () => {
    const { fixture, trigger, overlay, value } = await setup();
    await userEvent.click(trigger);
    await fixture.whenStable();
    const option = Array.from(overlay.querySelectorAll<HTMLElement>('[role="menuitemradio"]')).find(
      item => item.textContent?.includes('Fast')
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
    expect(trigger).toBeDisabled();
    expect(overlay.querySelector('[role="menuitemradio"]')).toBeNull();
  });

  it('does not select a disabled model', async () => {
    const { fixture, trigger, overlay, value } = await setup();
    await userEvent.click(trigger);
    await fixture.whenStable();
    const locked = overlay.querySelector<HTMLElement>(
      '[role="menuitemradio"][aria-disabled="true"]'
    )!;
    locked.click();
    await fixture.whenStable();
    expect(value()).toBe('balanced');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps one selection across model groups and renders no search field', async () => {
    const { fixture, trigger, overlay, value } = await setup({
      models: [
        {
          type: 'group',
          label: 'General',
          options: [{ type: 'option', value: 'balanced', label: 'Balanced' }]
        },
        {
          type: 'group',
          label: 'Specialized',
          options: [{ type: 'option', value: 'coding', label: 'Coding' }]
        }
      ]
    });
    await userEvent.click(trigger);
    await fixture.whenStable();
    expect(overlay.textContent).toContain('General');
    expect(overlay.textContent).toContain('Specialized');
    expect(overlay.querySelector('input')).toBeNull();
    await userEvent.click(overlay.querySelectorAll<HTMLElement>('[role="menuitemradio"]')[1]);
    await fixture.whenStable();
    expect(value()).toBe('coding');
    await userEvent.click(trigger);
    await fixture.whenStable();
    expect(overlay.querySelectorAll('[role="menuitemradio"][aria-checked="true"]')).toHaveLength(1);
    expect(overlay.querySelector('[aria-checked="true"]')).toHaveTextContent('Coding');
  });

  it('updates the trigger when the product changes the selected ID', async () => {
    const { fixture, trigger, value } = await setup();
    value.set('fast');
    await fixture.whenStable();
    expect(trigger).toHaveAccessibleName('Model: Fast');
    expect(trigger.querySelector('.model-name')).toHaveTextContent('Fast');
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
    const secondRadio = Array.from(
      overlay.querySelectorAll<HTMLElement>('[role="menuitemradio"]')
    ).find(item => item.querySelector('.item-title')?.textContent?.trim() === 'Second')!;
    await userEvent.click(secondRadio);
    await fixture.whenStable();
    expect(action).toHaveBeenCalledExactlyOnceWith(undefined, second);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await fixture.whenStable();
    const radios = overlay.querySelectorAll('[role="group"]:last-of-type [role="menuitemradio"]');
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
        await userEvent.hover(submenuTrigger);
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
    const send = vi.fn();
    const fixture = TestBed.createComponent(SiChatInputComponent, {
      bindings: [
        inputBinding('models', () => models),
        twoWayBinding('selectedModel', selected),
        twoWayBinding('value', draft),
        outputBinding('send', send)
      ]
    });
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector<HTMLElement>('.model-trigger')!;
    await userEvent.click(trigger);
    await fixture.whenStable();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const option = Array.from(overlay.querySelectorAll<HTMLElement>('[role="menuitemradio"]')).find(
      item => item.textContent?.includes('Fast')
    )!;
    await userEvent.click(option);
    await fixture.whenStable();
    expect(selected()).toBe('fast');
    expect(draft()).toBe('A draft');
    expect(send).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
  });
});
