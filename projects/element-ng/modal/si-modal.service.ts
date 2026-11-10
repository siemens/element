/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  Binding,
  ComponentRef,
  EnvironmentInjector,
  inject,
  Injectable,
  Injector,
  inputBinding,
  StaticProvider,
  TemplateRef,
  Type
} from '@angular/core';
import { isRTL } from '@siemens/element-ng/common';
import { SiNoTranslateService, SiTranslateService } from '@siemens/element-translate-ng/translate';

import { ModalRef } from './modalref';
import { SiModalComponent } from './si-modal.component';

export interface ModalDependencyInjectionOptions {
  /** Additional providers for the modal. */
  providers?: StaticProvider[];
  /** Optional element Injector. */
  injector?: Injector;
  /** Optional environment Injector. */
  environmentInjector?: EnvironmentInjector;
}

export interface ModalOptions<T = Record<string, any>> extends ModalDependencyInjectionOptions {
  /**
   * Angular bindings for component content, created with `inputBinding`, `outputBinding`, or
   * `twoWayBinding`. Ignored for template content.
   */
  bindings?: Binding[];
  /**
   * Use this to assign values to either `@Input()` or `input()` fields of the provided component.
   * If a template is used, the values are available in the template context.
   */
  inputValues?: Record<string, unknown>;
  /** When set to true, clicking the backdrop has no effect. */
  ignoreBackdropClick?: boolean;
  /** When set to true, backdrop click or Esc don't close the modal. Instead a message will be sent. */
  messageInsteadOfAutoHide?: boolean;
  /** Handle Esc to close/message. */
  keyboard?: boolean;
  /** Whether to enable animation. */
  animated?: boolean;
  /** Additional CSS class. */
  class?: string;
  /** aria-labelled-by value. */
  ariaLabelledBy?: string;
}

class ModalRefImpl<T = never, CT = void> extends ModalRef<T, CT> {
  modalCompRef?: ComponentRef<SiModalComponent>;
  overlayRef?: OverlayRef;

  override get content(): T {
    return this.modalCompRef?.instance.componentRef?.instance as T;
  }

  override setInput(input: string, value: unknown): void {
    this.modalCompRef?.instance.componentRef?.setInput(input, value);
  }

  constructor(layer: number, data: ModalOptions, closeValue?: CT) {
    super();
    this.layer = layer;
    this.data = data;
    this.ignoreBackdropClick = data.ignoreBackdropClick !== false;
    this.dialogClass = data?.class ?? '';
    this.closeValue = closeValue;
  }
}

@Injectable({ providedIn: 'root' })
export class SiModalService {
  private modalsCount = 0;
  private readonly overlay = inject(Overlay);
  private injector = inject(Injector);

  /**
   * Shows a modal with the given content and configuration.
   * @param content - Content to be displayed in the modal can  be a template reference or a component.
   * @param config - Configuration for the modal.
   * @param closeValue - Default closing value which can be overridden by calling `modalRef.hide(value)`.
   * @returns A reference to the modal.
   */
  show<T, CT = any>(
    content: TemplateRef<any> | (new (...args: any[]) => T),
    config: ModalOptions<T>,
    closeValue?: CT
  ): ModalRef<T, CT> {
    const modalRef = new ModalRefImpl<T, CT>(++this.modalsCount, config, closeValue);
    const siModalRef = this.attachComponent(content, modalRef);
    modalRef.modalCompRef = siModalRef;
    modalRef.detach = () => this.detach(modalRef);
    modalRef.hide = (param?: CT) => modalRef.modalCompRef?.instance.hideDialog(param);
    modalRef.isCurrent = () => modalRef.layer === this.modalsCount;
    // Initialize the modal view so content is available before show() returns.
    siModalRef.changeDetectorRef.detectChanges();

    if (this.modalsCount === 1) {
      siModalRef.instance.showBackdrop();
    }

    return modalRef;
  }

  private attachComponent<T, CT>(
    content: TemplateRef<unknown> | Type<T>,
    modalRef: ModalRefImpl<T, CT>
  ): ComponentRef<SiModalComponent> {
    const providers: StaticProvider[] = [{ provide: ModalRef, useValue: modalRef }];
    modalRef.data.providers?.forEach(p => providers.push(p));
    const injector = Injector.create({
      providers,
      parent: modalRef.data.injector ?? this.buildInjector()
    });

    modalRef.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      direction: isRTL() ? 'rtl' : 'ltr'
    });
    const compPortal = new ComponentPortal(SiModalComponent, null, injector, undefined, [
      inputBinding('content', () => content)
    ]);
    return modalRef.overlayRef.attach(compPortal);
  }

  protected detach(modalRef: ModalRef<unknown, any>): void {
    const ref = modalRef as ModalRefImpl<unknown>;
    if (ref.modalCompRef) {
      ref.modalCompRef = undefined;
      ref.overlayRef?.detach();
      ref.overlayRef = undefined;
      ref.shown.complete();
      this.modalsCount--;
    }
  }

  // TODO remove once translation must be defined at application start
  // Notification service is provided in 'root'. If no translation is defined, SiNoTranslateService is not provided
  protected buildInjector(): Injector {
    let injector = this.injector;
    if (!injector.get(SiTranslateService, null)) {
      injector = Injector.create({
        providers: [{ provide: SiTranslateService, useClass: SiNoTranslateService, deps: [] }],
        parent: this.injector
      });
    }
    return injector;
  }
}
