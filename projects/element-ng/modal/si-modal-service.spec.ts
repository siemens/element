/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ApplicationRef,
  Component,
  DestroyRef,
  inject,
  input,
  inputBinding,
  output,
  outputBinding,
  TemplateRef,
  viewChild
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { page, userEvent } from 'vitest/browser';

import { SiModalService } from './si-modal.service';

@Component({
  template: `
    <div>test component-{{ inputProp() }}</div>
    <button type="button" (click)="confirmed.emit(inputProp())">Confirm</button>
  `
})
class DialogComponent {
  readonly inputProp = input<string>();
  readonly confirmed = output<string | undefined>();
  readonly destroyRef = inject(DestroyRef);
}

@Component({
  selector: 'si-template-content',
  template: '<span>template child</span>'
})
class TemplateContentComponent {
  static readonly destroyed = vi.fn();

  constructor() {
    inject(DestroyRef).onDestroy(() => TemplateContentComponent.destroyed());
  }
}

@Component({
  imports: [TemplateContentComponent],
  template: `
    <ng-template #ref>
      <div>test template <si-template-content /></div>
    </ng-template>
  `
})
class DialogTemplateComponent {
  readonly templateRef = viewChild.required<TemplateRef<unknown>>('ref');
}

describe('SiModalService', () => {
  let service!: SiModalService;
  let appRef!: ApplicationRef;

  beforeEach(async () => {
    service = TestBed.inject(SiModalService);
    appRef = TestBed.inject(ApplicationRef);
  });

  describe('with template', () => {
    let templateRef: TemplateRef<unknown>;

    beforeEach(async () => {
      TemplateContentComponent.destroyed.mockClear();
      const comp = TestBed.createComponent(DialogTemplateComponent);
      await comp.whenStable();
      templateRef = comp.componentInstance.templateRef();
    });

    it('shows and hides the dialog', async () => {
      const modalRef = service.show(templateRef, {});
      const bodyStyle = getComputedStyle(document.body);

      await appRef.whenStable();

      const modal = document.querySelector('si-modal');
      expect(modal).toBeTruthy();
      expect(modal).toHaveTextContent('test template template child');
      expect(bodyStyle.overflow).toBe('hidden');

      modalRef.hide();
      await appRef.whenStable();

      expect(document.querySelector('si-modal')).not.toBeInTheDocument();
      expect(TemplateContentComponent.destroyed).toHaveBeenCalledOnce();
      expect(bodyStyle.overflow).not.toBe('hidden');
    });
  });

  describe('with component', () => {
    it('shows and hides the dialog', async () => {
      const modalRef = service.show(DialogComponent, {});

      await firstValueFrom(modalRef.shown);

      const modal = document.querySelector('si-modal');
      expect(modal).toBeTruthy();
      expect(modal).toMatchTextContent('test component');

      modalRef.hide();
      await appRef.whenStable();

      expect(document.querySelector('si-modal')).not.toBeInTheDocument();
    });

    it('exposes initialized content and accepts immediate input updates', async () => {
      const modalRef = service.show(DialogComponent, { inputValues: { inputProp: 'input value' } });

      expect(modalRef.content.inputProp()).toBe('input value');
      modalRef.setInput('inputProp', 'new input value');

      await appRef.whenStable();
      const modal = document.querySelector('si-modal');
      expect(modal).toBeTruthy();
      expect(modal).toMatchTextContent('new input value');
      modalRef.hide();
      await appRef.whenStable();
    });

    it('emits the close value and destroys the content only once', () => {
      const modalRef = service.show(DialogComponent, {});
      const hidden = vi.fn();
      const complete = vi.fn();
      const destroyed = vi.fn();
      modalRef.hidden.subscribe({ next: hidden, complete });
      modalRef.content.destroyRef.onDestroy(destroyed);

      modalRef.hide('closed');
      modalRef.hide('again');
      modalRef.detach();

      expect(hidden).toHaveBeenCalledExactlyOnceWith('closed');
      expect(complete).toHaveBeenCalledOnce();
      expect(destroyed).toHaveBeenCalledOnce();
      expect(document.querySelector('si-modal')).not.toBeInTheDocument();
    });

    it('passes input and output bindings to the modal component', async () => {
      const confirmed = vi.fn();
      const modalRef = service.show(DialogComponent, {
        bindings: [
          inputBinding('inputProp', () => 'Bound value'),
          outputBinding('confirmed', confirmed)
        ]
      });
      await appRef.whenStable();

      expect(document.querySelector('si-modal')).toMatchTextContent('Bound value');
      document.querySelector<HTMLButtonElement>('si-modal button')!.click();
      await appRef.whenStable();

      expect(confirmed).toHaveBeenCalledExactlyOnceWith('Bound value');
      modalRef.detach();
    });
  });

  describe('outside clicks', () => {
    beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] }));
    afterEach(() => vi.useRealTimers());

    const clickOutsideContent = async (): Promise<void> => {
      await userEvent.click(page.getByRole('dialog'), { position: { x: 2, y: 2 } });
    };

    const expireGhostClickGuard = async (): Promise<void> => {
      await vi.advanceTimersByTimeAsync(300);
    };

    it('keeps the opening ghost-click guard and then closes on outside clicks', async () => {
      service.show(DialogComponent, { ignoreBackdropClick: false });
      const modal = document.querySelector<HTMLElement>('si-modal')!;

      await clickOutsideContent();
      expect(modal).toBeInTheDocument();

      await expireGhostClickGuard();
      await clickOutsideContent();

      expect(modal).not.toBeInTheDocument();
    });

    it('does not close when a drag starts inside the dialog', async () => {
      const modalRef = service.show(DialogComponent, { ignoreBackdropClick: false });
      const modal = document.querySelector<HTMLElement>('si-modal')!;

      await expireGhostClickGuard();
      await userEvent.dragAndDrop(page.getByText('test component-'), page.getByRole('dialog'), {
        targetPosition: { x: 2, y: 2 }
      });

      expect(modal).toBeInTheDocument();
      modalRef.hide();
    });
  });

  it('closes nested modals in Escape order and restores body scrolling after the last closes', async () => {
    const parentRef = service.show(DialogComponent, {
      inputValues: { inputProp: 'parent' },
      keyboard: true
    });
    const childRef = service.show(DialogComponent, {
      inputValues: { inputProp: 'child' },
      keyboard: true
    });
    const parentHidden = vi.fn();
    const childHidden = vi.fn();
    const parentDestroyed = vi.fn();
    const childDestroyed = vi.fn();
    parentRef.hidden.subscribe(parentHidden);
    childRef.hidden.subscribe(childHidden);
    parentRef.content.destroyRef.onDestroy(parentDestroyed);
    childRef.content.destroyRef.onDestroy(childDestroyed);

    expect(document.body.style.overflow).toBe('hidden');
    await userEvent.keyboard('{Escape}');
    await appRef.whenStable();

    expect(childHidden).toHaveBeenCalledOnce();
    expect(childDestroyed).toHaveBeenCalledOnce();
    expect(parentHidden).not.toHaveBeenCalled();
    expect(parentDestroyed).not.toHaveBeenCalled();
    expect(document.body.style.overflow).toBe('hidden');

    await userEvent.keyboard('{Escape}');
    await appRef.whenStable();

    expect(parentHidden).toHaveBeenCalledOnce();
    expect(parentDestroyed).toHaveBeenCalledOnce();
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});
