/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ComponentRef,
  Directive,
  EnvironmentInjector,
  inject,
  Injector,
  isSignal,
  OnDestroy,
  OutputRefSubscription,
  signal,
  viewChild,
  ViewContainerRef
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import {
  WidgetComponentFactory,
  WidgetConfig,
  WidgetConfigStatus,
  WidgetInstanceEditor,
  WidgetInstanceEditorWizard,
  WidgetInstanceEditorWizardState
} from '../model/widgets.model';
import { setupWidgetEditor } from '../widget-loader';

/**
 * Base class encapsulating common widget editor lifecycle management.
 * Both `SiWidgetCatalogComponent` and `SiWidgetInstanceEditorDialogComponent`
 * extend this class to share editor setup, teardown, and status handling logic.
 */
@Directive()
export abstract class SiWidgetEditorBase implements OnDestroy {
  /** Indicates if the current config is valid or not. */
  protected readonly invalidConfig = signal(false);

  /** Marks the widget configuration as modified. */
  protected readonly widgetConfigModified = signal(false);

  protected readonly editorWizardState = signal<WidgetInstanceEditorWizardState | undefined>(
    undefined
  );

  protected widgetInstanceEditor?: WidgetInstanceEditor;
  protected subscriptions: (Subscription | OutputRefSubscription)[] = [];

  protected readonly editorHost = viewChild.required('editorHost', { read: ViewContainerRef });
  protected injector = inject(Injector);
  protected envInjector = inject(EnvironmentInjector);

  ngOnDestroy(): void {
    this.tearDownEditor();
  }

  protected loadWidgetEditor(
    widgetComponentFactory: WidgetComponentFactory,
    host: ViewContainerRef
  ): Observable<ComponentRef<WidgetInstanceEditor>> {
    return setupWidgetEditor(widgetComponentFactory, host, this.injector, this.envInjector);
  }

  protected initializeEditor(
    componentRef: ComponentRef<WidgetInstanceEditor>,
    config: WidgetConfig | Omit<WidgetConfig, 'id'>
  ): void {
    this.widgetInstanceEditor = componentRef.instance;
    if (isSignal(this.widgetInstanceEditor.config)) {
      componentRef.setInput('config', config);
    } else {
      this.widgetInstanceEditor.config = config;
    }
    // To be used by webcomponent wrapper
    if ('statusChangesHandler' in this.widgetInstanceEditor) {
      this.widgetInstanceEditor.statusChangesHandler = this.handleStatusChanges.bind(this);
    }

    if (this.widgetInstanceEditor.statusChanges) {
      this.subscriptions.push(
        this.widgetInstanceEditor.statusChanges.subscribe(statusChanges =>
          this.handleStatusChanges(statusChanges)
        )
      );
    } else if (this.widgetInstanceEditor.configChange) {
      this.subscriptions.push(
        this.widgetInstanceEditor.configChange.subscribe(() => this.widgetConfigModified.set(true))
      );
    }

    if (this.isEditorWizard(this.widgetInstanceEditor)) {
      this.editorWizardState.set(this.widgetInstanceEditor.state);

      if (this.widgetInstanceEditor.stateChange) {
        this.subscriptions.push(
          this.widgetInstanceEditor.stateChange.subscribe(state =>
            this.editorWizardState.set(state)
          )
        );
      }
    }
  }

  protected tearDownEditor(): void {
    this.invalidConfig.set(false);
    this.widgetConfigModified.set(false);
    this.editorWizardState.set(undefined);
    this.widgetInstanceEditor = undefined;
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
  }

  protected isEditorWizard(
    editor?: WidgetInstanceEditor | WidgetInstanceEditorWizard
  ): editor is WidgetInstanceEditorWizard {
    return !!editor && 'state' in editor;
  }

  protected handleStatusChanges(statusChanges: Partial<WidgetConfigStatus>): void {
    if (statusChanges.invalid !== undefined) {
      this.invalidConfig.set(statusChanges.invalid);
    }
    if (statusChanges.modified !== undefined) {
      this.widgetConfigModified.set(statusChanges.modified);
    }
  }
}
