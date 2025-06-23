/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  LOCALE_ID,
  model,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  signal,
  SimpleChanges,
  viewChild,
  viewChildren
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackgroundColorVariant, isRTL } from '@siemens/element-ng/common';
import {
  addIcons,
  SiIconNextComponent,
  elementCancel,
  elementSearch
} from '@siemens/element-ng/icon';
import { SiTypeaheadDirective, TypeaheadOption } from '@siemens/element-ng/typeahead';
import {
  SiTranslateModule,
  SiTranslateService,
  TranslatableString
} from '@siemens/element-translate-ng/translate';
import { BehaviorSubject, Observable, of, Subject, switchMap } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';

import {
  differenceByName,
  getISODateString,
  InternalCriterionDefinition,
  toInternalCriteria
} from './si-filtered-search-helper';
import { SiFilteredSearchValueComponent } from './si-filtered-search-value.component';
import {
  Criterion,
  CriterionDefinition,
  CriterionValue,
  DisplayedCriteriaEventArgs,
  OptionType,
  SearchCriteria
} from './si-filtered-search.model';

@Component({
  selector: 'si-filtered-search',
  templateUrl: './si-filtered-search.component.html',
  styleUrl: './si-filtered-search.component.scss',
  imports: [
    FormsModule,
    SiIconNextComponent,
    SiTypeaheadDirective,
    SiTranslateModule,
    SiFilteredSearchValueComponent
  ],
  host: {
    '[class.disabled]': 'disabled()',
    '[class.dark-background]': "colorVariant() === 'base-0'"
  }
})
export class SiFilteredSearchComponent implements OnInit, OnChanges, OnDestroy {
  private static readonly criterionRegex = /(.+?):(.*)$/;

  /**
   * Output callback event that provides an object describing the
   * selected criteria and additional filter text.
   */
  readonly doSearch = output<SearchCriteria>();

  /**
   * If this is set to `true`, the search triggers for each input (implicit search).
   * By default, the search is triggered when the user submits by pressing the
   * search button or by pressing enter.
   *
   * @defaultValue false
   */
  readonly doSearchOnInputChange = input(false, {
    transform: booleanAttribute
  });
  /**
   * In addition to lazy loaded value, you can also lazy load the criteria itself
   */
  readonly lazyCriterionProvider =
    input<
      (
        typed: string,
        searchCriteria?: SearchCriteria
      ) => Observable<Criterion[] | CriterionDefinition[]>
    >();
  /**
   * In many cases, your application defines the criteria, but the values need
   * to be loaded from a server. In this case you can provide a function that
   * returns the possible criterion options as an Observable.
   */
  readonly lazyValueProvider =
    input<(criterionName: string, typed: string | string[]) => Observable<OptionType[]>>();
  /**
   * Disable any interactivity.
   *
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Do not allow changes. Search can still be triggered.
   *
   * @deprecated Use {@link disabled} instead.
   *
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });
  /**
   * Limit criteria to the predefined ones.
   *
   * @defaultValue false
   */
  readonly strictCriterion = input(false, { transform: booleanAttribute });

  /**
   * Limit criterion options to the predefined ones. `[strictValue]`
   * enforces `[strictCriterion]` to true automatically.
   *
   * @defaultValue false
   */
  readonly strictValue = input(false, { transform: booleanAttribute });

  /**
   * Limit criterion options to the predefined ones and prevent typing. `[onlySelectValue]`
   * enforces `[strictValue]` and `[strictCriterion]` to true automatically.
   *
   * @defaultValue false
   */
  readonly onlySelectValue = input(false, { transform: booleanAttribute });

  /**
   * Custom debounce time for lazy loading of criteria data.
   *
   * @defaultValue 500
   */
  readonly lazyLoadingDebounceTime = input(500);

