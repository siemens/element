/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ApplicationRef, Component, input, TemplateRef, viewChild } from '@angular/core';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';

import { SiModalService } from './si-modal.service';

@Component({
  template: '<div>test component-{{normalProp}}-{{inputProp()}}</div>'
})
class DialogComponent {
  normalProp?: string;
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DialogComponent, DialogTemplateComponent]
    }).compileComponents();

    service = TestBed.inject(SiModalService);
    appRef = TestBed.inject(ApplicationRef);
  });

  describe('with template', () => {
    let templateRef: TemplateRef<any>;

    beforeEach(() => {
      const comp = TestBed.createComponent(DialogTemplateComponent);
      comp.detectChanges();
      templateRef = comp.componentInstance.templateRef();
    });

    it('shows and hides the dialog', fakeAsync(() => {
      const modalRef = service.show(templateRef, {});
      const bodyStyle = getComputedStyle(document.body);

      appRef.tick();
      flush();

      const modal = document.querySelector('si-modal');
      expect(modal).toBeTruthy();
      expect(modal?.innerHTML).toContain('test template');
      expect(bodyStyle.overflow).toBe('hidden');

      modalRef.hide();

      appRef.tick();
      flush();

      expect(document.querySelector('si-modal')).toBeFalsy();
      expect(bodyStyle.overflow).not.toBe('hidden');
    }));
  });

  describe('with component', () => {
    it('shows and hides the dialog', fakeAsync(() => {
      const modalRef = service.show(DialogComponent, {});

      appRef.tick();
      flush();

      const modal = document.querySelector('si-modal');
      expect(modal).toBeTruthy();
      expect(modal?.innerHTML).toContain('test component');

      modalRef.hide();

      appRef.tick();
      flush();

      expect(document.querySelector('si-modal')).toBeFalsy();
    }));

    it('set input using setInputs', fakeAsync(() => {
      const modalRef = service.show(DialogComponent, { inputValues: { inputProp: 'input value' } });

      appRef.tick();
      flush();

      const modal = document.querySelector('si-modal');
      expect(modal).toBeTruthy();
      expect(modal?.innerHTML).toContain('input value');
      modalRef.setInput('inputProp', 'new input value');
      appRef.tick();
      expect(modal?.innerHTML).toContain('new input value');
      modalRef.hide();
      appRef.tick();
      flush();
    }));

    it('set input using initialState', fakeAsync(() => {
      const modalRef = service.show(DialogComponent, {
        initialState: { normalProp: 'prop value' }
      });

      appRef.tick();
      flush();

      const modal = document.querySelector('si-modal');
      expect(modal).toBeTruthy();
      expect(modal?.innerHTML).toContain('prop value');
      modalRef.hide();
      appRef.tick();
      flush();
    }));
  });
});
