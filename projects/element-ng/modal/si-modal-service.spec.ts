/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ApplicationRef,
  Component,
  input,
  provideZonelessChangeDetection,
  TemplateRef,
  viewChild
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

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
    jasmine.clock().install();
    TestBed.configureTestingModule({
      imports: [DialogComponent, DialogTemplateComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    service = TestBed.inject(SiModalService);
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
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
      expect(modal?.innerHTML).toContain('test template');
      expect(bodyStyle.overflow).toBe('hidden');

      modalRef.hide();
      jasmine.clock().tick(500);
      appRef.tick();

      expect(document.querySelector('si-modal')).toBeFalsy();
      expect(bodyStyle.overflow).not.toBe('hidden');
    });
  });

  describe('with component', () => {
    it('shows and hides the dialog', () => {
      const modalRef = service.show(DialogComponent, {});

      appRef.tick();

      const modal = document.querySelector('si-modal');
      expect(modal).toBeTruthy();
      expect(modal?.innerHTML).toContain('test component');

      modalRef.hide();
      jasmine.clock().tick(500);
      appRef.tick();

      expect(document.querySelector('si-modal')).toBeFalsy();
    });

    it('set input using setInputs', () => {
      const modalRef = service.show(DialogComponent, { inputValues: { inputProp: 'input value' } });

      appRef.tick();

      const modal = document.querySelector('si-modal');
      expect(modal).toBeTruthy();
      expect(modal?.innerHTML).toContain('input value');
      modalRef.setInput('inputProp', 'new input value');
      appRef.tick();
      expect(modal?.innerHTML).toContain('new input value');
      modalRef.hide();
      jasmine.clock().tick(500);
      appRef.tick();
    });

    it('set input using initialState', () => {
      const modalRef = service.show(DialogComponent, {
        initialState: { normalProp: 'prop value' }
      });

      appRef.tick();

      const modal = document.querySelector('si-modal');
      expect(modal).toBeTruthy();
      expect(modal?.innerHTML).toContain('prop value');
      modalRef.hide();
      jasmine.clock().tick(500);
      appRef.tick();
    });
  });
});
