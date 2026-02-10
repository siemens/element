/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  AfterViewInit,
  ElementRef,
  inject,
  Renderer2,
  DOCUMENT,
  Directive,
  input,
  viewChild,
  SimpleChanges,
  OnChanges
} from '@angular/core';

import { WidgetConfig, WidgetInstance, WidgetInstanceEditor } from '../../model/widgets.model';

@Directive()
export abstract class SiWebComponentWrapperBaseComponent<
  T extends WidgetInstance | WidgetInstanceEditor
>
  implements AfterViewInit, OnChanges
{
  readonly config =
    input.required<
      T extends WidgetInstance ? WidgetConfig : WidgetConfig | Omit<WidgetConfig, 'id'>
    >();

  readonly elementTagName = input.required<string>();
  readonly url = input.required<string>();

  protected readonly webComponentHost = viewChild.required('webComponentHost', {
    read: ElementRef
  });

  protected webComponent?: HTMLElement & T;

  private renderer2 = inject(Renderer2);
  private document = inject(DOCUMENT);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.config && this.webComponent) {
      this.webComponent.config = this.config();
    }
  }

  ngAfterViewInit(): void {
    if (!this.isScriptLoaded(this.url())) {
      const script = this.renderer2.createElement('script');
      script.src = this.url();
      this.renderer2.appendChild(this.document.body, script);
    }

    this.webComponent = this.renderer2.createElement(this.elementTagName());
    if (this.webComponent) {
      this.webComponent.config = this.config();
    }
  }

  private isScriptLoaded(url: string): boolean {
    const script = document.querySelector(`script[src='${url}']`);
    return script ? true : false;
  }
}
