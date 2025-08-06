/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  viewChild
} from '@angular/core';
import {
  SiAutocompleteDirective,
  SiAutocompleteListboxDirective,
  SiAutocompleteOptionDirective
} from '@spike-rabbit/element-ng/autocomplete';
import { SiIconNextComponent } from '@spike-rabbit/element-ng/icon';
import { SiTranslatePipe } from '@spike-rabbit/element-translate-ng/translate';

import { SiTypeaheadDirective } from './si-typeahead.directive';
import { TypeaheadMatch } from './si-typeahead.model';

@Component({
  selector: 'si-typeahead',
  imports: [
    SiAutocompleteListboxDirective,
    SiAutocompleteOptionDirective,
    SiIconNextComponent,
    NgTemplateOutlet,
    SiTranslatePipe
  ],
  templateUrl: './si-typeahead.component.html',
  styleUrl: './si-typeahead.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'w-100' }
})
export class SiTypeaheadComponent implements AfterViewInit {
  protected parent = inject(SiTypeaheadDirective);
  protected readonly matches = computed(() =>
    this.parent.typeaheadOptionsLimit()
      ? this.parent.foundMatches().slice(0, this.parent.typeaheadOptionsLimit())
      : this.parent.foundMatches()
  );

  protected readonly multiselect = computed(() => this.parent.typeaheadMultiSelect());

  private readonly typeaheadElement = viewChild.required('typeahead', {
    read: ElementRef
  });

  protected autocompleteDirective = inject(SiAutocompleteDirective);

  ngAfterViewInit(): void {
    this.setHeight(this.typeaheadElement());
  }

  @HostListener('mousedown', ['$event'])
  protected onMouseDown(event: Event): void {
    event.preventDefault();
  }

  /*
   * Set the height of the element passed to it (typeahead) if there are items displayed,
   * the number of displayed items changed and it is scrollable.
   */
  private setHeight(element: ElementRef): void {
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
  protected selectMatch(match: TypeaheadMatch): void {
    this.parent.selectMatch(match);
  }
}
