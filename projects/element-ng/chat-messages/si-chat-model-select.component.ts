/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkMenu, MENU_STACK, MenuStack } from '@angular/cdk/menu';
import { Component, computed, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { elementOptions } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { MenuItem, SiMenuFactoryComponent } from '@siemens/element-ng/menu';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';
import {
  SiCustomSelectDirective,
  SiSelectComboboxComponent,
  SiSelectDropdownDirective,
  SiSelectListComponent,
  SiSelectListHasFilterComponent,
  SiSelectOptionTemplateDirective,
  SiSelectSimpleOptionsDirective,
  SiSelectSingleValueDirective
} from '@siemens/element-ng/select';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import { SiTranslatePipe, TranslatableString, t } from '@siemens/element-translate-ng/translate';
import { Subject } from 'rxjs';

class ChatModelMenuStack extends MenuStack {
  readonly closeRequested = new Subject<void>();
  menuSizing?: () => CSSStyleDeclaration | undefined;

  override push(menu: Parameters<MenuStack['push']>[0]): void {
    if (menu instanceof CdkMenu) {
      const style = menu.nativeElement.style;
      const sizing = this.menuSizing?.();
      style.inlineSize = 'max-content';
      style.minInlineSize = sizing?.minInlineSize ?? '';
      style.maxInlineSize = sizing?.maxInlineSize ?? '';
    }
    super.push(menu);
  }

  override closeAll(options?: Parameters<MenuStack['closeAll']>[0]): void {
    super.closeAll(options);
    this.closeRequested.next();
  }
}

/**
 * Presentation-only model selector for chat inputs.
 * Options and selection are supplied by the consuming application.
 *
 * @experimental
 */
@Component({
  selector: 'si-chat-model-select',
  imports: [
    SiCustomSelectDirective,
    SiSelectComboboxComponent,
    SiSelectDropdownDirective,
    SiSelectListComponent,
    SiSelectListHasFilterComponent,
    SiSelectOptionTemplateDirective,
    SiMenuFactoryComponent,
    SiIconComponent,
    SiResizeObserverDirective,
    SiTooltipDirective,
    SiTranslatePipe
  ],
  templateUrl: './si-chat-model-select.component.html',
  styleUrl: './si-chat-model-select.component.scss',
  providers: [{ provide: MENU_STACK, useFactory: () => new ChatModelMenuStack() }],
  host: { class: 'd-block' },
  hostDirectives: [
    { directive: SiSelectSimpleOptionsDirective, inputs: ['options'] },
    {
      directive: SiSelectSingleValueDirective,
      inputs: ['value', 'disabled'],
      outputs: ['valueChange']
    }
  ]
})
export class SiChatModelSelectComponent {
  private static idCounter = 0;
  private readonly options = inject<SiSelectSimpleOptionsDirective<string>>(
    SiSelectSimpleOptionsDirective
  );
  private readonly menuStack = inject<ChatModelMenuStack>(MENU_STACK);
  protected readonly selection = inject<SiSelectSingleValueDirective<string>>(
    SiSelectSingleValueDirective
  );
  protected readonly select = viewChild.required(SiCustomSelectDirective);
  private readonly dropdown = viewChild<ElementRef<HTMLElement>>('modelDropdown');
  protected readonly id = `__si-chat-model-select-${SiChatModelSelectComponent.idCounter++}`;
  protected readonly icons = addIcons({ elementOptions });
  protected readonly triggerWidth = signal(0);
  protected readonly isCompact = computed(
    () => this.compact() || this.availableWidth() < this.triggerWidth()
  );
  protected readonly selectedLabel = computed(() => {
    const selected = this.options.selectedRows()[0];
    return selected?.label ?? selected?.value ?? '';
  });

  /** Whether to show an icon-only trigger. @defaultValue false */
  readonly compact = input(false);

  /** Space available in the surrounding toolbar, in pixels. @defaultValue Infinity */
  readonly availableWidth = input(Infinity);

  /** Whether to show model search. @defaultValue false */
  readonly hasFilter = input(false);

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

  /**
   * Search placeholder.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_MODEL_SELECT.SEARCH:Search models…`)
   * ```
   */
  readonly filterPlaceholder = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_MODEL_SELECT.SEARCH:Search models…`)
  );

  /**
   * Label displayed when search has no matches.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_MODEL_SELECT.NO_RESULTS:No models found`)
   * ```
   */
  readonly noResultsFoundLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_MODEL_SELECT.NO_RESULTS:No models found`)
  );

  constructor() {
    this.menuStack.menuSizing = () => {
      const dropdown = this.dropdown()?.nativeElement;
      return dropdown ? getComputedStyle(dropdown) : undefined;
    };
    this.menuStack.closeRequested.pipe(takeUntilDestroyed()).subscribe(() => {
      const select = this.select();
      queueMicrotask(() => select.close());
    });
  }

  protected onOpenChange(open: boolean): void {
    if (open) {
      this.options.onFilter();
    }
  }
}