  /**
   * Custom debounce time (in mills) to delay the search emission.
   * (Default is 0 as in most cases a users manually triggers a search.
   * Recommended to increase a bit when using doSearchOnInputChange=true)
   *
   * @defaultValue 0
   */
  readonly searchDebounceTime = input(0);
  /**
   * The placeholder for input field.
   *
   * @defaultValue ''
   */
  readonly placeholder = input('');
  /**
   * @deprecated This property is unused and will be removed without a replacement.
   *
   * @defaultValue false
   */
  readonly showIcon = input(false, { transform: booleanAttribute });
  /**
   * @deprecated This property is unused and will be removed without a replacement.
   * To provide translation for the new search button, use the {@link submitButtonLabel} input.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILTERED_SEARCH.SUBMIT:Apply search criteria`
   * ```
   */
  readonly submitText = input($localize`:@@SI_FILTERED_SEARCH.SUBMIT:Apply search criteria`);

  /**
   *  @deprecated Setting this property will make it harder for user to submit a search.
   *  Instead of using this property to preselect to most relevant option, sort the options by relevance.
   */
  readonly selectedCriteriaIndex = input<number>();

  /**
   * Defines the number of criteria, criteria values and operators visible at once.
   *
   * @defaultValue 10
   */
  readonly optionsInScrollableView = input(10);

  /**
   * The current selected search criteria and entered search text.
   *
   * @defaultValue
   * ```
   * { criteria: [], value: '' }
   * ```
   */
  readonly searchCriteria = model<SearchCriteria>({ criteria: [], value: '' });

  /**
   * Predefine criteria options.
   *
   * @defaultValue []
   */
  readonly criteria = input<Criterion[] | CriterionDefinition[]>([]);
  /**
   * Opt-in to search for each criterion only once.
   *
   * @defaultValue false
   */
  readonly exclusiveCriteria = input(false, {
    transform: booleanAttribute
  });
  /**
   * Limit the number of possible criteria. The default is undefined so that any number of criteria can be used.
   * For example, setting the value to 1 let you only select one criterion that you need to remove before being
   * able to set another one.
   *
   * @defaultValue undefined
   */
  readonly maxCriteria = input<number | undefined>(undefined);

  /**
   * Defines the maximum options within one criterion. The default is 20 and 0 means unlimited.
   *
   * @defaultValue 20
   */
  readonly maxCriteriaOptions = input(20);
  /**
   * Search input aria label, Needed by a11y
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILTERED_SEARCH.SEARCH:Search`
   * ```
   */
  readonly searchLabel = input($localize`:@@SI_FILTERED_SEARCH.SEARCH:Search`);
  /**
   * Clear button aria label. Needed for a11y
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILTERED_SEARCH.CLEAR:Clear`
   * ```
   */
  readonly clearButtonLabel = input($localize`:@@SI_FILTERED_SEARCH.CLEAR:Clear`);

  /**
   * The accessible label of the search button.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILTERED_SEARCH.SUBMIT_BUTTON:Submit search`
   * ```
   */
  readonly submitButtonLabel = input($localize`:@@SI_FILTERED_SEARCH.SUBMIT_BUTTON:Submit search`);

  /**
   * Items count text appended to the count in case of multi-selection of values.
   * Translation key, `{{itemCount}}` in the translation will be replaced with the actual value.
   *
   * @defaultValue ''
   */
  readonly itemCountText = input<TranslatableString>('');
  /**
   * Color variant to determine component background
   *
   * @defaultValue 'base-1'
   */
  readonly colorVariant = input<BackgroundColorVariant>('base-1');
  /**
   * Text or translate key for multi selection pills text.
   *
   * @deprecated Use the new input {@link itemCountText} instead.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILTERED_SEARCH.ITEMS:items`
   * ```
   */
  readonly items = input($localize`:@@SI_FILTERED_SEARCH.ITEMS:items`);
  /**
   * Disables the free text search to only use the criterion for filtering.
   *
   * @defaultValue false
   */
  readonly disableFreeTextSearch = input(false, { transform: booleanAttribute });
  /**
   * Limit on the number of criteria/criteria value to be displayed by the typeahead
   *
   * @defaultValue 20
   */
  readonly typeaheadOptionsLimit = input(20);
  /**
   * @deprecated This property is unused and will be removed without a replacement.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_FILTERED_SEARCH.NO_MATCHING_CRITERIA:No matching criteria`
   * ```
   */
  readonly noMatchingCriteriaText = input(
    $localize`:@@SI_FILTERED_SEARCH.NO_MATCHING_CRITERIA:No matching criteria`
  );

