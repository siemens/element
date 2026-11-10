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
  TemplateRef,
  viewChild
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { SiModalService } from './si-modal.service';

@Component({
  template: '<div>test component-{{inputProp()}}</div>'
})
class DialogComponent {
  readonly inputProp = input<string>();
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
  });
});
