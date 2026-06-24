/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  linkedSignal,
  signal,
  viewChild,
  viewChildren
} from '@angular/core';
import {
  SiAutocompleteDirective,
  SiAutocompleteListboxDirective,
  SiAutocompleteOptionDirective
} from '@siemens/element-ng/autocomplete';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiLoadingSpinnerDirective } from '@siemens/element-ng/loading-spinner';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SiTypeaheadItemTemplateDirective } from './si-typeahead-item-template.directive';
import { SiTypeaheadDirective } from './si-typeahead.directive';
import { TypeaheadMatch } from './si-typeahead.model';

@Component({
  selector: 'si-typeahead',
  imports: [
    SiAutocompleteListboxDirective,
    SiAutocompleteOptionDirective,
    SiIconComponent,
    NgTemplateOutlet,
    SiTranslatePipe,
    SiTypeaheadItemTemplateDirective,
    SiLoadingSpinnerDirective,
    ComboboxPopup,
    ComboboxWidget
  ],
  templateUrl: './si-typeahead.component.html',
  styleUrl: './si-typeahead.component.scss',
  host: { class: 'w-100' }
})
export class SiTypeaheadComponent {
  protected parent = inject(SiTypeaheadDirective);
  protected readonly matches = computed(() =>
    this.parent.typeaheadOptionsLimit()
      ? this.parent.foundMatches().slice(0, this.parent.typeaheadOptionsLimit())
      : this.parent.foundMatches()
  );

  protected readonly multiselect = computed(() => this.parent.typeaheadMultiSelect());

  private readonly typeaheadElement = viewChild('typeahead', {
    read: ElementRef
  });

  protected readonly options = viewChildren(SiAutocompleteOptionDirective);

  protected autocompleteDirective = inject(SiAutocompleteDirective);

  protected readonly activeDescendant = computed(() => {
    const activeOption = this.matches()[this.parent.typeaheadAutoSelectIndex() ?? 0];
    return [activeOption];
  });

  //protected readonly value = signal([this.matches()[this.pa]]);

  constructor() {
    effect(() => {
      const typeaheadElement = this.typeaheadElement();
      if (typeaheadElement && this.autocompleteDirective.expanded()) {
        setTimeout(() => this.setHeight(typeaheadElement));
      }
    });
  }

  @HostListener('mousedown', ['$event'])
  protected onMouseDown(event: Event): void {
    event.preventDefault();
  }

  /** @defaultValue [] */
  readonly selectedMatch = linkedSignal<TypeaheadMatch[]>(() => this.activeDescendant() || []);

  /*
   * Set the height of the element passed to it (typeahead) if there are items displayed,
   * the number of displayed items changed and it is scrollable.
   */
  setHeight(element: ElementRef): void {
    if (this.matches().length) {
      if (
        this.parent.typeaheadScrollable() &&
        this.parent.typeaheadOptionsInScrollableView() < this.matches().length
      ) {
        const computedStyle = getComputedStyle(element.nativeElement);
        const matchComputedStyle = getComputedStyle(element.nativeElement.firstElementChild);
        const matchHeight = parseFloat(matchComputedStyle.height || '0');
        const paddingTop = parseFloat(computedStyle.paddingTop || '0');
        const paddingBottom = parseFloat(computedStyle.paddingBottom || '');
        const height = this.parent.typeaheadOptionsInScrollableView() * matchHeight;
        element.nativeElement.style.maxBlockSize = `${
          height + paddingTop + paddingBottom + this.parent.typeaheadScrollableAdditionalHeight()
        }px`;
      } else {
        element.nativeElement.style.maxBlockSize = 'auto';
      }
    }
  }

  // Gets called when a match is selected by clicking on it.
  protected selectMatch(match: TypeaheadMatch | undefined): void {
    if (match) {
      this.parent.selectMatch(match);
    } else {
      this.parent.createOption();
    }
  }
}
