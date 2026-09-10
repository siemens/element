/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  afterRenderEffect,
  Component,
  ElementRef,
  signal,
  viewChild,
  viewChildren
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  SiApplicationHeaderComponent,
  SiHeaderActionItemComponent,
  SiHeaderActionsDirective,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective
} from '@siemens/element-ng/application-header';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { SiNumberInputComponent } from '@siemens/element-ng/number-input';
import {
  SiSidePanelBackButtonComponent,
  SiSidePanelComponent,
  SiSidePanelContentComponent
} from '@siemens/element-ng/side-panel';

interface NavigationItem {
  id: string;
  title: string;
  detailTitle: string;
}

@Component({
  selector: 'app-sample',
  imports: [
    RouterLink,
    SiApplicationHeaderComponent,
    SiHeaderActionItemComponent,
    SiHeaderActionsDirective,
    SiHeaderBrandDirective,
    SiHeaderLogoDirective,
    SiFormItemComponent,
    SiSidePanelBackButtonComponent,
    SiSidePanelComponent,
    SiNumberInputComponent,
    SiSidePanelContentComponent
  ],
  templateUrl: './si-side-panel-inner-navigation.html'
})
export class SampleComponent {
  readonly collapsed = signal(true);
  readonly selectedItem = signal<NavigationItem | undefined>(undefined);
  readonly navigationItems: NavigationItem[] = [
    {
      id: 'title-link-item-1',
      title: 'Title link item 1',
      detailTitle: 'Content detail 1'
    },
    {
      id: 'title-link-item-2',
      title: 'Title link item 2',
      detailTitle: 'Content detail 2'
    },
    {
      id: 'title-link-item-3',
      title: 'Title link item 3',
      detailTitle: 'Content detail 3'
    },
    {
      id: 'title-link-item-4',
      title: 'Title link item 4',
      detailTitle: 'Content detail 4'
    },
    {
      id: 'title-link-item-5',
      title: 'Title link item 5',
      detailTitle: 'Content detail 5'
    }
  ];

  private readonly backButton = viewChild('backButton', {
    read: ElementRef<HTMLButtonElement>
  });
  private readonly navigationButtons =
    viewChildren<ElementRef<HTMLButtonElement>>('navigationButton');
  private originIndex?: number;

  constructor() {
    afterRenderEffect(() => {
      if (this.selectedItem()) {
        this.backButton()?.nativeElement.focus();
      } else if (this.originIndex !== undefined) {
        this.navigationButtons()[this.originIndex]?.nativeElement.focus();
      }
    });
  }

  showDetails(item: NavigationItem, index: number): void {
    this.originIndex = index;
    this.selectedItem.set(item);
  }

  showNavigation(): void {
    this.selectedItem.set(undefined);
  }
}
