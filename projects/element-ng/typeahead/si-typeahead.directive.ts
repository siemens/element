/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ConnectionPositionPair, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  booleanAttribute,
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  inject,
  Injector,
  input,
  numberAttribute,
  OnChanges,
  OnDestroy,
  output,
  signal,
  SimpleChanges,
  TemplateRef
} from '@angular/core';
import { SiAutocompleteDirective } from '@siemens/element-ng/autocomplete';
import { isObservable, Observable, of, ReplaySubject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { SiTypeaheadComponent } from './si-typeahead.component';
import {
  Typeahead,
  TypeaheadArray,
  TypeaheadMatch,
  TypeaheadObservable,
  TypeaheadOption,
  TypeaheadOptionItemContext
} from './si-typeahead.model';
import { SiTypeaheadSorting } from './si-typeahead.sorting';

@Directive({
  selector: '[siTypeahead]',
  host: {
    class: 'si-typeahead'
  },
  hostDirectives: [SiAutocompleteDirective],
  exportAs: 'si-typeahead'
})
export class SiTypeaheadDirective implements OnChanges, OnDestroy {
  protected static readonly overlayPositions: ConnectionPositionPair[] = [
    {
      overlayX: 'start',
      overlayY: 'top',
      originX: 'start',
      originY: 'bottom',
      offsetY: 2
    },
    {
      overlayX: 'start',
      overlayY: 'bottom',
      originX: 'start',
      originY: 'top',
      offsetY: -4
    },
    {
      overlayX: 'end',
      overlayY: 'top',
      originX: 'end',
      originY: 'bottom',
      offsetY: 2
    },
    {
      overlayX: 'end',
      overlayY: 'bottom',
      originX: 'end',
      originY: 'top',
      offsetY: -4
    }
  ];

  /**
   * Set the options of the typeahead.
   * Has to be either an Array or an Observable of an Array
   * of options (string or object)
   */
  readonly siTypeahead = input.required<Typeahead>();

  /**
   * Turns on/off the processing (searching and sorting) of the typeahead options.
   * Is used when searching and sorting is done externally.
   *
   * @defaultValue true
   */
  readonly typeaheadProcess = input(true, {
    transform: booleanAttribute
  });
  /**
   * Makes the typeahead scrollable and sets its height.
   * Uses {@link typeaheadOptionsInScrollableView} and {@link typeaheadScrollableAdditionalHeight}.
   *
   * @defaultValue false
   */
  readonly typeaheadScrollable = input(false, { transform: booleanAttribute });

  /**
   * If {@link typeaheadScrollable} is `true`, defines the number of items visible at once.
   *
   * @defaultValue 10
   */
  readonly typeaheadOptionsInScrollableView = input(10);

  /**
   * Defines the maximum number of items added into the DOM. Default is 20 and 0 means unlimited.
   *
   * @defaultValue 20
   */
  readonly typeaheadOptionsLimit = input(20);

  /**
   * If {@link typeaheadScrollable} is `true`, defines the number of additional pixels
   * to be added the the bottom of the typeahead to show users that it is scrollable.
   *
   * @defaultValue 13
   */
  readonly typeaheadScrollableAdditionalHeight = input(13);

  /**
   * Defines the index of the item which should automatically be selected.
   *
   * @defaultValue 0
   */
  readonly typeaheadAutoSelectIndex = input(0, { transform: numberAttribute });
  /**
   * Defines whether the typeahead can be closed using escape.
   *
   * @defaultValue true
   */
  readonly typeaheadCloseOnEsc = input(true, { transform: booleanAttribute });
  /**
   * Defines whether the host value should be cleared when a value is selected.
   *
   * @defaultValue false
   */
  readonly typeaheadClearValueOnSelect = input(false, { transform: booleanAttribute });
  /**
   * Defines the number of milliseconds to wait before displaying a typeahead after the host was
   * focused or a value inputted.
   *
   * @defaultValue 0
   */
  readonly typeaheadWaitMs = input(0);

  /**
   * Defines the number of characters the value of the host needs to be before a typeahead is displayed.
   * Use `0` to have it display when focussing the host (clicking or tabbing into it).
   *
   * @defaultValue 1
   */
  readonly typeaheadMinLength = input(1);

  /**
   * Defines the name of the field/property the option string is in when the typeahead options are objects.
   *
   * @defaultValue 'name'
   */
  readonly typeaheadOptionField = input('name');
  /**
   * Defines whether multiselection of typeahead is possible with checkboxes.
   *
   * @defaultValue false
   */
  readonly typeaheadMultiSelect = input(false, { transform: booleanAttribute });

  /**
   * Defines whether to tokenize the search or match the whole search.
   *
   * @defaultValue true
   */
  readonly typeaheadTokenize = input(true, { transform: booleanAttribute });
  /**
   * Defines whether and how to require to match with all the tokens if {@link typeaheadTokenize} is enabled.
   * - `no` does not require all of the tokens to match.
   * - `once` requires all of the parts to be found in the search.
   * - `separately` requires all of the parts to be found in the search where there is not an overlapping different result.
   * - `independently` requires all of the parts to be found in the search where there is not an overlapping or adjacent different result.
   *  ('independently' also slightly changes sorting behavior in the same way.)
   *
   * @defaultValue 'separately'
   */
  readonly typeaheadMatchAllTokens = input<'no' | 'once' | 'separately' | 'independently'>(
    'separately'
  );
  /**
   * Defines an optional template to use as the typeahead match item instead of the one built in.
   * Gets the {@link TypeaheadOptionItemContext} passed to it.
   */
  readonly typeaheadItemTemplate = input<TemplateRef<TypeaheadOptionItemContext>>();
  /**
   * Skip the sorting of matches.
   * If the value is `true`, the matches are sorted according to {@link SiTypeaheadSorting}.
   *
   * @defaultValue false
   */
  readonly typeaheadSkipSortingMatches = input(false, { transform: booleanAttribute });

  /**
   * Screen reader only label for the autocomplete list.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_TYPEAHEAD.AUTOCOMPLETE_LIST_LABEL:Suggestions`
   * ```
   */
  readonly typeaheadAutocompleteListLabel = input(
    $localize`:@@SI_TYPEAHEAD.AUTOCOMPLETE_LIST_LABEL:Suggestions`
  );

  /**
   * If set, the typeahead will at minium have the width of the connected input field.
   *
   * @defaultValue false
   */
  readonly typeaheadFullWidth = input(false, { transform: booleanAttribute });
  /**
   * Emits an Event when the input field is changed.
   */
  readonly typeaheadOnInput = output<string>();
  /**
   * Emits an Event when a typeahead match is selected.
   * The event is a {@link TypeaheadMatch}
   */
  readonly typeaheadOnSelect = output<TypeaheadMatch>();

  /** @deprecated Never emits. Use {@link typeaheadOpenChange} instead. */
  readonly typeaheadOnMultiselectClose = output<void>();
  /**
   * Emits an Event when a typeahead full match exists. A full match occurs when the entered text
   * is equal to one of the typeahead options.
   * The event is a {@link TypeaheadMatch}
   */
  readonly typeaheadOnFullMatch = output<TypeaheadMatch>();

  /** @deprecated Use {@link typeaheadOpenChange} instead. */
  readonly typeaheadClosed = output<void>();

  /** Emits whenever the typeahead overlay is opened or closed. */
  readonly typeaheadOpenChange = output<boolean>();

  /** @internal */
  readonly foundMatches = signal<TypeaheadMatch[]>([]);
  /** @internal */
  readonly query = signal<string>('');
  /**
   * Indicates whether the typeahead is shown.
   */
  get typeaheadOpen(): boolean {
    return !!this.componentRef;
  }
  private overlay = inject(Overlay);
  private elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private injector = inject(Injector);
  private autoComplete = inject<SiAutocompleteDirective<TypeaheadMatch>>(SiAutocompleteDirective);

  private $typeahead = new ReplaySubject<TypeaheadArray>(1);
  private componentRef?: ComponentRef<SiTypeaheadComponent>;
  private component?: SiTypeaheadComponent;
  private inputTimer: any;

  private sourceSubscription?: Subscription;
  private subscription?: Subscription;
  private matchSorter = new SiTypeaheadSorting();

  private overlayRef?: OverlayRef;

  // Every time the main input changes, detect whether it is async and if it is not make an observable out of the array.
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.siTypeahead) {
      this.sourceSubscription?.unsubscribe();
      const typeahead = this.siTypeahead();
      if (isObservable(typeahead)) {
        this.sourceSubscription = typeahead.subscribe(this.$typeahead);
      } else {
        this.$typeahead.next(typeahead);
      }
    }
  }

  // Clear the current input timeout (if set) and remove the component when the focus of the host is lost.
  @HostListener('focusout')
  protected onBlur(): void {
    this.clearTimer();
    if (this.component) {
      this.removeComponent();
    }
    this.subscription?.unsubscribe();
  }

  // Start the input timeout to display the typeahead when the host is focussed or a value is inputted into it.
  @HostListener('focusin', ['$event'])
  @HostListener('input', ['$event'])
  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target) {
      return;
    }

    // Get the value or otherwise textContent of the host element now, because later it could be reset.
    const firstValue = target.value || target.textContent;
    this.inputTimer ??= setTimeout(() => {
      this.inputTimer = undefined;
      const value = (target.value || target.textContent) ?? firstValue ?? '';
      this.query.set(value);
      this.subscription?.unsubscribe();
      // The value needs to fulfil the minimum length requirement set.
      if (value.length >= this.typeaheadMinLength()) {
        this.subscription = this.getMatches(this.$typeahead, value).subscribe(matches => {
          this.foundMatches.set(matches);
          const escapedQuery = this.escapeRegex(value);
          const equalsExp = new RegExp(`^${escapedQuery}$`, 'i');
          const fullMatches = matches.filter(
            match => match.result.length === 1 && equalsExp.test(match.text)
          );
          if (fullMatches.length > 0) {
            this.typeaheadOnFullMatch.emit(fullMatches[0]);
          }
          if (matches.length) {
            this.loadComponent();
          } else {
            this.removeComponent();
          }
        });
      } else {
        this.removeComponent();
      }
      this.typeaheadOnInput.emit(value ?? '');
    }, this.typeaheadWaitMs());
  }

  @HostListener('keydown.escape')
  protected onKeydownEscape(): void {
    if (this.typeaheadCloseOnEsc()) {
      this.subscription?.unsubscribe();
      this.clearTimer();
      this.removeComponent();
    }
  }

  @HostListener('keydown.space', ['$event'])
  protected onKeydownSpace(event: Event): void {
    if (this.typeaheadMultiSelect()) {
      // Avoid space character to be inserted into the input field
      event.preventDefault();
      const value = this.autoComplete.active?.value();
      if (value) {
        this.selectMatch(value);
        // this forces change detection in the typeahead component.
        this.foundMatches.update(matches => [...matches]);
      }
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
    this.sourceSubscription?.unsubscribe();
    this.subscription?.unsubscribe();

    this.overlayRef?.dispose();
  }

  // Dynamically create the typeahead component and then set the matches and the query.
  private loadComponent(): void {
    if (!this.overlayRef?.hasAttached()) {
      this.overlayRef?.dispose();
      this.overlayRef = this.overlay.create({
        positionStrategy: this.overlay
          .position()
          .flexibleConnectedTo(this.elementRef.nativeElement)
          .withPositions(SiTypeaheadDirective.overlayPositions),
        minWidth: this.typeaheadFullWidth()
          ? this.elementRef.nativeElement.getBoundingClientRect().width + 2 // 2px border
          : 0
      });
    }

    if (this.overlayRef.hasAttached()) {
      return;
    }
    const typeaheadPortal = new ComponentPortal(SiTypeaheadComponent, null, this.injector);
    this.componentRef = this.overlayRef.attach(typeaheadPortal);
    this.component = this.componentRef.instance;
    this.typeaheadOpenChange.emit(true);
  }

  // Get the matches and push them to the subject of the component, then set the query of the component.
  // If the typeahead options are objects, pick the specified field/property.
  private getOptionValue(option: TypeaheadOption, field: string): string {
    return typeof option !== 'object' ? option.toString() : (option[field] ?? '');
  }

  // If enabled, process the matches and sort through them.
  private getMatches(
    observableList: TypeaheadObservable,
    query: string
  ): Observable<TypeaheadMatch[]> {
    try {
      const entireQueryRegex = new RegExp(this.escapeRegex(query), 'gi');

      const queryParts = this.typeaheadTokenize()
        ? query.split(/\s+/g).filter(queryPart => queryPart)
        : query
          ? [query]
          : [];

      const queryRegexes = queryParts.map(
        queryPart => new RegExp(this.escapeRegex(queryPart), 'gi')
      );
      return observableList.pipe(
        map(options => {
          // Check if the options need to be processed, if not just return an unprocessed object.
          if (!this.typeaheadProcess()) {
            return options.map(option => {
              const optionValue = this.getOptionValue(option, this.typeaheadOptionField());
              const itemSelected = this.typeaheadMultiSelect()
                ? this.getOptionValue(option, 'selected')
                : false;
              const iconClass = this.getOptionValue(option, 'iconClass');
              return {
                option,
                itemSelected,
                text: optionValue,
                iconClass,
                result: optionValue
                  ? [{ text: optionValue, isMatching: false, matches: 0, uniqueMatches: 0 }]
                  : [],
                stringMatch: false,
                atBeginning: false,
                matches: 0,
                uniqueMatches: 0,
                uniqueSeparateMatches: 0,
                matchesEntireQuery: false,
                matchesAllParts: false,
                matchesAllPartsSeparately: false,
                active: false
              } as TypeaheadMatch;
            });
          } else {
            // Process the options.
            const matches: TypeaheadMatch[] = [];
            options.forEach(option => {
              const optionValue = this.getOptionValue(option, this.typeaheadOptionField());
              const stringMatch =
                optionValue.toLocaleLowerCase().trim() === query.toLocaleLowerCase().trim();
              const itemSelected = this.typeaheadMultiSelect()
                ? option['selected' as keyof TypeaheadOption]
                : false;
              const iconClass = this.getOptionValue(option, 'iconClass');
              const candidate: TypeaheadMatch = {
                option,
                itemSelected,
                text: optionValue,
                iconClass,
                result: [],
                stringMatch,
                atBeginning: false,
                matches: 0,
                uniqueMatches: 0,
                uniqueSeparateMatches: 0,
                matchesEntireQuery: false,
                matchesAllParts: false,
                matchesAllPartsSeparately: false
              };

              // Only search the options if a part of the query is at least one character long to prevent an endless loop.
              if (queryParts.length === 0) {
                if (optionValue) {
                  candidate.result.push({
                    text: optionValue,
                    isMatching: false,
                    matches: 0,
                    uniqueMatches: 0
                  });
                }
                matches.push(candidate);
              } else {
                const allResults: { index: number; start: number; end: number; result: string }[] =
                  [];
                const allIndexes: number[] = [];

                candidate.matchesEntireQuery = !!optionValue.match(entireQueryRegex);

                // Loop through the option value to find multiple matches, then store every segment (matching or non-matching) in the results.
                queryRegexes.forEach((queryRegex, index) => {
                  let regexMatch = queryRegex.exec(optionValue);

                  while (regexMatch) {
                    allResults.push({
                      index,
                      start: regexMatch.index,
                      end: regexMatch.index + regexMatch[0].length,
                      result: regexMatch[0]
                    });
                    if (!regexMatch.index) {
                      candidate.atBeginning = true;
                    }
                    if (!allIndexes.includes(index)) {
                      allIndexes.push(index);
                    }
                    regexMatch = queryRegex.exec(optionValue);
                  }
                });

                candidate.matchesAllParts = allIndexes.length === queryParts.length;

                // Check if all parts of the query match at least once (if required).
                if (this.typeaheadMatchAllTokens() === 'no' || candidate.matchesAllParts) {
                  const combinedResults: {
                    indexes: number[];
                    uniqueIndexes: number[];
                    start: number;
                    end: number;
                    result: string;
                  }[] = [];

                  // First combine intersecting (or if set to independently adjacent) results to combined results.
                  // We achieve this by first sorting them by the starting index, then by the ending index and then looking for overlaps.
                  allResults
                    .sort((a, b) => a.start - b.start || a.end - b.end)
                    .forEach(result => {
                      if (combinedResults.length) {
                        const foundPreviousResult = combinedResults.find(previousResult =>
                          this.typeaheadMatchAllTokens() === 'independently'
                            ? result.start <= previousResult.end
                            : result.start < previousResult.end
                        );
                        if (foundPreviousResult) {
                          foundPreviousResult.result += result.result.slice(
                            foundPreviousResult.end - result.start,
                            result.result.length
                          );
                          if (result.end > foundPreviousResult.end) {
                            foundPreviousResult.end = result.end;
                          }
                          foundPreviousResult.indexes.push(result.index);
                          if (!foundPreviousResult.uniqueIndexes.includes(result.index)) {
                            foundPreviousResult.uniqueIndexes.push(result.index);
                          }
                          return;
                        }
                      }
                      combinedResults.push({
                        ...result,
                        indexes: [result.index],
                        uniqueIndexes: [result.index]
                      });
                    });

                  // Recursively go through all unique combinations of the unique indexes to get the option which has the most indexes.
                  const countUniqueSubindexes = (
                    indexIndex = 0,
                    previousIndexes: number[] = []
                  ): number =>
                    indexIndex === combinedResults.length
                      ? previousIndexes.length
                      : Math.max(
                          previousIndexes.length,
                          ...combinedResults[indexIndex].uniqueIndexes
                            .filter(index => !previousIndexes.includes(index))
                            .map(index =>
                              countUniqueSubindexes(indexIndex + 1, [index, ...previousIndexes])
                            )
                        );

                  candidate.uniqueSeparateMatches = countUniqueSubindexes();
                  candidate.matchesAllPartsSeparately =
                    candidate.uniqueSeparateMatches === queryParts.length;

                  let currentPreviousEnd = 0;

                  // Add the combined results to the candidate including the non-matching parts in between.
                  combinedResults.forEach(result => {
                    const textBefore = optionValue.slice(currentPreviousEnd, result.start);
                    if (textBefore) {
                      candidate.result.push({
                        text: textBefore,
                        isMatching: false,
                        matches: 0,
                        uniqueMatches: 0
                      });
                    }
                    candidate.result.push({
                      text: result.result,
                      isMatching: true,
                      matches: result.indexes.length,
                      uniqueMatches: result.uniqueIndexes.length
                    });
                    currentPreviousEnd = result.end;
                    candidate.matches += result.indexes.length;
                    candidate.uniqueMatches += result.uniqueIndexes.length;
                  });

                  // Check if there are result segments and all parts are matched independently (if required).
                  if (
                    candidate.result.length !== 0 &&
                    ((this.typeaheadMatchAllTokens() !== 'separately' &&
                      this.typeaheadMatchAllTokens() !== 'independently') ||
                      candidate.matchesAllPartsSeparately)
                  ) {
                    const textAtEnd = optionValue.slice(currentPreviousEnd);
                    if (textAtEnd) {
                      candidate.result.push({
                        text: textAtEnd,
                        isMatching: false,
                        matches: 0,
                        uniqueMatches: 0
                      });
                    }
                    matches.push(candidate);
                  }
                }
              }
            });

            if (this.typeaheadSkipSortingMatches()) {
              return matches;
            } else {
              return this.matchSorter.sortMatches(matches);
            }
          }
        })
      );
    } catch {
      // Could not create regex (only in extremely rare cases, maybe even impossible), so return an empty array.
      return of([]);
    }
  }

  // Select a match, either gets called due to a enter keypress or from the component due to a click.
  /** @internal */
  selectMatch(match: TypeaheadMatch): void {
    match.itemSelected = !match.itemSelected;
    if (!this.typeaheadMultiSelect()) {
      const inputElement =
        this.elementRef.nativeElement.querySelector('input')! ?? this.elementRef.nativeElement;
      inputElement.value = this.typeaheadClearValueOnSelect() ? '' : match.text;
      inputElement.dispatchEvent(new Event('input'));
    }

    // Clear the current input timeout (if set) and remove the typeahead.
    this.clearTimer();
    this.typeaheadOnSelect.emit(match);
    if (!this.typeaheadMultiSelect()) {
      this.removeComponent();
    }
  }

  // Remove the component by clearing the viewContainerRef
  private removeComponent(): void {
    if (this.overlayRef?.hasAttached()) {
      this.overlayRef?.detach();
      this.typeaheadClosed.emit();
      this.typeaheadOpenChange.emit(false);
    }

    this.componentRef?.destroy();
    this.componentRef = undefined;
    this.component = undefined;
  }

  private clearTimer(): void {
    if (this.inputTimer) {
      clearTimeout(this.inputTimer);
      this.inputTimer = undefined;
    }
  }

  private escapeRegex(query: string): string {
    return query.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
  }
}
