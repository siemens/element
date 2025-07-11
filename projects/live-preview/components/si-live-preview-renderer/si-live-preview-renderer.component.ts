/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import {
  AfterViewInit,
  ChangeDetectorRef,
  ɵcompileComponent as compileComponent,
  ɵcompileNgModule as compileNgModule,
  Compiler,
  Component,
  ComponentRef,
  createNgModule,
  DoCheck,
  ElementRef,
  EnvironmentInjector,
  EventEmitter,
  HostBinding,
  inject,
  Injector,
  Input,
  NgModule,
  NgModuleRef,
  OnChanges,
  OnDestroy,
  Output,
  ɵresetCompiledComponents as resetCompiledComponents,
  SimpleChanges,
  ViewContainerRef,
  viewChild,
  ViewChild
} from '@angular/core';
import { ɵDomRendererFactory2 as DomRendererFactory2 } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { LOG_EVENT } from '../../helpers/log-event';
import {
  SI_LIVE_PREVIEW_CONFIG,
  SI_LIVE_PREVIEW_EXAMPLE_ROUTES,
  SI_LIVE_PREVIEW_INTERNALS
} from '../../interfaces/live-preview-config';
import { LandscapeSupportService } from '../../services/landscape-support.service';

// for handling JSON.stringify with circular references, from MDN
const getCircularReplacer = (): ((_key: any, value: any | null) => any) => {
  const seen = new WeakSet();
  return (_key: any, value: any | null) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-sample',
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  template: '',
  jit: true
})
export class DummyAppSampleComponent {}

