/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  ComponentRef,
  ElementRef,
  EnvironmentInjector,
  HostBinding,
  inject,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewContainerRef,
  viewChild,
  output
} from '@angular/core';

import { LOG_EVENT } from '../../helpers/log-event';
import { SI_LIVE_PREVIEW_CONFIG } from '../../interfaces/live-preview-config';

@Component({
  selector: 'si-live-preview-renderer',
  template: '<div #renderedExample></div><div #react id="app"></div>'
})
export class SiLivePreviewRendererComponent implements OnChanges, OnDestroy {
  readonly renderedExample = viewChild.required('renderedExample', { read: ViewContainerRef });
  readonly react = viewChild.required('react', { read: ElementRef });

  @HostBinding('class.live-preview-done') renderingDone = false;

  @HostBinding('attr.data-example')
  @Input()
  exampleUrl!: string;

  @HostBinding('attr.data-id')
  @Input()
  dataId = '';

  @Input() template = '';

  readonly templateFromComponent = output<string | undefined>();
  readonly logClear = output<void>();
  readonly logMessage = output<string>();
  readonly logRenderingError = output<any>();
  readonly inProgress = output<boolean>();
  readonly supportsLandscapeMode = output<boolean>();

  private componentRef?: ComponentRef<unknown>;

  private componentTs?: Promise<any>;
  private componentTsSampleComponent: any;

  private injector = Injector.create({
    parent: inject(Injector),
    providers: [
      {
        provide: LOG_EVENT,
        useValue: (...msg: any[]) => this.logMessage.emit(JSON.stringify(msg))
      }
    ]
  });
  private envInjector = inject(EnvironmentInjector);
  private config = inject(SI_LIVE_PREVIEW_CONFIG);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.exampleUrl?.currentValue) {
      this.loadFromUrl();
    }
  }

  ngOnDestroy(): void {
    this.clear();
  }

  recompile(): void {}

  private setRenderingError(hasError: boolean, msg?: any): void {
    this.logRenderingError.emit(msg);
    if (hasError) {
      setTimeout(() => this.setInProgress(false));
    }
  }

  private loadFromUrl(): void {
    this.logClear.emit();
    this.clear();
    this.componentTsSampleComponent = undefined;

    this.componentTs = this.config.componentLoader.load(this.exampleUrl);
    this.config.componentLoader.load(this.exampleUrl + '.html').then(template => {
      this.template = template.default;
      this.templateFromComponent.emit(this.template);
      console.log(this.template);
    });
    if (this.componentTs) {
      this.setInProgress(true);
      this.componentTs
        .then(m => {
          this.componentTsSampleComponent = m.SampleComponent;
          this.createComponent();
        })
        .catch(e => {
          this.componentTs = undefined;
          this.logRenderingError.emit(e ? e.toString() : 'Failed loading TS');
          setTimeout(() => this.setInProgress(false));
        });
    } else {
      // let the editor know there is no component, so no template
      this.templateFromComponent.emit(undefined);
    }
  }

  private setInProgress(inProgress: boolean): void {
    this.renderingDone = !inProgress;
    this.inProgress.emit(inProgress);
  }

  private createComponent(): void {
    this.setRenderingError(false);

    try {
      if (this.componentTsSampleComponent) {
        this.componentRef = this.renderedExample().createComponent(
          this.componentTsSampleComponent,
          {
            injector: this.injector,
            environmentInjector: this.envInjector
          }
        );
        setTimeout(() => this.setInProgress(false));
      }
    } catch (error: any) {
      this.setRenderingError(true, error.toString());
    }
  }

  private clear(): void {
    this.removeComponentInstance();
  }

  private removeComponentInstance(): void {
    try {
      this.renderedExample().clear();
    } catch (error: any) {
      console.warn('Error during component cleanup:', error);
    }
    this.componentRef?.destroy();
    this.componentRef = undefined;
  }
}
