/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  SiApplicationHeaderComponent,
  SiHeaderBrandDirective
} from '@siemens/element-ng/application-header';
import { Filter, SiFilterBarComponent } from '@siemens/element-ng/filter-bar';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { SiSidePanelComponent, SiSidePanelContentComponent } from '@siemens/element-ng/side-panel';
import { LOG_EVENT } from '@siemens/live-preview';
import { elementFilter } from '@simpl/element-icons/ionic';

import { BackendService } from './backend.service';
import { FilterSidePanelComponent } from './components/filter-side-panel';
import { FilterModel } from './filter.model';

@Component({
  selector: 'app-sample',
  imports: [
    FilterSidePanelComponent,
    SiApplicationHeaderComponent,
    SiFilterBarComponent,
    SiHeaderBrandDirective,
    SiIconComponent,
    SiResponsiveContainerDirective,
    SiSearchBarComponent,
    SiSidePanelComponent,
    SiSidePanelContentComponent
  ],
  templateUrl: './advanced-filter-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  protected readonly logEvent = inject(LOG_EVENT);
  protected readonly service = inject(BackendService);
  protected readonly showFilters = signal(false);
  protected readonly icons = addIcons({ elementFilter });
  /** Synchronize filters between main view and side panel */
  protected readonly filters = computed<Filter[]>(() => {
    const model = this.service.filter();
    const filters: Filter[] = [];
    if (model.states.length) {
      filters.push({
        filterName: 'states',
        title: 'Status',
        description: this.filterText(
          'states',
          model.states.map(s => s.title)
        )
      });
    }
    if (model.versions.length) {
      filters.push({
        filterName: 'versions',
        title: 'Version',
        description: this.filterText('versions', model.versions)
      });
    }
    return filters;
  });

  protected toggleFilter(): void {
    this.showFilters.update(v => !v);
  }

  protected filterText(suffix: string, items: string[]): string {
    return items.length === 1 ? items[0] : `${items.length} ${suffix}`;
  }

  protected deleteFilter(filter: Filter[]): void {
    this.service.filter.update(model => {
      for (const key of Object.keys(model)) {
        const k = key as keyof FilterModel;
        if (!filter.find(f => f.filterName === key)) {
          if (Array.isArray(model[k])) {
            model[k] = [];
          }
        }
      }
      return { ...model };
    });
  }
}
