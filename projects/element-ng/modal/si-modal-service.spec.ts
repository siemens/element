/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ApplicationRef,
  Component,
  input,
  inputBinding,
  output,
  outputBinding,
  TemplateRef,
  viewChild
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

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
}

@Component({
  template: `
    <ng-template #ref>
      <div>test template</div>
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

    beforeEach(() => {
      const comp = TestBed.createComponent(DialogTemplateComponent);
      comp.detectChanges();
      templateRef = comp.componentInstance.templateRef();
    });

    it('shows and hides the dialog', () => {
      const modalRef = service.show(templateRef, {});
      const bodyStyle = getComputedStyle(document.body);

      appRef.tick();

      const modal = document.querySelector('si-modal');
      expect(modal).toBeTruthy();
      expect(modal).toHaveTextContent('test template');
      expect(bodyStyle.overflow).toBe('hidden');

      modalRef.hide();
      appRef.tick();

      expect(document.querySelector('si-modal')).not.toBeInTheDocument();
      expect(bodyStyle.overflow).not.toBe('hidden');
    });
  });

  describe('with component', () => {
    it('shows and hides the dialog', () => {
      const modalRef = service.show(DialogComponent, {});

      appRef.tick();

      const modal = document.querySelector('si-modal');
      expect(modal).toBeTruthy();
      expect(modal).toMatchTextContent('test component');

      modalRef.hide();
      appRef.tick();

      expect(document.querySelector('si-modal')).not.toBeInTheDocument();
    });

    it('preserves inputValues and imperative setInput updates', () => {
      const modalRef = service.show(DialogComponent, { inputValues: { inputProp: 'input value' } });

      appRef.tick();

      const modal = document.querySelector('si-modal');
      expect(modal).toBeTruthy();
      expect(modal).toMatchTextContent('input value');
      modalRef.setInput('inputProp', 'new input value');
      appRef.tick();
      expect(modal).toMatchTextContent('new input value');
      modalRef.hide();
      appRef.tick();
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
});
