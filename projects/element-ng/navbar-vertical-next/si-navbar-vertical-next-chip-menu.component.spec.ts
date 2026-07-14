/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';

import { SiNavbarVerticalNextChipMenuComponent } from './si-navbar-vertical-next-chip-menu.component';
import { SI_NAVBAR_VERTICAL_NEXT } from './si-navbar-vertical-next.provider';

interface MockActiveItem {
  icon: WritableSignal<string | undefined>;
  label: WritableSignal<string | undefined>;
}

describe('SiNavbarVerticalNextChipMenuComponent', () => {
  const mockActiveItem: MockActiveItem = {
    icon: signal<string | undefined>('element-home'),
    label: signal<string | undefined>('Home')
  };

  const mockNavbar = {
    collapsed: signal(true),
    activeItem: signal<MockActiveItem | undefined>(mockActiveItem),
    itemsComponent: signal<unknown>(undefined)
  };

  let fixture: ComponentFixture<SiNavbarVerticalNextChipMenuComponent>;
  let component: SiNavbarVerticalNextChipMenuComponent;

  beforeEach(async () => {
    mockNavbar.collapsed.set(true);
    mockNavbar.activeItem.set(mockActiveItem);
    mockActiveItem.icon.set('element-home');
    mockActiveItem.label.set('Home');
    mockNavbar.itemsComponent.set(undefined);

    await TestBed.configureTestingModule({
      providers: [{ provide: SI_NAVBAR_VERTICAL_NEXT, useValue: mockNavbar }]
    }).compileComponents();

    fixture = TestBed.createComponent(SiNavbarVerticalNextChipMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  describe('chip button', () => {
    it('should render the active item icon and label', () => {
      const chip = fixture.nativeElement.querySelector('.chip') as HTMLElement;
      expect(chip).toBeInTheDocument();
      expect(chip).toHaveTextContent('Home');
      expect(chip.querySelector('si-icon')).toBeInTheDocument();
    });

    it('should omit the label span when the active item has none', async () => {
      mockActiveItem.label.set(undefined);
      await fixture.whenStable();

      const chip = fixture.nativeElement.querySelector('.chip') as HTMLElement;
      expect(chip.querySelector('.chip-label')).not.toBeInTheDocument();
    });

    it('should be interactive when the navbar is collapsed', () => {
      const chip = fixture.nativeElement.querySelector('.chip') as HTMLElement;
      expect(chip).toHaveClass('chip-visible');
      expect(chip).not.toHaveAttribute('inert');
      expect(chip).not.toHaveAttribute('aria-hidden');
    });

    it('should be inert when the navbar is expanded', async () => {
      mockNavbar.collapsed.set(false);
      await fixture.whenStable();

      const chip = fixture.nativeElement.querySelector('.chip') as HTMLElement;
      expect(chip).not.toHaveClass('chip-visible');
      expect(chip).toHaveAttribute('inert', '');
      expect(chip).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('overlay lifecycle', () => {
    it('should be closed initially', () => {
      expect(component.open()).toBe(false);
      expect(document.querySelector('.chip-menu-panel')).not.toBeInTheDocument();
    });

    it('should open on chip button click', async () => {
      const chip = fixture.nativeElement.querySelector('.chip') as HTMLButtonElement;
      await userEvent.click(chip);
      await fixture.whenStable();

      expect(component.open()).toBe(true);
      const panel = document.querySelector('.chip-menu-panel');
      expect(panel).toBeInTheDocument();
      expect(chip).toHaveAttribute('aria-expanded', 'true');
      expect(chip.getAttribute('aria-controls')).toBe(panel!.id);
    });

    it('should toggle closed on second chip button click', async () => {
      const chip = fixture.nativeElement.querySelector('.chip') as HTMLButtonElement;
      await userEvent.click(chip);
      await fixture.whenStable();

      await userEvent.click(chip);
      await fixture.whenStable();

      expect(component.open()).toBe(false);
      expect(document.querySelector('.chip-menu-panel')).not.toBeInTheDocument();
      expect(chip).toHaveAttribute('aria-expanded', 'false');
    });

    it('should close via close()', async () => {
      const chip = fixture.nativeElement.querySelector('.chip') as HTMLButtonElement;
      await userEvent.click(chip);
      await fixture.whenStable();

      component.close();
      await fixture.whenStable();

      expect(component.open()).toBe(false);
      expect(document.querySelector('.chip-menu-panel')).not.toBeInTheDocument();
    });

    it('should close on Escape', async () => {
      const chip = fixture.nativeElement.querySelector('.chip') as HTMLButtonElement;
      await userEvent.click(chip);
      await fixture.whenStable();

      const panel = document.querySelector('.chip-menu-panel') as HTMLElement;
      panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await fixture.whenStable();

      expect(component.open()).toBe(false);
    });

    it('should close on outside click', async () => {
      const outside = document.createElement('button');
      outside.id = 'chip-menu-spec-outside';
      outside.textContent = 'outside';
      document.body.appendChild(outside);

      try {
        const chip = fixture.nativeElement.querySelector('.chip') as HTMLButtonElement;
        await userEvent.click(chip);
        await fixture.whenStable();
        expect(component.open()).toBe(true);

        outside.click();
        await fixture.whenStable();

        expect(component.open()).toBe(false);
        expect(document.querySelector('.chip-menu-panel')).not.toBeInTheDocument();
      } finally {
        outside.remove();
      }
    });
  });
});
