/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ConnectionPositionPair, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  booleanAttribute,
  ChangeDetectorRef,
  ComponentRef,
  computed,
  Directive,
  effect,
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
import { toSignal } from '@angular/core/rxjs-interop';
import { SiAutocompleteDirective } from '@siemens/element-ng/autocomplete';
import { t, TranslatableString } from '@siemens/element-translate-ng/translate';
import { isObservable, ReplaySubject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { SiTypeaheadComponent } from './si-typeahead.component';
import {
  Typeahead,
  TypeaheadArray,
  TypeaheadMatch,
  TypeaheadOption,
  TypeaheadOptionItemContext
} from './si-typeahead.model';
import { typeaheadSearch } from './si-typeahead.search';
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
   * t(() => $localize`:@@SI_TYPEAHEAD.AUTOCOMPLETE_LIST_LABEL:Suggestions`)
   * ```
   */
  readonly typeaheadAutocompleteListLabel = input(
    t(() => $localize`:@@SI_TYPEAHEAD.AUTOCOMPLETE_LIST_LABEL:Suggestions`)
  );

  /**
   * If set, the typeahead will at minium have the width of the connected input field.
   *
   * @defaultValue false
   */
  readonly typeaheadFullWidth = input(false, { transform: booleanAttribute });

  /**
   * This option will be shown at the end of the typeahead.
   * Use it to allow users to create new options on the fly.
   *
   * Use the `{{ query }}` parameter in translation values to include the current text from the input.
   *
   * @experimental
   */
  readonly typeaheadCreateOption = input<TranslatableString>();
  /**
   * Emits an Event when the input field is changed.
   */
  readonly typeaheadOnInput = output<string>();
  /**
   * Emits an Event when a typeahead match is selected.
   * The event is a {@link TypeaheadMatch}
   */
  readonly typeaheadOnSelect = output<TypeaheadMatch>();

  /**
   * Emits an Event when a typeahead full match exists. A full match occurs when the entered text
   * is equal to one of the typeahead options.
   * The event is a {@link TypeaheadMatch}
   */
  readonly typeaheadOnFullMatch = output<TypeaheadMatch>();

  /** Emits whenever the typeahead overlay is opened or closed. */
  readonly typeaheadOpenChange = output<boolean>();

  /**
   * Emits when the create option is selected.
   * It will emit the current search query.
   *
   * @experimental
   */
  readonly typeaheadOnCreateOption = output<string>();

  /** @internal */
  readonly foundMatches = computed(() =>
    this.typeaheadProcess() ? this.processedSearch() : this.unprocessedSearch()
  );
  /** @internal */
  readonly query = signal('');

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
  private inputTimer: any;

  private sourceSubscription?: Subscription;
  private matchSorter = new SiTypeaheadSorting();

  private overlayRef?: OverlayRef;
  private cdRef = inject(ChangeDetectorRef);

  /**
   * Indicates that the typeahead can be potentially open.
   * This signal is typically `true` when the input is focussed.
   * It may be overridden and set to `false` when escape is pressed
   * or when an option was selected.
   */
  private readonly canBeOpen = signal(false);
  private readonly selectionCounter = signal(0);
  private readonly typeaheadOptions = toSignal(
    this.$typeahead.pipe(
      map(options =>
        options.map(option => ({
          text: this.getOptionValue(option),
          option
        }))
      )
    ),
    { initialValue: [] }
  );
  private readonly typeaheadSearch = typeaheadSearch(
    this.typeaheadOptions,
    this.query,
    computed(() => ({
      matchAllTokens: this.typeaheadMatchAllTokens(),
      disableTokenizing: !this.typeaheadTokenize(),
      skipProcessing: !this.typeaheadProcess()
    }))
  );
  private readonly processedSearch = computed(() => {
    this.selectionCounter(); // This is a workaround for the multi-select which needs to trigger a change detection in the typeahead component.
    const matches = this.typeaheadSearch().map(match => ({
      ...match,
      itemSelected: this.typeaheadMultiSelect()
        ? (match.option as Record<string, any>).selected
        : false,
      iconClass: this.getOptionField(match.option, 'iconClass')
    }));

    if (this.typeaheadSkipSortingMatches()) {
      return matches;
    } else {
      return this.matchSorter.sortMatches(matches);
    }
  });
  private readonly unprocessedSearch = computed(() => {
    this.selectionCounter(); // This is a workaround for the multi-select which needs to trigger a change detection in the typeahead component.
    return this.typeaheadOptions().map(option => {
      const itemSelected = this.typeaheadMultiSelect()
        ? (option as Record<string, any>).selected
        : false;
      return {
        option,
        text: option.text,
        result: option.text
          ? [{ text: option.text, isMatching: false, matches: 0, uniqueMatches: 0 }]
          : [],
        itemSelected,
        iconClass: this.getOptionField(option.option, 'iconClass'),
        stringMatch: false,
        atBeginning: false,
        matches: 0,
        uniqueMatches: 0,
        uniqueSeparateMatches: 0,
        matchesEntireQuery: false,
        matchesAllParts: false,
        matchesAllPartsSeparately: false,
        active: false
      };
    });
  });

  constructor() {
    effect(() => {
      // The value needs to fulfil the minimum length requirement set.
      const matches = this.foundMatches();
      if (
        this.canBeOpen() &&
        this.query().length >= this.typeaheadMinLength() &&
        (matches.length || (this.typeaheadCreateOption() && this.query().length))
      ) {
        const escapedQuery = this.escapeRegex(this.query());
        const equalsExp = new RegExp(`^${escapedQuery}$`, 'i');
        const fullMatches = matches.filter(
          match => match.result.length === 1 && equalsExp.test(match.text)
        );
        if (fullMatches.length > 0) {
          this.typeaheadOnFullMatch.emit(fullMatches[0]);
        }
        if (matches.length || this.typeaheadCreateOption()) {
          this.loadComponent();
        } else {
          this.removeComponent();
        }
      } else {
        this.removeComponent();
      }
    });
  }

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
    this.canBeOpen.set(false);
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
      this.typeaheadOnInput.emit(value ?? '');
      this.canBeOpen.set(true);
      this.cdRef.markForCheck();
    }, this.typeaheadWaitMs());
  }

  @HostListener('keydown.escape')
  protected onKeydownEscape(): void {
    if (this.typeaheadCloseOnEsc()) {
      this.clearTimer();
      this.canBeOpen.set(false);
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
        this.selectionCounter.update(v => v + 1);
      }
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
    this.sourceSubscription?.unsubscribe();

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
    this.typeaheadOpenChange.emit(true);
  }

  /**
   * Extracts the display value from a typeahead option.
   *
   * For string options, returns the string value directly.
   * For object options, returns the value of the field specified by {@link typeaheadOptionField}
   * (defaults to 'name'), or an empty string if the field doesn't exist.
   *
   * @param option - The typeahead option to extract the value from
   * @returns The string representation of the option for display purposes
   */
  private getOptionValue(option: TypeaheadOption): string {
    return typeof option !== 'object'
      ? option.toString()
      : (option[this.typeaheadOptionField()] ?? '');
  }

  /**
   * Extracts a specific field value from a typeahead option.
   *
   * This method is used to access additional properties of object-type options,
   * such as 'selected' for multi-select functionality or 'iconClass' for displaying icons.
   *
   * @param option - The typeahead option to extract the field from
   * @param field - The name of the field to extract
   * @returns The field value as a string if the option is an object and the field exists,
   *          otherwise undefined
   */
  private getOptionField(option: TypeaheadOption, field: string): string | undefined {
    return typeof option !== 'object' ? undefined : option[field];
  }

  /** @internal */
  createOption(): void {
    this.typeaheadOnCreateOption.emit(this.query());
    this.clearTimer();
    if (!this.typeaheadMultiSelect() && this.typeaheadClearValueOnSelect()) {
      const inputElement =
        this.elementRef.nativeElement.querySelector('input')! ?? this.elementRef.nativeElement;
      inputElement.value = '';
      inputElement.dispatchEvent(new Event('input'));
    }
    this.canBeOpen.set(false);
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
      this.canBeOpen.set(false);
    }
  }

  // Remove the component by clearing the viewContainerRef
  private removeComponent(): void {
    if (this.overlayRef?.hasAttached()) {
      this.overlayRef?.detach();
      this.typeaheadOpenChange.emit(false);
    }

    this.componentRef?.destroy();
    this.componentRef = undefined;
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
