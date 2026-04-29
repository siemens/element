/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, inject, input, isSignal, model, OnInit, output } from '@angular/core';
import { SiActionDialogService } from '@siemens/element-ng/action-modal';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { Widget, WidgetConfig } from '../../model/widgets.model';
import { SiWidgetEditorBase } from '../si-widget-editor-base';

/**
 * The Dialog component is utilized when editing a widget instance within a dashboard.
 * It dynamically loads and creates the associated widget editor and incorporates it
 * into its content. The dialog component is accountable for interacting with the dashboard
 * and offers options for saving changes or terminating the editing process.
 */
@Component({
  selector: 'si-widget-instance-editor-dialog',
  imports: [SiTranslatePipe],
  templateUrl: './si-widget-instance-editor-dialog.component.html',
  styleUrl: './si-widget-instance-editor-dialog.component.scss'
})
export class SiWidgetInstanceEditorDialogComponent extends SiWidgetEditorBase implements OnInit {
  /**
   * Input for the widget instance configuration. It is used to populate the
   * widget editor.
   */
  readonly widgetConfig = model.required<WidgetConfig>();

  /**
   * Input for the widget definition. It is required to retrieve the component
   * factory to instantiate the widget editor.
   */
  readonly widget = input.required<Widget>();

  /**
   * Emits the edited widget instance configuration if the user confirms by
   * saving, or `undefined` if the user cancels the dialog.
   */
  readonly closed = output<WidgetConfig | undefined>();

  /**
   * Emits when the editor instantiation is completed.
   */
  readonly editorSetupCompleted = output<void>();

  protected readonly showNextButton = computed(() =>
    this.editorWizardState() !== undefined ? true : false
  );

  protected readonly disableNextButton = computed(() => {
    const wizardState = this.editorWizardState();

    if (!wizardState) {
      return true;
    } else if (!wizardState.hasNext) {
      return true;
    } else if (wizardState.disableNext !== undefined) {
      return wizardState.disableNext;
    } else {
      return false;
    }
  });

  protected readonly showPreviousButton = computed(() => !!this.editorWizardState());

  protected readonly disablePreviousButton = computed(() => {
    const wizardState = this.editorWizardState();
    return wizardState ? !wizardState.hasPrevious : true;
  });

  protected labelSave = t(() => $localize`:@@DASHBOARD.WIDGET_EDITOR_DIALOG.SAVE:Save`);
  protected labelCancel = t(() => $localize`:@@DASHBOARD.WIDGET_EDITOR_DIALOG.CANCEL:Cancel`);
  protected labelPrevious = t(() => $localize`:@@DASHBOARD.WIDGET_EDITOR_DIALOG.PREVIOUS:Previous`);
  protected labelNext = t(() => $localize`:@@DASHBOARD.WIDGET_EDITOR_DIALOG.NEXT:Next`);
  protected labelDialogMessage = t(
    () =>
      $localize`:@@DASHBOARD.WIDGET_EDITOR_DIALOG.DISCARD_CONFIG_CHANGE_DIALOG.MESSAGE:The widget configuration changed. Do you want to discard the changes?`
  );
  protected labelDialogHeading = t(
    () =>
      $localize`:@@DASHBOARD.WIDGET_EDITOR_DIALOG.DISCARD_CONFIG_CHANGE_DIALOG.HEADING:Widget configuration changed`
  );
  protected labelDialogSave = t(
    () => $localize`:@@DASHBOARD.WIDGET_EDITOR_DIALOG.DISCARD_CONFIG_CHANGE_DIALOG.SAVE:Save`
  );
  protected labelDialogDiscard = t(
    () => $localize`:@@DASHBOARD.WIDGET_EDITOR_DIALOG.DISCARD_CONFIG_CHANGE_DIALOG.DISCARD:Discard`
  );
  protected labelDialogCancel = t(
    () => $localize`:@@DASHBOARD.WIDGET_EDITOR_DIALOG.DISCARD_CONFIG_CHANGE_DIALOG.CANCEL:Cancel`
  );

  private dialogService = inject(SiActionDialogService);

  ngOnInit(): void {
    this.loadWidgetEditor(this.widget().componentFactory, this.editorHost()).subscribe(
      componentRef => {
        this.initializeEditor(componentRef, this.widgetConfig()!);
        this.editorSetupCompleted.emit();
      }
    );
  }

  protected onCancel(): void {
    if (!this.widgetConfigModified()) {
      this.closed.emit(undefined);
    } else {
      this.dialogService
        .showActionDialog({
          type: 'edit-discard',
          disableSave: this.invalidConfig(),
          message: this.labelDialogMessage,
          heading: this.labelDialogHeading,
          saveBtnName: this.labelDialogSave,
          discardBtnName: this.labelDialogDiscard,
          cancelBtnName: this.labelDialogCancel,
          disableSaveMessage: this.labelDialogMessage,
          disableSaveDiscardBtnName: this.labelDialogDiscard
        })
        .subscribe(result => {
          if (result === 'discard') {
            this.closed.emit(undefined);
          } else if (result === 'save') {
            this.closed.emit(this.widgetConfig());
          }
        });
    }
  }

  protected onNext(): void {
    if (this.isEditorWizard(this.widgetInstanceEditor)) {
      this.widgetInstanceEditor.next();
      this.editorWizardState.set(this.widgetInstanceEditor.state);
    }
  }

  protected onPrevious(): void {
    if (this.isEditorWizard(this.widgetInstanceEditor) && this.editorWizardState()?.hasPrevious) {
      this.widgetInstanceEditor.previous();
      this.editorWizardState.set(this.widgetInstanceEditor.state);
    }
  }

  protected onSave(): void {
    // In case the widget instance editor did not only change values of the config
    // object, but set a new config object reference, we need to grab it and replace
    // our local config object.
    if (this.widgetInstanceEditor?.config) {
      if (isSignal(this.widgetInstanceEditor.config)) {
        this.widgetConfig.set(this.widgetInstanceEditor?.config() as WidgetConfig);
      } else {
        this.widgetConfig.set(this.widgetInstanceEditor?.config as WidgetConfig);
      }
    }

    this.closed.emit(this.widgetConfig());
  }
}