  /**
   * By default, the Filtered Search will treat `:` as a special character
   * to submit the current input in the freetext and immediately create a criterion.
   * Use this input to disable this behavior.
   *
   * @defaultValue false
   */
  readonly disableSelectionByColonAndSemicolon = input(false, { transform: booleanAttribute });
  /**
   * The interceptor is called when the list of criteria is shown as soon as the user starts typing in the input field.
   * The interceptor's {@link DisplayedCriteriaEventArgs.allow} method can be used to filter the list of displayed criteria.
   *
   * **Note:** The interceptor is called as long as the {@link searchCriteria} does not exceed {@link maxCriteria}.
   * Further, the interceptor is not called when using the {@link lazyCriterionProvider}.
   *
   * @example
   * ```
   * <si-filtered-search
   *   [criteria]="[{ name: 'foo', label: 'Foo' }, { name: 'bar', label: 'Bar' }]"
   *   (interceptDisplayedCriteria)="$event.allow(
   *       $event.searchCriteria.criteria.some(s => s.name === 'foo')
   *         ? $event.criteria.filter(c => c !== 'foo')
   *         : $event.criteria
   *     )">
   * </si-filtered-search>
   * ```
   */
  readonly interceptDisplayedCriteria = output<DisplayedCriteriaEventArgs>();

  private readonly freeTextInputElement =
    viewChild.required<ElementRef<HTMLInputElement>>('freeTextInputElement');

  private readonly scrollContainer = viewChild.required('scrollContainer', { read: ElementRef });

  private readonly valueComponents = viewChildren(SiFilteredSearchValueComponent);

  protected dataSource: Observable<InternalCriterionDefinition[]>;
  protected autoEditCriteria = false;

  protected values: { config: InternalCriterionDefinition; value: CriterionValue }[] = [];
  protected searchValue = '';
  /** Internal criteria model */
  protected internalCriterionDefinitions: InternalCriterionDefinition[] = [];
  protected readonly icons = addIcons({ elementCancel, elementSearch });

  /** Used to trigger a renewed search */
  private typeaheadInputChange = new BehaviorSubject<string>('');
  /** Used to debounce the Search emissions */
  private searchEmitQueue = new Subject<SearchCriteria | undefined>();
  private destroySubscriptions = new Subject<boolean>();
  private cdRef = inject(ChangeDetectorRef);
  private translateService = inject(SiTranslateService);
  private locale = inject(LOCALE_ID).toString();
  /**
   * The cache is used to control when the interceptDisplayedCriteria event needs to be called.
   * Every time a criteria gain the focus we have to reset the cache to call the interceptor.
   */
  private allowedCriteriaCache?: string[];

  // Angular also calls ngOnChanges if we emitted a change and then two-way-databinding writes back our own change.
  // We use this to ensure that we do not write our own change back to the input.
  private lastEmittedSearchCriteria?: SearchCriteria;

  protected readonly isStrictOrOnlySelectValue = computed(() => {
    return this.strictValue() || this.onlySelectValue();
  });

  private readonly strictCriterionOrValue = computed(() => {
    return this.strictCriterion() || this.isStrictOrOnlySelectValue();
  });

  private readonly lazyLoadedCriteria = signal<Criterion[] | CriterionDefinition[] | undefined>(
    undefined
  );
  private readonly loadedCriteria = computed(() => {
    const lazyLoadedCriteria = this.lazyLoadedCriteria();
    if (lazyLoadedCriteria) {
      return lazyLoadedCriteria;
    } else {
      return this.criteria() ?? [];
    }
  });

