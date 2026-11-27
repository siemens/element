/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuGroup, CdkMenuTrigger } from '@angular/cdk/menu';
import { booleanAttribute, Component, computed, inject, input, model, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { elementDown2, elementOptions } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import {
  MenuItem,
  MenuItemAction,
  MenuItemCheckbox,
  MenuItemRadio,
  SiMenuActionService,
  SiMenuDirective,
  SiMenuDividerDirective,
  SiMenuFactoryComponent,
  SiMenuHeaderDirective,
  SiMenuItemCheckboxComponent,
  SiMenuItemComponent,
  SiMenuItemRadioComponent
} from '@siemens/element-ng/menu';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import { SiTranslatePipe, TranslatableString, t } from '@siemens/element-translate-ng/translate';

/** A product-supplied model available in the chat input. @experimental */
export interface ChatModelOption {
  /** Identifies a model option. */
  type: 'option';
  /** Model ID emitted when selected. */
  value: string;
  /** Display name; defaults to the model ID. */
  label?: TranslatableString;
  /** Optional secondary text. */
  description?: TranslatableString;
  /** Whether the model is unavailable for selection. */
  disabled?: boolean;
}

/** A labeled group of models. @experimental */
export interface ChatModelGroup {
  /** Identifies a model group. */
  type: 'group';
  /** Optional group heading. */
  label?: TranslatableString;
  /** Models displayed under the heading. */
  options: ChatModelOption[];
}

/** A model option or a labeled group of models. @experimental */
export type ChatModelItem = ChatModelOption | ChatModelGroup;

/**
 * Presentation-only model selector for chat inputs.
 * Options and selection are supplied by the consuming application.
 *
 * @experimental
 */
@Component({
  selector: 'si-chat-model-select',
  imports: [
    CdkMenuGroup,
    CdkMenuTrigger,
    RouterLink,
    SiMenuDirective,
    SiMenuDividerDirective,
    SiMenuFactoryComponent,
    SiMenuHeaderDirective,
    SiMenuItemCheckboxComponent,
    SiMenuItemComponent,
    SiMenuItemRadioComponent,
    SiIconComponent,
    SiResizeObserverDirective,
    SiTooltipDirective,
    SiTranslatePipe
  ],
  templateUrl: './si-chat-model-select.component.html',
  styleUrl: './si-chat-model-select.component.scss',
  host: { class: 'd-block' }
})
export class SiChatModelSelectComponent {
  private readonly menuActionService = inject(SiMenuActionService, { optional: true });
  protected readonly icons = addIcons({ elementDown2, elementOptions });
  protected readonly triggerWidth = signal(0);
  protected readonly isCompact = computed(
    () => this.compact() || this.availableWidth() < this.triggerWidth()
  );
  protected readonly selectedLabel = computed(() => {
    const options = this.options().flatMap(item => (item.type === 'group' ? item.options : [item]));
    const selected = options.find(option => option.value === this.value());
    return selected?.label ?? this.value() ?? '';
  });

  /** Available product-supplied models. @defaultValue [] */
  readonly options = input<ChatModelItem[]>([]);

  /** Active model ID; supports two-way binding. */
  readonly value = model<string>();

  /** Whether model selection is disabled. @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Whether to show an icon-only trigger. @defaultValue false */
  readonly compact = input(false);

  /** Space available in the surrounding toolbar, in pixels. @defaultValue Infinity */
  readonly availableWidth = input(Infinity);

  /** Additional product-supplied actions, including submenus. @defaultValue [] */
  readonly footerActions = input<MenuItem[]>([]);

  /**
   * Accessible label and compact trigger tooltip. The model name is available as `{{model}}`.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_MODEL_SELECT.LABEL:Model: {{model}}`)
   * ```
   */
  readonly label = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_MODEL_SELECT.LABEL:Model: {{model}}`)
  );

  protected runAction(item: MenuItemAction | MenuItemRadio | MenuItemCheckbox): void {
    if (typeof item.action === 'string') {
      this.menuActionService?.actionTriggered(item, undefined);
    } else {
      switch (item.type) {
        case 'action':
          item.action(undefined, item);
          break;
        case 'radio':
          item.action(undefined, item);
          break;
        case 'checkbox':
          item.action(undefined, item);
          break;
      }
    }
  }
}
