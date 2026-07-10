/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  numberAttribute,
  output,
  signal,
  TemplateRef,
  untracked
} from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

import { Action, CollapseTo, PartState, Scale, SplitOrientation } from './si-split.interfaces';

@Component({
  selector: 'si-split-part',
  imports: [NgTemplateOutlet, SiIconComponent, SiTranslatePipe],
  templateUrl: './si-split-part.component.html',
  styleUrl: './si-split-part.component.scss',
  host: {
    '[class.is-collapsed]': 'collapsedState()',
    '[class.collapse-start]': 'collapseDirectionState() === "start"',
    '[style.grid-area]': '"p-" + this.index'
  }
})
export class SiSplitPartComponent {
  /**
   * Action buttons displayed in the split part header.
   *
   * @defaultValue []
   */
  readonly actions = input<Action[]>([]);
  /**
   * Defines which direction the split part collapses to.
   *
   * @defaultValue 'start'
   */
  readonly collapseDirection = input<CollapseTo>('start');

  /**
   * Sets the icon class that is used in the buttons of split parts to
   * collapse and uncollapse the parts.
   *
   * @defaultValue 'element-double-right'
   */
  readonly collapseIconClass = input('element-double-right');

  /**
   * Collapse only to the given min size.
   *
   * @defaultValue false
   */
  readonly collapseToMinSize = input(false, { transform: booleanAttribute });

  /**
   * Custom template for the split part header. The template receives the component instance as implicit context.
   */
  readonly headerTemplate = input<TemplateRef<{ $implicit: SiSplitPartComponent }>>();

  /**
   * Sets the title of the split part header.
   */
  readonly heading = input<TranslatableString>();

  /**
   * Minimum size in px.
   *
   * @defaultValue 0
   */
  readonly minSize = input(0, { transform: numberAttribute });

  /**
   * When a split part is collapsed, the content gets hidden but it will
   * still remain within the DOM. If you want to remove and destroy the component
   * in collapsed mode and recreate it on un-collapse, set this property to
   * true.
   *
   * @defaultValue false
   */
  readonly removeContentOnCollapse = input(false, { transform: booleanAttribute });

  /**
   * Defines the behavior of the split part during scaling.
   * E.g. when set to `none`, the spit part will keep its current size even when the parent container grows or shrinks.
   *
   * @defaultValue 'auto'
   */
  readonly scale = input<Scale>('auto');

  /**
   * Defines if the collapse button of a split part is displayed. Default value is true.
   *
   * @defaultValue true
   */
  readonly showCollapseButton = input(true, { transform: booleanAttribute });

  /**
   * Defines if the header of the split part is visible. Default is true.
   *
   * @defaultValue true
   */
  readonly showHeader = input(true, { transform: booleanAttribute });
  /**
   * Aria label for collapse button. Needed for a11y
   *
   * @defaultValue 'collapse'
   */
  readonly collapseLabel = input<TranslatableString>('collapse');
  /**
   * An optional stateId to uniquely identify a component instance.
   * Required for persistence of ui state.
   */
  readonly stateId = input<string>();

  /**
   * Expanded size in px.
   *
   * @defaultValue undefined
   */
  readonly size = input<number | undefined, unknown>(undefined, { transform: numberAttribute });

  /**
   * This toggles the behavior when collapsing this split part.
   * If enabled, all split parts between this one and the end of the split in the respective direction will be collapsed if this part is collapsed.
   * If disabled, only this split part will be collapsed.
   *
   * @defaultValue false
   */
  readonly collapseOthers = input(false, { transform: booleanAttribute });

  /**
   * Sets the initial expanded or collapsed state of the split part.
   *
   * @defaultValue true
   */
  readonly expanded = input(true, { transform: booleanAttribute });

  readonly collapseChanged = output<boolean>();
  readonly stateChange = output<PartState>();

  /** @internal */
  index = 0;
  /** @internal */
  readonly before = signal<SiSplitPartComponent | undefined>(undefined);
  /** @internal */
  readonly after = signal<SiSplitPartComponent | undefined>(undefined);

  /** @internal */
  readonly fractionalSize = signal<number | undefined>(undefined);

  /** @internal */
  readonly collapsedSize = computed(() => (this.collapseToMinSize() ? (this.minSize() ?? 40) : 40));

  /**
   * Internal, mutable collapsed state. Initialized from the {@link expanded} input but can be
   * overwritten while toggling, cascading to sibling parts or restoring the persisted ui state.
   * @internal
   */
  readonly collapsedState = linkedSignal(() => !this.expanded());

  /**
   * Internal, mutable collapse direction. Initialized from the {@link collapseDirection}
   * input but can be overwritten while cascading collapse state to sibling parts.
   * @internal
   */
  readonly collapseDirectionState = linkedSignal(() => this.collapseDirection());

  /**
   * Get collapsed state.
   * @returns True if the split part is collapsed, false is expanded.
   */
  get collapsed(): boolean {
    return this.collapsedState();
  }

  /** @internal */
  readonly expandedSize = linkedSignal(() => this.size());

  /** @internal */
  readonly actualSize = computed(() => {
    if (this.collapsedState()) {
      return this.collapsedSize();
    }
    return this.expandedSize() ?? 0;
  });

  /** @internal */
  saveUIState!: () => void;

  /** @internal */
  readonly nextExpandedAfter = computed(() => {
    if (!this.collapsedState()) {
      return this as SiSplitPartComponent;
    }
    const after = this.after();
    const nextExpanded: SiSplitPartComponent = after ? after.nextExpandedAfter() : this;

    return nextExpanded;
  });

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  protected headerContext: { $implicit: SiSplitPartComponent } = {
    $implicit: this
  };

  constructor() {
    effect(() => {
      this.expanded();
      untracked(() => {
        if (this.collapseOthers()) {
          this.before()?.refreshCollapseToStart();
          this.after()?.refreshCollapsedToEnd();
        }
      });
    });
  }

  /** @internal */
  refreshSizePx(orientation: SplitOrientation): void {
    if (!this.collapsedState()) {
      const rect = this.elementRef.nativeElement.getBoundingClientRect();
      if (orientation === 'vertical') {
        this.expandedSize.set(rect.height);
      } else {
        this.expandedSize.set(rect.width);
      }
    }
  }

  /**
   * Toggles the collapsed or expanded state.
   */
  toggleCollapse(): void {
    this.collapsedState.update(v => !v);
    if (this.collapseOthers()) {
      this.before()?.refreshCollapseToStart();
      this.after()?.refreshCollapsedToEnd();
    }
    this.collapseChanged.emit(this.collapsedState());
    this.stateChange.emit({ expanded: !this.collapsedState(), size: this.actualSize() });
    this.saveUIState();
  }

  private refreshCollapsedToEnd(): void {
    const before = this.before();
    if (before?.collapsedState() && before.collapseDirectionState() === 'end') {
      this.collapsedState.set(true);
      this.collapseDirectionState.set('end');
      this.after()?.refreshCollapsedToEnd();
    }
  }

  private refreshCollapseToStart(): void {
    const after = this.after();
    if (after?.collapsedState() && after.collapseDirectionState() === 'start') {
      this.collapsedState.set(true);
      this.collapseDirectionState.set('start');
      this.before()?.refreshCollapseToStart();
    }
  }
}