  private readonly isReadOnly = computed(() => this.readonly() || this.disabled());

  constructor() {
    this.dataSource = this.typeaheadInputChange.pipe(
      switchMap(value => {
        if (this.lazyCriterionProvider()) {
          return this.lazyCriterionProvider()!(value, this.searchCriteria()).pipe(
            debounceTime(this.lazyLoadingDebounceTime()),
            map(result => this.getCriteriaToDisplayFromSubscription(result))
          );
        } else {
          return of(this.getFilteredTypeaheadCriteria(value));
        }
      }),
      switchMap(criteria => {
        return this.translateService.translateAsync(criteria.map(c => c.label)).pipe(
          map(translations => {
            criteria.forEach(c => (c.translatedLabel = translations[c.label] ?? c.label ?? c.name));
            return criteria;
          })
        );
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.criteria) {
      this.initCriteria();
    }
    if (
      (changes.searchCriteria && this.searchCriteria() !== this.lastEmittedSearchCriteria) ||
      changes.criteria
    ) {
      this.initValue();
      // Update typeahead since the criteria input can change while the free text input is focused.
      // This is necessary since the criteria are set as a result of an API call response.
      this.typeaheadInputChange.next(this.freeTextInputElement().nativeElement.value ?? '');
    }
  }

  ngOnInit(): void {
    if (this.strictCriterionOrValue() && this.internalCriterionDefinitions.length === 0) {
      throw new Error('strict criterion mode activated without predefined criteria!');
    }

    this.searchEmitQueue
      .pipe(debounceTime(this.searchDebounceTime()), takeUntil(this.destroySubscriptions))
      .subscribe(searchCriteria => this.doSearch.emit(searchCriteria!));
  }

  ngOnDestroy(): void {
    this.destroySubscriptions.next(true);
    this.destroySubscriptions.unsubscribe();
  }

  private initCriteria(): void {
    this.internalCriterionDefinitions = this.loadedCriteria().map(c => toInternalCriteria(c));
  }

  private initValue(): void {
    this.autoEditCriteria = false;
    this.searchValue = this.searchCriteria()?.value ?? '';
    this.values =
      this.searchCriteria()?.criteria.map(c => {
        const config =
          this.internalCriterionDefinitions.find(ic => ic.name === c.name) ??
          ({
            name: c.name,
            label: c.label ?? c.name,
            translatedLabel: c.label ?? c.name
          } as InternalCriterionDefinition);

        let value = c.value ?? '';
        // Fix input, in case the user provided the value as string for the multi-select use case.
        if (config.multiSelect && typeof value === 'string') {
          value = value !== '' ? [value] : [];
        }

        let dateValue: Date | undefined;
        if (config.validationType === 'date' || config.validationType === 'date-time') {
          dateValue = value ? new Date(value.toString()) : new Date();
          value ??= getISODateString(
            dateValue,
            config.validationType === 'date' || config.datepickerConfig?.disabledTime
              ? 'date'
              : 'date-time',
            this.locale
          );
        }

        return {
          value: {
            name: c.name,
            value,
            ...(dateValue ? { dateValue } : {}),
            ...(c.operator ? { operator: c.operator } : {})
          },
          config
        };
      }) ?? [];
    this.lastEmittedSearchCriteria = this.searchCriteria();
    this.allowedCriteriaCache = undefined;
  }

  /**
   * Deletes all currently selected criteria and effectively resets the filtered search.
   */
  deleteAllCriteria(event?: MouseEvent): void {
    if (this.isReadOnly()) {
      return;
    }
    event?.stopPropagation();

    // Reset search criteria
    this.values = [];
    this.searchValue = '';
    this.emitChangeEvent();
    this.allowedCriteriaCache = undefined;
    this.typeaheadInputChange.next(this.searchValue);
    this.submit();
  }

  protected deleteCriterion(
    criterion: CriterionValue,
    index: number,
    event: { triggerSearch: boolean } | void
  ): void {
    if (this.isReadOnly()) {
      return;
    }

    this.values = this.values.filter(v => v.value !== criterion);
    this.emitChangeEvent();
    this.allowedCriteriaCache = undefined;
    if (this.values.length !== index) {
      this.valueComponents()[index + 1].edit('value');
    } else {
      this.freeTextInputElement().nativeElement.focus();
    }
    this.typeaheadInputChange.next(this.searchValue);
    if (event?.triggerSearch) {
      this.submit();
    }
  }

  protected submit(): void {
    if (!this.doSearchOnInputChange()) {
      this.doSearch.emit(this.searchCriteria()!);
    }
  }

  protected typeaheadOnSelectCriterion(event: TypeaheadOption): void {
    const criterion = event as InternalCriterionDefinition;

    // Timeout is needed otherwise siTypeahead will overwrite the value
    setTimeout(() => {
      // Removes the focus border before creating a new criterion to prevent the impression of jumping content.
      this.freeTextInputElement().nativeElement.blur();
      this.searchValue = '';
      this.addCriterion(criterion);
      // The user selected a criterion so we remove the free text search value and add the criterion.
      this.allowedCriteriaCache = undefined;
      this.typeaheadInputChange.next('');
    }, 0);
  }

  protected validateCriterionLabel(criterion: InternalCriterionDefinition): boolean {
    if (!this.strictCriterionOrValue()) {
      return true;
    }
    return this.internalCriterionDefinitions.includes(criterion);
  }

  /**
   * Converts the internally used data model to the external model.
   * In case options for Criterion is Option[] map to the value from the label.
   */
  private convertToExternalModel(): SearchCriteria {
    const correctedCriteria: SearchCriteria = {
      value: this.searchValue,
      criteria: this.values.map(v => v.value)
    };
    if (this.disableFreeTextSearch()) {
      correctedCriteria.value = '';
    }
    return correctedCriteria;
  }

  private addCriterion(config: InternalCriterionDefinition, value?: string): void {
    if (config.multiSelect) {
      this.values = [...this.values, { value: { value: [], name: config.name }, config }];
    } else if (config.validationType === 'date' || config.validationType === 'date-time') {
      this.values = [
        ...this.values,
        {
          value: {
            dateValue: new Date(),
            value: getISODateString(new Date(), config.validationType, this.locale),
            name: config.name
          },
          config
        }
      ];
    } else {
      this.values = [...this.values, { value: { value: value ?? '', name: config.name }, config }];
    }

    this.autoEditCriteria = true;
    this.emitChangeEvent();
  }

  /**
   * Get criteria list to be shown in typeahead.
   * @param token - input field value.
   * @returns list of criteria to be shown in typeahead.
   */
  private getFilteredTypeaheadCriteria(token: string): InternalCriterionDefinition[] {
    if (this.maxCriteria() === undefined || this.values.length < this.maxCriteria()!) {
      const allowedCriteria = !this.exclusiveCriteria()
        ? this.internalCriterionDefinitions
        : differenceByName(this.internalCriterionDefinitions, this.values);

      if (allowedCriteria.length > 0 && !this.allowedCriteriaCache) {
        // Call interceptor to allow applications to customize the list of available criteria
        const available = allowedCriteria.map(c => c.name);
        // Ensure that all entries are allowed in case the consumer doesn't use the allow callback
        this.allowedCriteriaCache = available;
        this.interceptDisplayedCriteria.emit({
          criteria: available,
          searchCriteria: this.convertToExternalModel(),
          allow: criteriaNamesToDisplay => {
            if (criteriaNamesToDisplay) {
              this.allowedCriteriaCache = criteriaNamesToDisplay;
            }
          }
        });
      }

      return allowedCriteria.filter(c => this.allowedCriteriaCache?.includes(c.name));
    } else {
      return [];
    }
  }

  private getCriteriaToDisplayFromSubscription(
    result: CriterionDefinition[]
  ): InternalCriterionDefinition[] {
    this.lazyLoadedCriteria.set(result);
    this.internalCriterionDefinitions = this.loadedCriteria().map(c => toInternalCriteria(c));
    // It's necessary to update the criteria configuration since consuming applications may change the options.
    // A common case are criteria which depend on each other like Country, Site and Building. If the user change
    // the site the building options might become invalid.
    // KEEP THE REFERENCE, otherwise CD is broken
    this.values = this.values.map(v =>
      Object.assign(v, {
        value: v.value,
        config: this.internalCriterionDefinitions.find(ic => ic.name === v.config.name) ?? v.config
      })
    );

    if (this.maxCriteria() === undefined || this.values.length < this.maxCriteria()!) {
      return !this.exclusiveCriteria()
        ? this.internalCriterionDefinitions
        : differenceByName(this.internalCriterionDefinitions, this.values);
    }

    return [];
  }

  protected freeTextFocus(): void {
    // Ensure that the free text input is fully visible in the scroll container
    const scrollDirection = isRTL() ? -1 : 1;
    const position = scrollDirection * this.scrollContainer().nativeElement.scrollWidth;
    this.scrollContainer().nativeElement.scrollLeft = position;
    this.typeaheadInputChange.next(this.freeTextInputElement().nativeElement.value);
  }

  protected freeTextBackspace(event: Event): void {
    if (!(event.target as HTMLInputElement).value) {
      // edit last criterion if a user presses backspace in empty search input.
      const valueComponents = this.valueComponents();
      if (valueComponents.length) {
        valueComponents[valueComponents.length - 1].edit('value');
      }
    }
  }

  protected freeTextInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    const match = value.match(SiFilteredSearchComponent.criterionRegex);
    if (!this.disableSelectionByColonAndSemicolon() && !this.onlySelectValue() && match) {
      const criterionName = match[1];
      if (this.searchValue === '') {
        // The value was empty before, so we must make angular detect a change here.
        // Otherwise, the entire value which was pasted will remain in the input.
        // This happens if the user pasts something like: 'key:value'
        this.searchValue = value;
        this.cdRef.detectChanges();
      }
      this.searchValue = '';
      this.allowedCriteriaCache = undefined;

      const nameLowerCase = criterionName.toLocaleLowerCase();
      const criterion = this.internalCriterionDefinitions.find(
        ic => ic.translatedLabel.toLocaleLowerCase() === nameLowerCase
      ) ?? {
        name: criterionName,
        label: criterionName,
        translatedLabel: criterionName
      };

      this.typeaheadInputChange.next('');
      this.addCriterion(criterion, match[2]);
    } else {
      this.searchValue = value;

      if (!this.disableFreeTextSearch()) {
        this.emitChangeEvent();
      }

      this.typeaheadInputChange.next(value);
    }
  }

  protected valueChange(
    value: CriterionValue,
    criterion: { config: InternalCriterionDefinition; value: CriterionValue }
  ): void {
    criterion.value = value;
    this.emitChangeEvent();
  }

  protected focusNext(index: number, event: { freeText: string } | void): void {
    const next = this.valueComponents()[index + 1];
    if (next) {
      next.edit();
    } else {
      this.searchValue = event?.freeText ?? this.searchValue;
      this.freeTextInputElement().nativeElement.focus();
    }
  }

  private updateAndEmitSearchCriteria(): void {
    this.searchCriteria.set(this.convertToExternalModel());
    this.lastEmittedSearchCriteria = this.searchCriteria();
  }

  private emitChangeEvent(): void {
    this.updateAndEmitSearchCriteria();
    if (this.doSearchOnInputChange()) {
      this.searchEmitQueue.next(this.searchCriteria());
    }
  }
}
