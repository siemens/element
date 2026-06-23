/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkPortalOutlet, DomPortal } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { elementLeft2 } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';

/**
 * Mobile flat-group shell.
 *
 * On mobile, opening a group renders its items as a flat list inside this
 * shell with a back button on top, instead of expanding inline.
 *
 * The shell owns the open/close state and renders the header (back button +
 * active group label). Items are projected via `<ng-content>` and stay
 * mounted across open/close so their state (focus, scroll, ...) is preserved.
 *
 * @experimental
 */
@Component({
  selector: 'si-navbar-flat-group',
  imports: [CdkPortalOutlet, SiIconComponent],
  template: `@let labelPortal = activeFlatLabelPortal();
    @if (labelPortal) {
      <div class="flat-group-header" animate.leave="flat-group-header-leave">
        <button
          type="button"
          class="btn btn-icon btn-tertiary-ghost"
          aria-label="Back"
          (click)="closeFlatGroup()"
        >
          <si-icon class="flip-rtl" [icon]="icons.elementLeft2" />
        </button>
        <span class="item-title text-truncate si-h5" [cdkPortalOutlet]="labelPortal"></span>
      </div>
    }
    <ng-content />`,
  styleUrl: './si-navbar-flat-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiNavbarFlatGroupComponent {
  protected readonly icons = addIcons({ elementLeft2 });

  /**
   * Whether the navbar is in flat-group mode (mobile + expanded).
   * When `false`, any open group is closed automatically.
   *
   * @defaultValue false
   */
  readonly flatMode = input(false);

  /**
   * @internal
   * Id of the group currently shown as a flat group, or `undefined` if none.
   */
  readonly openFlatGroupId = signal<string | undefined>(undefined);

  /**
   * @internal
   * Label of the active trigger item, rendered inside the header chip.
   * The active item pushes its portal here when its group opens.
   */
  readonly activeFlatLabelPortal = signal<DomPortal | undefined>(undefined);

  /** @internal `true` while a flat group is open. */
  readonly flatGroupOpen = computed(() => !!this.activeFlatLabelPortal());

  constructor() {
    // Auto-close when leaving flat mode (e.g. resize to desktop, drawer collapse).
    effect(() => {
      if (!this.flatMode()) {
        this.closeFlatGroup();
      }
    });
  }

  /** @internal Closes the open flat group. Used by the back button. */
  closeFlatGroup(): void {
    this.openFlatGroupId.set(undefined);
    this.activeFlatLabelPortal.set(undefined);
  }
}
