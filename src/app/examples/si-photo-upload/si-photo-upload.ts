/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentActionBarMainItem } from '@spike-rabbit/element-ng/content-action-bar';
import { SiDashboardCardComponent } from '@spike-rabbit/element-ng/dashboard';
import { SiPhotoUploadComponent } from '@spike-rabbit/element-ng/photo-upload';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiDashboardCardComponent, SiPhotoUploadComponent, FormsModule],
  templateUrl: './si-photo-upload.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  readonly basePhoto = signal<string>('');
  readonly baseCroppedPhoto = signal<string>('');
  readonly sourcePhoto = signal<string>('');
  readonly sourcePhotoUrl = signal<string>('');
  readonly croppedPhoto = signal<string>('');
  roundedMask = true;
  disabledCropping = false;
  readonly = true;
  readOnlyActions: ContentActionBarMainItem[] = [
    { type: 'action', label: 'Edit', action: () => this.edit() }
  ];
  editActions: ContentActionBarMainItem[] = [
    { type: 'action', label: 'Save', action: () => this.save() },
    { type: 'action', label: 'Cancel', action: () => this.cancel() }
  ];
  actions = this.readOnlyActions;

  protected edit(): void {
    this.readonly = false;
    this.actions = this.editActions;
  }

  protected save(): void {
    this.readonly = true;
    this.actions = this.readOnlyActions;
    this.basePhoto.set(this.sourcePhoto());
    this.baseCroppedPhoto.set(this.croppedPhoto());
  }

  protected cancel(): void {
    this.readonly = true;
    this.actions = this.readOnlyActions;
    this.sourcePhoto.set(this.basePhoto());
    this.croppedPhoto.set(this.baseCroppedPhoto());
  }

  protected sourcePhotoChanged(photo?: string): void {
    this.logEvent('sourcePhotoChanged', photo ? photo.slice(0, 50) + '...' : photo);
    if (photo !== this.sourcePhoto()) {
      this.sourcePhoto.set(photo ?? '');
    }
  }

  protected sourcePhotoUrlChanged(url?: string): void {
    this.logEvent('sourcePhotoUrlChanged', url);
    if (url !== this.sourcePhotoUrl()) {
      this.sourcePhotoUrl.set(url ?? '');
    }
  }

  protected croppedPhotoChanged(croppedPhoto?: string): void {
    this.logEvent(
      'croppedPhotoChanged',
      croppedPhoto ? croppedPhoto.slice(0, 50) + '...' : croppedPhoto
    );
    if (croppedPhoto !== this.croppedPhoto()) {
      this.croppedPhoto.set(croppedPhoto ?? '');
    }
  }
}