@Component({
  selector: 'si-live-preview-renderer',
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
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

  @Output() readonly templateFromComponent = new EventEmitter<string | undefined>(true);
  @Output() readonly logClear = new EventEmitter();
  @Output() readonly logMessage = new EventEmitter<string>(true);
  @Output() readonly logRenderingError = new EventEmitter<any>(true);
  @Output() readonly inProgress = new EventEmitter<boolean>();
  @Output() readonly supportsLandscapeMode = new EventEmitter<boolean>();

  private componentRef?: ComponentRef<unknown>;
  private moduleRef?: NgModuleRef<unknown>;
  private hasRenderingError = false;

  private componentTs?: Promise<any>;
  private componentTsSampleComponent: any;
  private dynamicComponent: any;
  private dynamicComponentId?: string;
  private componentTsFirstLoad = true;
  private componentTsSampleModule: any;
  private component: any;
  private componentModule: any;
  private compiledTemplate?: string;

  // eslint-disable-next-line @typescript-eslint/no-deprecated
  private compiler = inject(Compiler);
  private injector = Injector.create({
    parent: inject(Injector),
    providers: [
      {
        provide: LOG_EVENT,
        useValue: (...msg: any[]) => this.logMessage.emit(this.stringifyLog(msg))
      }
    ]
  });
  private envInjector = inject(EnvironmentInjector);
  private rendererFactory = inject(DomRendererFactory2);
  private config = inject(SI_LIVE_PREVIEW_CONFIG);
  private internalConfig = inject(SI_LIVE_PREVIEW_INTERNALS);
  private activatedRoute = inject(ActivatedRoute);
  private defaultRoutes = this.activatedRoute.routeConfig?.children ?? [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.exampleUrl?.currentValue) {
      this.loadFromUrl();
    }
    if (changes.template?.currentValue) {
      // when the initial template is pushed from the renderer to the editor, this.template is
      // initially empty, but later changes to what the renderer has pushed out. In this case
      // don't compile
      if (this.template !== this.compiledTemplate) {
        this.setInProgress(true);
        this.compileWhenReady();
      }
    }
  }

  ngOnDestroy(): void {
    this.clear();
  }

  recompile(): void {
    this.removeComponentInstance();
    this.logClear.emit();
    this.setRenderingError(false);

    try {
      this.createComponentInstance();
    } catch (error) {
      this.setRenderingError(true, error);
    }
  }

  private logError(error: any): void {
    if (this.config.errorHandler) {
      this.config.errorHandler(error);
    }
  }

  private setRenderingError(hasError: boolean, msg?: any): void {
    this.hasRenderingError = hasError;
    this.logRenderingError.emit(msg);
    if (hasError) {
      setTimeout(() => this.setInProgress(false));
    }
  }

  private loadFromUrl(): void {
    this.logClear.emit();
    this.clear();
    this.componentTsSampleComponent = undefined;
    this.componentTsSampleModule = undefined;
    this.dynamicComponent = undefined;
    this.componentTsFirstLoad = true;

    this.componentTs = this.config.componentLoader.load(this.exampleUrl);
    if (this.componentTs) {
      this.setInProgress(true);
      this.componentTs
        .then(m => {
          this.componentTsSampleComponent = m.SampleComponent;
          this.dynamicComponent = m.SampleComponent;
          this.componentTsSampleModule = m.SampleModule;
          this.compileWhenReady();
          if (!this.componentTsSampleComponent && !this.template) {
            setTimeout(() => this.setInProgress(false));
          }
        })
        .catch(e => {
          this.componentTs = undefined;
          this.logRenderingError.emit(e ? e.toString() : 'Failed loading TS');
          setTimeout(() => this.setInProgress(false));
        });
    } else {
      // set the dummy component
      this.componentTsSampleComponent = DummyAppSampleComponent;

      // let the editor know there is no component, so no template
      this.templateFromComponent.emit(undefined);
    }
  }

  private setInProgress(inProgress: boolean): void {
    this.renderingDone = !inProgress;
    this.inProgress.emit(inProgress);
  }

  private compileWhenReady(): void {
    if (this.componentTs) {
      if (!this.componentTsSampleComponent) {
        // TS, but code not yet loaded
        return;
      }
      if (!this.componentTsFirstLoad && !this.template) {
        // TS, first load done, template not yet available
        return;
      }
    } else if (!this.template) {
      // no TS, no template
      return;
    }
    this.doCompileTemplate();
  }

  private doCompileTemplate(): void {
    this.logClear.emit();
    this.clear();
    this.createComponent();
  }

  private stringifyLog(args: any[]): string {
    return args.map(a => JSON.stringify(a, getCircularReplacer())).join(', ');
  }

  // this exists because in production mode, the ivy internal props are defined as
  // non-configurable and cannot be overwritten
  private cloneComponentWithoutIvyStuff(): void {
    if (!this.componentTsSampleComponent) {
      return;
    }
    const orig = this.componentTsSampleComponent;
    const ignoreProps = ['ɵcmp', 'ɵfac', 'ɵprov'];
    const copy: any = orig.bind({});

    const descriptors = Object.getOwnPropertyDescriptors(orig);
    for (const name of Object.getOwnPropertyNames(orig)) {
      if (ignoreProps.includes(name)) {
        continue;
      }
      Object.defineProperty(copy, name, descriptors[name]);
    }

    this.dynamicComponent = copy;
  }

  // patches the template into the loaded component (if any), returns the template to use
  private updateDynamicTemplate(): void {
    if (this.componentTsSampleComponent) {
      const ann = this.getAnnotation(this.componentTsSampleComponent, Component);
      if (ann) {
        const supportsLandscape = ann.providers?.includes(LandscapeSupportService);
        this.supportsLandscapeMode.emit(supportsLandscape);

        if (this.componentTsFirstLoad && !this.template) {
          // skipping compile on first load
          this.compiledTemplate = ann.template;
          this.templateFromComponent.emit(ann.template);
        } else if (ann.template !== this.template) {
          // recompile with new template
          this.componentTsFirstLoad = false;
          this.cloneComponentWithoutIvyStuff();
          ann.template = this.template;
          this.compiledTemplate = this.template;
          compileComponent(this.dynamicComponent, ann);
        }
      }
    }
  }

  private getAnnotation(obj: any, type: any): any {
    return obj?.__annotations__?.find((a: any) => a instanceof type);
  }

  private createAbstractComponentClass(ionic: boolean): any {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    this.updateDynamicTemplate();

    @Component({
      // eslint-disable-next-line @angular-eslint/prefer-standalone
      standalone: false,
      template: '',
      jit: true
    })
    class AbstractRuntimeComponent implements DoCheck, AfterViewInit {
      private changeDetector = inject(ChangeDetectorRef);
      // NOTE: This must be @ViewChild and not signal query as signal query doesn't work with jit
      @ViewChild('container', { read: ViewContainerRef })
      private container!: ViewContainerRef;

      constructor() {
        this.changeDetector.detach();
      }

      logEvent(...msg: any[]): void {
        self.logMessage.emit(self.stringifyLog(msg));
      }

      ngDoCheck(): void {
        if (self.hasRenderingError) {
          return;
        }
        try {
          this.changeDetector.detectChanges();
        } catch (error: any) {
          setTimeout(() => this.handleError(error));
        }
      }

      ngAfterViewInit(): void {
        setTimeout(() => {
          self.setInProgress(false);
          const exampleRoutes =
            this.container?.injector.get(SI_LIVE_PREVIEW_EXAMPLE_ROUTES, undefined, {
              optional: true,
              self: true
            }) ?? self.defaultRoutes;

          const route = self.activatedRoute.routeConfig;
          if (route) {
            // cannot use router.resetConfig here as it destroys the components on child route navigations
            route.children = [...exampleRoutes];
          }
        });
      }

      private handleError(error: Error): void {
        let msg = error.message;
        if (error.stack) {
          const stack = error.stack.split('\n', 3);
          stack.forEach(s => (msg += `\n${s}`));
        }
        self.setRenderingError(true, msg);

        // since these kind of errors are most likely bugs in the components, forward error
        self.logError(error);
      }
    }

    if (ionic) {
      @Component({
        selector: 'si-rendered-example',
        // eslint-disable-next-line @angular-eslint/prefer-standalone
        standalone: false,
        template: '<ion-app><app-sample #container class="ion-page"></app-sample></ion-app>',
        jit: true
      })
      class RuntimeComponent extends AbstractRuntimeComponent {}

      return RuntimeComponent;
    }

    @Component({
      selector: 'si-rendered-example',
      // eslint-disable-next-line @angular-eslint/prefer-standalone
      standalone: false,
      template: '<app-sample #container></app-sample>',
      jit: true
    })
    class RuntimeComponent extends AbstractRuntimeComponent {}

    return RuntimeComponent;
  }

  private createComponentClass(): any {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const RuntimeComponent = this.createAbstractComponentClass(this.internalConfig.isMobile);
    const compAnn = this.getAnnotation(RuntimeComponent, Component);
    if (!Object.prototype.hasOwnProperty.call(RuntimeComponent, 'ɵcmp')) {
      compileComponent(RuntimeComponent, compAnn);
    }
    return RuntimeComponent;
  }

  private createModule(): any {
    const meta: NgModule = {
      declarations: [this.component],
      imports: [...this.config.modules],
      jit: true
    };

    if (this.dynamicComponent) {
      if (this.dynamicComponent['ɵcmp'].standalone) {
        meta.imports!.push(this.dynamicComponent);
      } else {
        meta.declarations!.push(this.dynamicComponent);
      }
    }

    // Merge the provided NgModule into the one to be constructed. This is necessary to have everything at the
    // right level. Otherwise, the provided module would have to declare and export the component as well
    const ann = this.getAnnotation(this.componentTsSampleModule, NgModule);
    if (ann) {
      for (const field of ['imports', 'declarations', 'exports', 'providers']) {
        const fieldAnn = ann[field];
        if (fieldAnn) {
          if (!(meta as any)[field]) {
            (meta as any)[field] = [];
          }
          (meta as any)[field].push(...fieldAnn);
        }
      }
    }

    @NgModule({
      declarations: meta.declarations,
      imports: meta.imports,
      exports: meta.exports,
      providers: meta.providers,
      jit: true
    })
    class RuntimeComponentModule {}

    if (!Object.hasOwnProperty.call(RuntimeComponentModule, 'ɵmod')) {
      compileNgModule(RuntimeComponentModule, this.getAnnotation(RuntimeComponentModule, NgModule));
    }

    return RuntimeComponentModule;
  }

  private clear(): void {
    this.removeComponentInstance();
    this.moduleRef?.destroy();
    this.moduleRef = undefined;

    if (this.componentModule) {
      this.compiler.clearCacheFor(this.component);
      this.compiler.clearCacheFor(this.componentModule);
      this.component = undefined;
      this.componentModule = undefined;
    }

    if (this.dynamicComponent) {
      this.compiler.clearCacheFor(this.dynamicComponent);
    }

    resetCompiledComponents();
  }

  private removeComponentInstance(): void {
    try {
      this.renderedExample().remove();
    } catch (error: any) {
      // FIXME: there's no point in logging this as rendering error since it will be cleared right away
      console.warn('Error during ngOnDestroy():', error);
    }
    this.componentRef?.destroy();
    this.componentRef = undefined;

    // clear out render for component id:
    // - contains the styles
    // - stays mostly the same for all examples
    if (this.dynamicComponentId) {
      (this.rendererFactory as any).rendererByCompId?.delete(this.dynamicComponentId);
    }
  }

  private createComponent(): void {
    this.setRenderingError(false);

    try {
      this.component = this.createComponentClass();
      this.componentModule = this.createModule();

      this.moduleRef = createNgModule(this.componentModule, this.envInjector);
      this.createComponentInstance();
    } catch (error: any) {
      this.setRenderingError(true, error.toString());
    }
  }

  private createComponentInstance(): void {
    this.dynamicComponentId = this.dynamicComponent?.['ɵcmp']?.id;

    if (this.moduleRef) {
      this.componentRef = this.renderedExample().createComponent(this.component, {
        injector: this.injector,
        ngModuleRef: this.moduleRef
      });
    }
  }
}
