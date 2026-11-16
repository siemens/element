/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuItemAction, SiMenuActionService } from '@siemens/element-ng/menu';
import { page } from 'vitest/browser';

import { SiChatMessageActionsComponent } from './si-chat-message-actions.component';

describe('SiChatMessageActionsComponent', () => {
  let fixture: ComponentFixture<SiChatMessageActionsComponent>;
  const actions = signal<MenuItemAction[]>([]);
  const secondaryActions = signal<MenuItemAction[]>([]);
  const actionParam = { id: 'message' };
  const menuActionService = { actionTriggered: vi.fn() };

  beforeEach(() => {
    actions.set([]);
    secondaryActions.set([]);
    menuActionService.actionTriggered.mockClear();
    TestBed.configureTestingModule({
      providers: [{ provide: SiMenuActionService, useValue: menuActionService }]
    });
    fixture = TestBed.createComponent(SiChatMessageActionsComponent, {
      bindings: [
        inputBinding('actions', actions),
        inputBinding('secondaryActions', secondaryActions),
        inputBinding('actionParam', () => actionParam)
      ]
    });
  });

  it.each(['primary', 'secondary'] as const)(
    'should call a %s action with the original item and message parameter',
    async position => {
      const handler = vi.fn();
      const action: MenuItemAction = { type: 'action', label: 'Run', action: handler };
      (position === 'primary' ? actions : secondaryActions).set([action]);
      await fixture.whenStable();

      if (position === 'secondary') {
        await page.getByRole('button', { name: 'Additional actions' }).click();
      }
      await page.getByRole(position === 'primary' ? 'button' : 'menuitem', { name: 'Run' }).click();

      expect(handler).toHaveBeenCalledExactlyOnceWith(actionParam, action);
    }
  );

  it.each(['primary', 'secondary'] as const)(
    'should dispatch a string-based %s action through the menu action service',
    async position => {
      const action: MenuItemAction = { type: 'action', label: 'Save', action: 'save' };
      (position === 'primary' ? actions : secondaryActions).set([action]);
      await fixture.whenStable();

      if (position === 'secondary') {
        await page.getByRole('button', { name: 'Additional actions' }).click();
      }
      await page
        .getByRole(position === 'primary' ? 'button' : 'menuitem', { name: 'Save' })
        .click();

      expect(menuActionService.actionTriggered).toHaveBeenCalledExactlyOnceWith(
        action,
        actionParam
      );
    }
  );

  it('should show a text label for an action without an icon and respect disabled state', async () => {
    actions.set([{ type: 'action', label: 'Save', disabled: true, action: () => {} }]);
    await fixture.whenStable();

    const button = page.getByRole('button', { name: 'Save' });
    await expect.element(button).toHaveTextContent('Save');
    await expect.element(button).toBeDisabled();
  });
});
