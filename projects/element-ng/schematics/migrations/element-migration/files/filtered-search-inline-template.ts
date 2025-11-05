import { Component } from '@angular/core';
import { SiFilteredSearchModule } from '@siemens/element-ng/filtered-search'

@Component({
  selector: 'app-sample',
  template:`<si-filtered-search [noMatchingCriteriaText]="'No results found'" [showIcon]="false" />`,
   imports: [SiFilteredSearchModule],
  standalone: true
})
export class SampleComponent {}
