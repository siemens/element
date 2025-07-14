/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
/* eslint-disable @angular-eslint/prefer-output-emitter-ref */
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  numberAttribute,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
  TemplateRef
} from '@angular/core';
import { SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { Action, CollapseTo, PartState, Scale, SplitOrientation } from './si-split.interfaces';

@Component({
  selector: 'si-split-part',
  imports: [NgTemplateOutlet, SiIconNextComponent, SiTranslatePipe],
  templateUrl: './si-split-part.component.html',
  styleUrl: './si-split-part.component.scss',
  // Signals cannot be used directly with @HostBinding. See: https://github.com/angular/angular/issues/53888#issuecomment-1888935225
  // Having every binding here for consistency.
  host: {
    '[class.is-collapsed]': 'collapsedState()',
    '[class.collapse-start]': 'collapseDirection === "start"',
    '[style.grid-area]': '"p-" + this.index'
  }
})
export class SiSplitPartComponent implements OnChanges {
  /** @defaultValue [] */
  @Input() actions: Action[] = [];
  /**
   * @defaultValue 'start'
   */
  @Input() collapseDirection: CollapseTo = 'start';

  /**
   * Sets the icon class that is used in the buttons of split parts to
   * collapse and uncollapse the parts.
   *
   * @defaultValue 'element-double-right'
   */
  @Input() collapseIconClass = 'element-double-right';

  /**
   * Collapse only to the given min size.
   *
   * @defaultValue false
   */
  @Input({ transform: booleanAttribute }) collapseToMinSize = false;

  /**
   * Sets the status color on the split part header, visible as a bottom border and,
   * if a headerStatusIcon is defined, as the icon´s background color.
   *
   * @deprecated Legacy input with no functionality. Will be removed in future major release.
   */
  @Input() headerStatusColor?: string;

  /**
   * Sets the icon class that is used as status icon in the split part header.
   *
   * @deprecated Legacy input with no functionality. Will be removed in future major release.
   */
  @Input() headerStatusIconClass?: string;

  @Input() headerTemplate?: TemplateRef<any>;

  /**
   * Sets the title of the split part header.
   */
  @Input() heading!: string;

  /**
   * Minimum size in px.
   *
   * @defaultValue 0
   */
  @Input({ transform: numberAttribute }) minSize = 0;

  /**
   * When a split part is collapsed, the content gets hidden but it will
   * still remain within the DOM. If you want to remove and destroy the component
   * in collapsed mode and recreate it on un-collapse, set this property to
   * true.
   *
   * @defaultValue false
   */
  @Input({ transform: booleanAttribute }) removeContentOnCollapse = false;

  /**
   * Defines the behavior of the split part during scaling.
   * E.g. when set to `none`, the spit part will keep its current size even when the parent container grows or shrinks.
   *
   * @defaultValue 'auto'
   */
  @Input() scale: Scale = 'auto';

  /**
   * Defines if the collapse button of a split part is displayed. Default value is true.
   *
   * @defaultValue true
   */
  @Input({ transform: booleanAttribute }) showCollapseButton = true;

  /**
   * Defines if the header of the split part is visible. Default is true.
   *
   * @defaultValue true
   */
  @Input({ transform: booleanAttribute }) showHeader = true;
  /**
   * Aria label for collapse button. Needed for a11y
   *
   * @defaultValue 'collapse'
   */
  @Input() collapseLabel = 'collapse';
  /**
   * An optional stateId to uniquely identify a component instance.
   * Required for persistence of ui state.
   */
  @Input() stateId?: string;

  /**
   * Expanded size in px.
   */
  @Input({ transform: numberAttribute }) size?: number;

  /**
   * This toggles the behavior when collapsing this split part.
   * If enabled, all split parts between this one and the end of the split in the respective direction will be collapsed if this part is collapsed.
   * If disabled, only this split part will be collapsed.
   *
   * The default value will change to false in v48.
   *
   * @defaultValue true
   */
  @Input({ transform: booleanAttribute }) collapseOthers = true;

  @Output() readonly collapseChanged = new EventEmitter<boolean>();
  @Output() readonly stateChange = new EventEmitter<PartState>();

  /** @internal */
  index = 0;
  /** @internal */
  before?: SiSplitPartComponent;
  /** @internal */
  after?: SiSplitPartComponent;

  /** @internal */
  readonly fractionalSize = signal<number | undefined>(undefined);

  /** @internal */
  readonly collapsedSize = signal(0);

  /** @internal */
  readonly collapsedState = signal(false);

  /**
   * Get collapsed state.
   * @returns True if the split part is collapsed, false is expanded.
   */
  get collapsed(): boolean {
    return this.collapsedState();
  }

  /** @internal */
  readonly expandedSize = signal<number | undefined>(undefined);

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
    const nextExpanded: SiSplitPartComponent = this.after ? this.after.nextExpandedAfter() : this;

    return nextExpanded;
  });

  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  protected headerContext: { $implicit: SiSplitPartComponent } = {
    $implicit: this
  };

  /** @defaultValue true */
  @Input({ transform: booleanAttribute }) set expanded(value: boolean) {
    this.collapsedState.set(!value);
    if (this.collapseOthers) {
      this.before?.refreshCollapseToStart();
      this.after?.refreshCollapsedToEnd();
    }
  }
  get expanded(): boolean {
    return !this.collapsedState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.collapseToMinSize && this.collapseToMinSize) {
      this.collapsedSize.set(this.minSize ?? 40);
    } else {
      this.collapsedSize.set(40); // 40px is default size of the header
    }

    if (changes.size) {
      this.expandedSize.set(this.size);
    }
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
    if (this.collapseOthers) {
      this.before?.refreshCollapseToStart();
      this.after?.refreshCollapsedToEnd();
    }
    this.collapseChanged.emit(this.collapsedState());
    this.stateChange.emit({ expanded: this.expanded, size: this.actualSize() });
    this.saveUIState();
  }

  private refreshCollapsedToEnd(): void {
    if (this.before?.collapsedState() && this.before.collapseDirection === 'end') {
      this.collapsedState.set(true);
      this.collapseDirection = 'end';
      this.after?.refreshCollapsedToEnd();
    }
  }

  private refreshCollapseToStart(): void {
    if (this.after?.collapsedState() && this.after.collapseDirection === 'start') {
      this.collapsedState.set(true);
      this.collapseDirection = 'start';
      this.before?.refreshCollapseToStart();
    }
  }
}
