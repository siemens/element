/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ApplicationRef, Component, input, TemplateRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SiModalService } from './si-modal.service';

@Component({
  template: '<div>test component-{{inputProp()}}</div>'
})
class DialogComponent {
  readonly inputProp = input<string>();
}

@Component({
  template: `
    <ng-template #ref>
      <div>test template</div>
    </ng-template>
  `
})
class DialogTemplateComponent {
  readonly templateRef = viewChild.required<TemplateRef<any>>('ref');
}

describe('SiModalService', () => {
  let service!: SiModalService;
  let appRef!: ApplicationRef;

  beforeEach(async () => {
    vi.useFakeTimers();
    service = TestBed.inject(SiModalService);
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('with template', () => {
    let templateRef: TemplateRef<any>;

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
      vi.advanceTimersByTime(500);
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
      expect(modal).toHaveTextContent('test component');

      modalRef.hide();
      vi.advanceTimersByTime(500);
      appRef.tick();

      expect(document.querySelector('si-modal')).not.toBeInTheDocument();
    });

    it('set input using setInputs', () => {
      const modalRef = service.show(DialogComponent, { inputValues: { inputProp: 'input value' } });

      appRef.tick();

      const modal = document.querySelector('si-modal');
      expect(modal).toBeTruthy();
      expect(modal).toHaveTextContent('input value');
      modalRef.setInput('inputProp', 'new input value');
      appRef.tick();
      expect(modal).toHaveTextContent('new input value');
      modalRef.hide();
      vi.advanceTimersByTime(500);
      appRef.tick();
    });
  });
});
