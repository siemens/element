/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import {
  addIcons,
  SiIconNextComponent,
  elementLeft3,
  elementRight3
} from '@siemens/element-ng/icon';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-pagination',
  imports: [SiIconNextComponent, SiTranslateModule],
  templateUrl: './si-pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiPaginationComponent {
  private static maxItems = 7;

  /**
   * The total number of pages.
   * Alternatively use `itemsPerPage` and `totalItems`
   */
  readonly totalPages = input<number>();
  /**
   * The current active page, counting starts from 1
   *
   * @defaultValue 1
   */
  readonly currentPage = model<number>(1);
  /**
   * The number of items per page.
   * Used to calculate the total number of page if `totalPages` is not available
   */
  readonly pageSize = input<number>();
  /**
   * The total number of items.
   * Used to calculate the total number of page if `totalPages` is not available
   */
  readonly totalRowCount = input<number>();

  /**
   * The text of the back button for pagination. Required for a11y.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_PAGINATION.BACK:Back`
   * ```
   */
  readonly backButtonText = input($localize`:@@SI_PAGINATION.BACK:Back`);

  /**
   * The text of the forward button for pagination. Required for a11y.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_PAGINATION.FORWARD:Forward`
   * ```
   */
  readonly forwardButtonText = input($localize`:@@SI_PAGINATION.FORWARD:Forward`);
  /**
   * When multiple paginations are used on the same page each pagination needs a distinct aria label.
   * Required for a11y.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_PAGINATION.NAV_LABEL:Pagination`
   * ```
   */
  readonly navAriaLabel = input($localize`:@@SI_PAGINATION.NAV_LABEL:Pagination`);

  private readonly calculatedTotalPages = computed(
    () => this.totalPages() ?? Math.ceil((this.totalRowCount() ?? 0) / (this.pageSize() ?? 1))
  );

  protected readonly prevDisabled = computed(() => this.currentPage() === 1);

  protected readonly nextDisabled = computed(
    () => this.currentPage() === this.calculatedTotalPages()
  );

  protected readonly pageButtons = computed(() => {
    const pageButtons: { page: number; sep: boolean }[] = [];
    const totalPages = this.calculatedTotalPages();
    const currentPage = this.currentPage();

    if (totalPages <= SiPaginationComponent.maxItems) {
      for (let i = 0; i < totalPages; i++) {
        pageButtons.push({ page: i + 1, sep: false });
      }
    } else if (currentPage < SiPaginationComponent.maxItems - 2) {
      // separator only on the right (in LTR)
      for (let i = 0; i < SiPaginationComponent.maxItems - 2; i++) {
        pageButtons.push({ page: i + 1, sep: false });
      }
      pageButtons.push({ page: 0, sep: true });
      pageButtons.push({ page: totalPages, sep: false });
    } else if (currentPage >= totalPages - 3) {
      // separator only on the left (in LTR)
      pageButtons.push({ page: 1, sep: false });
      pageButtons.push({ page: 0, sep: true });
      for (let i = totalPages - SiPaginationComponent.maxItems + 2; i < totalPages; i++) {
        pageButtons.push({ page: i + 1, sep: false });
      }
    } else {
      // separator on both sides
      pageButtons.push({ page: 1, sep: false });
      pageButtons.push({ page: 0, sep: true });
      for (let i = -1; i <= 1; i++) {
        pageButtons.push({ page: currentPage + i, sep: false });
      }
      pageButtons.push({ page: 0, sep: true });
      pageButtons.push({ page: totalPages, sep: false });
    }

    return pageButtons;
  });

  protected readonly icons = addIcons({ elementLeft3, elementRight3 });

  protected direction(event: Event, delta: number): void {
    this.setPage(event, this.currentPage() + delta);
  }

  protected setPage(event: Event, page: number): void {
    (event.currentTarget as HTMLElement).blur();
    this.currentPage.set(page);
  }
}
