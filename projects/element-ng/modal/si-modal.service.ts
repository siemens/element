/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EmbeddedViewRef,
  EnvironmentInjector,
  inject,
  Injectable,
  Injector,
  StaticProvider,
  TemplateRef,
  Type
} from '@angular/core';
import { isRTL } from '@spike-rabbit/element-ng/common';
import {
  SiNoTranslateService,
  SiTranslateService
} from '@spike-rabbit/element-translate-ng/translate';

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
   * Assign all values to the target component using `Object.assign(component, initialState)`.
   *
   * @deprecated Use {@link inputValues} instead.
   */
  initialState?: Partial<T>;
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
  contentRef: TemplateRef<any> | Type<any>;
  viewRef?: EmbeddedViewRef<any>;
  modalCompRef?: ComponentRef<SiModalComponent>;
  componentRef?: ComponentRef<T>;
  overlayRef?: OverlayRef;

  override get content(): T {
    return this.componentRef?.instance as T;
  }

  override setInput(input: string, value: unknown): void {
    this.componentRef?.setInput(input, value);
  }

  constructor(
    contentRef: TemplateRef<any> | Type<any>,
    layer: number,
    data: ModalOptions,
    closeValue?: CT
  ) {
    super();
    this.contentRef = contentRef;
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
  private appRef = inject(ApplicationRef);
  private injector = inject(Injector);
  private environmentInjector = inject(EnvironmentInjector);

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
    const modalRef = new ModalRefImpl<T, CT>(content, ++this.modalsCount, config, closeValue);
    const siModalRef = this.attachComponent(modalRef);
    modalRef.modalCompRef = siModalRef;
    modalRef.detach = () => this.detach(modalRef);
    modalRef.hide = (param?: CT) => siModalRef.instance.hideDialog(param);
    modalRef.isCurrent = () => modalRef.layer === this.modalsCount;

    if (this.modalsCount === 1) {
      siModalRef.instance.showBackdrop();
    }

    return modalRef;
  }

  private attachComponent<T, CT>(modalRef: ModalRefImpl<T, CT>): ComponentRef<SiModalComponent> {
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
    const compPortal = new ComponentPortal(SiModalComponent, null, injector);
    // Ensure compatibility between Angular CDK 19 and 20 since constructor arguments have changed
    compPortal.projectableNodes = this.getContentProjectableNodes(injector, modalRef);
    return modalRef.overlayRef.attach(compPortal);
  }

  private getContentProjectableNodes<T, CT>(
    injector: Injector,
    modalRef: ModalRefImpl<T, CT>
  ): Node[][] {
    if (modalRef.contentRef instanceof TemplateRef) {
      modalRef.viewRef = modalRef.contentRef.createEmbeddedView({
        modalRef,
        ...modalRef.data.initialState,
        ...modalRef.data.inputValues
      });
      this.appRef.attachView(modalRef.viewRef);
      return [modalRef.viewRef.rootNodes];
    }

    modalRef.componentRef = createComponent(modalRef.contentRef, {
      environmentInjector: modalRef.data.environmentInjector ?? this.environmentInjector,
      elementInjector: injector
    });
    Object.assign(modalRef.componentRef.instance as any, modalRef.data?.initialState);
    // set initial @Input() / input()
    for (const [key, value] of Object.entries(modalRef.data?.inputValues ?? {})) {
      modalRef.componentRef?.setInput(key, value);
    }
    modalRef.componentRef.changeDetectorRef.detectChanges();

    this.appRef.attachView(modalRef.componentRef.hostView);
    return [[modalRef.componentRef.location.nativeElement]];
  }

  protected detach(modalRef: ModalRef<unknown, any>): void {
    const ref = modalRef as ModalRefImpl<unknown>;
    if (ref.modalCompRef) {
      ref.modalCompRef?.destroy();
      ref.modalCompRef = undefined;
      ref.componentRef?.destroy();
      ref.componentRef = undefined;
      ref.viewRef?.destroy();
      ref.viewRef = undefined;
      ref.overlayRef?.dispose();
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
