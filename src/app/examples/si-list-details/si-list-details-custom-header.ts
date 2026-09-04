/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild
} from '@angular/core';
import { elementBack, elementDelete, elementEdit } from '@siemens/element-icons';
import { SiAvatarComponent } from '@siemens/element-ng/avatar';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import {
  SiDetailsPaneBodyComponent,
  SiDetailsPaneComponent,
  SiListDetailsComponent,
  SiListPaneBodyComponent,
  SiListPaneComponent,
  SiListPaneHeaderComponent
} from '@siemens/element-ng/list-details';
import { SiMenuBarDirective, SiMenuItemComponent } from '@siemens/element-ng/menu';
import { BOOTSTRAP_BREAKPOINTS } from '@siemens/element-ng/resize-observer';
import { SiTabComponent, SiTabPortalComponent, SiTabsetComponent } from '@siemens/element-ng/tabs';
import { LOG_EVENT } from '@siemens/live-preview';

type User = {
  id: number;
  name: string;
  initials: string;
  description: string;
  role: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  country: string;
};

@Component({
  selector: 'app-sample',
  imports: [
    SiListDetailsComponent,
    SiListPaneComponent,
    SiListPaneHeaderComponent,
    SiListPaneBodyComponent,
    SiDetailsPaneComponent,
    SiDetailsPaneBodyComponent,
    SiAvatarComponent,
    SiIconComponent,
    SiMenuBarDirective,
    SiMenuItemComponent,
    SiTabsetComponent,
    SiTabComponent,
    SiTabPortalComponent
  ],
  templateUrl: './si-list-details-custom-header.html',
  host: {
    class: 'si-layout-fixed-height'
  }
})
export class SampleComponent {
  readonly logEvent = inject(LOG_EVENT);
  readonly icons = addIcons({ elementBack, elementDelete, elementEdit });
  readonly expandBreakpoint = BOOTSTRAP_BREAKPOINTS.mdMinimum;
  readonly detailsActive = signal(false);
  readonly users: User[] = [
    {
      id: 1,
      name: 'Jane Smith',
      initials: 'JS',
      description: 'Automation engineer focused on industrial connectivity.',
      role: 'Automation Engineer',
      email: 'jane.smith@example.org',
      phone: '+41 44 123 45 67',
      street: 'Industriestrasse 10',
      city: 'Zug 6300',
      country: 'Switzerland'
    },
    {
      id: 2,
      name: 'John Doe',
      initials: 'JD',
      description: 'Product designer creating clear and accessible experiences.',
      role: 'Product Designer',
      email: 'john.doe@example.org',
      phone: '+49 89 123 45 67',
      street: 'Example Street 24',
      city: 'Munich 80331',
      country: 'Germany'
    },
    {
      id: 3,
      name: 'Alex Johnson',
      initials: 'AJ',
      description: 'Platform architect helping teams build reliable software.',
      role: 'Platform Architect',
      email: 'alex.johnson@example.org',
      phone: '+44 20 1234 5678',
      street: 'Innovation Road 8',
      city: 'London SW1A 1AA',
      country: 'United Kingdom'
    }
  ];
  readonly selectedUser = signal<User>(this.users[0]);

  private readonly injector = inject(Injector);
  private readonly listDetails = viewChild(SiListDetailsComponent);
  private readonly backButton = viewChild<ElementRef<HTMLButtonElement>>('backButton');

  readonly showBackButton = computed(() => this.listDetails()?.hasLargeSize() === false);

  selectUser(user: User): void {
    this.selectedUser.set(user);
    this.detailsActive.set(true);

    if (this.showBackButton()) {
      afterNextRender(
        () => {
          this.backButton()?.nativeElement.focus();
        },
        { injector: this.injector }
      );
    }
  }

  backToList(): void {
    this.detailsActive.set(false);
  }

  editUser(): void {
    this.logEvent(`Edit ${this.selectedUser().name}`);
  }

  deleteUser(): void {
    this.logEvent(`Delete ${this.selectedUser().name}`);
  }
}
