/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  OnChanges,
  OnDestroy,
  signal,
  SimpleChanges,
  TemplateRef,
  viewChild
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SiAvatarBackgroundColorDirective } from '@siemens/element-ng/avatar';
import {
  addIcons,
  elementCancel,
  elementCircleFilled,
  elementStateExclamationMark,
  SiIconComponent,
  SiIconNextComponent
} from '@siemens/element-ng/icon';
import { ModalRef, SiModalService } from '@siemens/element-ng/modal';
import { SiTranslateModule, TranslatableString } from '@siemens/element-translate-ng/translate';
import { CropperPosition, ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';

import { SiImageCropperStyleComponent } from './si-image-cropper-style.component';

/**
 * A component used to upload, edit, and delete a user's photo. The user can upload
 * a photo either via file browser or a URL to the photo. You can set the source
 * photo with the `sourcePhoto` Data URL input or the `sourcePhotoUrl` URL input.
 * If you already have a cropped image you can set it with the `croppedPhoto` input.
 * Cropping changes are emitted via the `croppedPhotoChange` output.
 */
@Component({
  selector: 'si-photo-upload',
  styleUrl: './si-photo-upload.component.scss',
  templateUrl: './si-photo-upload.component.html',
  imports: [
    NgTemplateOutlet,
    ImageCropperComponent,
    SiIconComponent,
    SiIconNextComponent,
    SiImageCropperStyleComponent,
    SiTranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: SiAvatarBackgroundColorDirective,
      inputs: ['color', 'autoColor']
    }
  ]
})
export class SiPhotoUploadComponent implements OnChanges, OnDestroy {
  private static idCounter = 0;

  /**
   * Indicate that changing or uploads are disabled.
   *
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });

  /**
   * Optionally disable image cropping.
   *
   * @defaultValue false
   */
  readonly disabledCropping = input(false, { transform: booleanAttribute });

  /**
   * Accepted image formats for the file selection dialog.
   *
   * @defaultValue '.png, .jpg, .jpeg'
   *
   * @see
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#attr-accept
   */
  readonly acceptedUploadFormats = input('.png, .jpg, .jpeg');

  /**
   * Maximum allowed file size of the uploaded file in kilobytes.
   *
   * @defaultValue 2048
   */
  readonly maxFileSize = input(2048);

  /**
   * If the uploaded file is of an unsupported type, this
   * error message will be displayed to the user.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_PHOTO_UPLOAD.ERROR_FILE_TYPE:The image file is not valid. Please upload a PNG or JP(E)G.`
   * ```
   */
  readonly uploadErrorWrongType = input(
    $localize`:@@SI_PHOTO_UPLOAD.ERROR_FILE_TYPE:The image file is not valid. Please upload a PNG or JP(E)G.`
  );

  /**
   * If the uploaded file exceeds the allowed upload size, this
   * error message will be displayed to the user.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_PHOTO_UPLOAD.ERROR_FILE_SIZE_EXCEEDED:The actual file size {{mb}} MB exceeds the {{maxSizeMb}} MB limit.`
   * ```
   */
  readonly uploadErrorTooBig = input(
    $localize`:@@SI_PHOTO_UPLOAD.ERROR_FILE_SIZE_EXCEEDED:The actual file size {{mb}} MB exceeds the {{maxSizeMb}} MB limit.`
  );

  /**
   * Alternative text for the photo.
   *
   * @defaultValue ''
   */
  readonly photoAltText = input<TranslatableString>('');

  /**
   * Alternative text for the photo´s placeholder.
   * The value will be used to calculate the background color when `autoColor` is true.
   *
   * @defaultValue ''
   */
  readonly placeholderAltText = input<TranslatableString>('');

  /**
   * Text for the button changing the photo.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_PHOTO_UPLOAD.CHANGE_PHOTO:Change`
   * ```
   */
  readonly changePhotoText = input($localize`:@@SI_PHOTO_UPLOAD.CHANGE_PHOTO:Change`);

  /**
   * Cropper frame aria label.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_PHOTO_UPLOAD.CROPPER_FRAME_LABEL:Crop photo`
   * ```
   */
  readonly cropperFrameAriaLabel = input(
    $localize`:@@SI_PHOTO_UPLOAD.CROPPER_FRAME_LABEL:Crop photo`
  );

  /**
   * Text for the button uploading a photo.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_PHOTO_UPLOAD.UPLOAD_PHOTO:Upload photo`
   * ```
   */
  readonly uploadPhotoText = input($localize`:@@SI_PHOTO_UPLOAD.UPLOAD_PHOTO:Upload photo`);

  /**
   * Text for the button removing the photo.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_PHOTO_UPLOAD.REMOVE:Remove`
   * ```
   */
  readonly removePhotoText = input($localize`:@@SI_PHOTO_UPLOAD.REMOVE:Remove`);

  /**
   * Text for the button cancelling the editing process.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_PHOTO_UPLOAD.CANCEL:Cancel`
   * ```
   */
  readonly cancelEditText = input($localize`:@@SI_PHOTO_UPLOAD.CANCEL:Cancel`);

  /**
   * Text for the button applying the edited photo.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_PHOTO_UPLOAD.APPLY_PHOTO:Apply`
   * ```
   */
  readonly applyEditText = input($localize`:@@SI_PHOTO_UPLOAD.APPLY_PHOTO:Apply`);

  /**
   * Text displayed as header of the editing modal.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_PHOTO_UPLOAD.MODAL_TITLE:Avatar photo`
   * ```
   */
  readonly modalHeader = input($localize`:@@SI_PHOTO_UPLOAD.MODAL_TITLE:Avatar photo`);

  /**
   * Text displayed as description of the editing modal.
   */
  readonly modalDescription = input<TranslatableString>();

  /**
   * Output format of the edited image.
   *
   * @defaultValue 'jpeg'
   */
  readonly cropperImageFormat = input<'png' | 'jpeg'>('jpeg');

  /**
   * The width / height ratio (e.g. 1 / 1 for a square, 4 / 3, 16 / 9 ...).
   *
   * @defaultValue 1
   */
  readonly cropperAspectRatio = input(1);

  /**
   * Whether to keep the width and height of the cropped image equal according
   * to the aspectRatio.
   *
   * @defaultValue true
   */
  readonly cropperMaintainAspectRatio = input(true, { transform: booleanAttribute });

  /**
   * When set to true, padding will be added around the image to make it fit to
   * the aspect ratio. Be aware that this transformation will cause the loaded
   * image to be a png file with an increased base64 string payload.
   *
   * @defaultValue false
   */
  readonly cropperContainWithinAspectRatio = input(false, { transform: booleanAttribute });

  /**
   * The cropper´s width cannot be made smaller than this number of pixels
   * (relative to original image´s size). (0 = disabled).
   *
   * @defaultValue 50
   */
  readonly cropperMinWidth = input(50);

  /**
   * The cropper´s height cannot be made smaller than this number of pixels
   * (relative to original image´s size). Will be ignored if
   * `cropperMaintainAspectRatio` is set. (0 = disabled).
   *
   * @defaultValue 50
   */
  readonly cropperMinHeight = input(50);

  /**
   * The cropper´s width cannot be made bigger than this number of pixels.
   * Default is 0 (disabled).
   *
   * @defaultValue 0
   */
  readonly cropperMaxWidth = input(0);

  /**
   * The cropper´s height cannot be made bigger than this number of pixels.
   * Default is 0 (disabled).
   *
   * @defaultValue 0
   */
  readonly cropperMaxHeight = input(0);

  /**
   * Set this to true for a round cropper. Resulting image will still
   * be square, but visually clipped with a border-radius: 50% on the
   * resulting image to show it as round.
   *
   * @defaultValue true
   */
  readonly roundImage = input(true, { transform: booleanAttribute });

  /**
   * The input photo to be used for cropping. A string in [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs) format
   * with base64 encoding.
   */
  readonly sourcePhoto = model<string>();

  /**
   * URL to a photo to be used for cropping.
   */
  readonly sourcePhotoUrl = input<string>();

  /**
   * The photo to be displayed and edited (when not readonly).
   */
  readonly croppedPhoto = model<string>();

  protected readonly editPhotoTemplate = viewChild.required<TemplateRef<any>>('editPhotoTemplate');
  protected readonly fileInput = viewChild.required<ElementRef<any>>('fileInput');
  protected readonly imageCropper = viewChild<ImageCropperComponent>('imageCropper');

  // used to label the dialog
  protected readonly titleId = `__si-photo-upload-${SiPhotoUploadComponent.idCounter++}`;

  /**
   * The trusted photo url string which is used to display the photo.
   */
  protected readonly sanitizedPhotoUrl = signal<SafeResourceUrl | undefined>(undefined);

  /**
   * The appropriate error message displayed to the user. Might be
   * `uploadErrorWrongType` or `uploadErrorTooBig`.
   */
  protected readonly uploadErrorMessage = signal<string | undefined>(undefined);
  protected readonly editButtonText = computed(() =>
    this.sanitizedPhotoUrl() ? this.changePhotoText() : this.uploadPhotoText()
  );
  protected readonly currentFileSizeKilobytes = signal(-1);
  protected readonly currentFileSizeMegabytes = signal(-1);
  protected readonly maxSizeMb = computed(() => this.maxFileSize() / 1024);

  /**
   * The photo instance to be used in the image cropper. We need a different
   * reference than `sourcePhoto` to support the cancel after uploading
   * a new photo. While `sourcePhoto` is A and image cropper uploads B,
   * we should not replace `sourcePhoto` A until user presses apply.
   */
  protected readonly imageCropperPhoto = signal<string | undefined>(undefined);

  protected readonly icons = addIcons({
    elementCancel,
    elementCircleFilled,
    elementStateExclamationMark
  });
  /**
   * Reference to the modal displaying the photo to edit.
   */
  protected modalRef?: ModalRef;
  /**
   * The last cropped event of the image cropper component.
   * Will be set on every mouse drag of the user. It contains
   * the cropped image and the position. When user completes
   * the cropping, the data from the last event is used.
   */
  private imageCroppedEvent?: ImageCroppedEvent;
  /**
   * Applied cropper position necessary to restore the cropper position when the use press the Change button.
   */
  private cropperPosition?: CropperPosition;

  private readonly sanitizer = inject(DomSanitizer);
  private readonly modalService = inject(SiModalService);
  private readonly autoBackgroundColorDirective = inject(SiAvatarBackgroundColorDirective);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.readonly) {
      this.resetErrorMessage();
      this.resetFileInputValue();
    }

    if (changes.sourcePhotoUrl) {
      this.setPhoto(this.sourcePhotoUrl());
      this.cropperPosition = undefined;
      this.croppedPhoto.set(undefined);
    }
    if (changes.sourcePhoto && changes.sourcePhoto.currentValue !== this.imageCropperPhoto()) {
      const sourcePhoto = this.sourcePhoto();
      this.setPhoto(sourcePhoto);
      this.cropperPosition = undefined;
      this.croppedPhoto.set(undefined);
      this.imageCropperPhoto.set(sourcePhoto);
    }
    if (
      changes.croppedPhoto &&
      changes.croppedPhoto.previousValue?.length > 0 &&
      changes.croppedPhoto.previousValue !== changes.croppedPhoto.currentValue
    ) {
      this.setPhoto(this.croppedPhoto());
    }
    if (changes.placeholderAltText) {
      this.autoBackgroundColorDirective.calculateColorFromInitials(this.placeholderAltText());
    }
  }

  ngOnDestroy(): void {
    this.modalRef?.detach();
  }

  /**
   * Opens a modal dialog with the cropping component.
   */
  protected showCroppingDialog(): void {
    if (this.modalRef) {
      return;
    }
    if (this.disabledCropping()) {
      this.sourcePhoto.set(this.imageCropperPhoto());
      const sourcePhoto = this.sourcePhoto();
      this.updateCroppedPhoto(sourcePhoto ?? '');
      return;
    }
    this.modalRef = this.modalService.show(
      this.editPhotoTemplate(),
      {
        ignoreBackdropClick: false,
        keyboard: true,
        class: 'modal-dialog-centered',
        ariaLabelledBy: this.titleId
      },
      'cancel'
    );
    this.resetErrorMessage();
    this.modalRef.hidden.subscribe(() => {
      this.resetErrorMessage();
      this.resetFileInputValue();
      this.modalRef = undefined;
    });
  }

  protected fileUpload(event: Event): void {
    // Initially reset a possible error message
    this.resetErrorMessage();
    const files = (event.target as HTMLInputElement).files;
    const file = files && files.length > 0 ? files[0] : undefined;
    if (!file) {
      return;
    }
    const fileType = file.type;
    const allowedFileTypes = this.acceptedUploadFormats()
      .split(',')
      .map(type => type.trim().replace('.', 'image/'));
    const fileTypeWrong = !allowedFileTypes.includes(fileType);
    if (fileTypeWrong) {
      this.uploadErrorMessage.set(this.uploadErrorWrongType());
      return;
    }
    const sizeInKb = file.size / 1024;
    this.currentFileSizeKilobytes.set(Math.round(sizeInKb * 10) / 10);
    this.currentFileSizeMegabytes.set(Math.round((sizeInKb / 1024) * 1000) / 1000);
    const fileSizeTooBig = sizeInKb > this.maxFileSize();
    if (fileSizeTooBig) {
      this.uploadErrorMessage.set(this.uploadErrorTooBig());
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
      if (typeof reader.result === 'string') {
        this.cropperPosition = undefined;
        this.imageCropperPhoto.set(reader.result);

        // Bring up the editing modal if not already present
        this.showCroppingDialog();
      }
    });
    reader.readAsDataURL(file);
  }

  private updateCroppedPhoto(croppedPhoto: string, position?: CropperPosition): void {
    this.croppedPhoto.set(croppedPhoto);
    this.setPhoto(this.croppedPhoto());
    this.cropperPosition = position;
  }

  protected removePhoto(): void {
    // We emit undefined to notify consumers that the cropped
    // images is removed. This is a kind of special crop event.
    this.croppedPhoto.set(undefined);
    this.imageCropperPhoto.set(undefined);
    this.setPhoto(undefined);
    this.cropperPosition = undefined;
    this.resetFileInputValue();
    this.sourcePhoto.set(undefined);
  }

  /**
   * Invoked when user cropped the photo and pressed apply button.
   * Updates the current photo by the selected cropped photo and
   * closes the modal dialog.
   */
  protected imageCropperApplied(): void {
    if (this.imageCroppedEvent) {
      this.sourcePhoto.set(this.imageCropperPhoto());
      this.updateCroppedPhoto(
        this.imageCroppedEvent.base64!.toString(),
        this.imageCroppedEvent.cropperPosition
      );
    }
    this.modalRef?.hide();
  }

  protected imageCropperCanceled(): void {
    this.imageCropperPhoto.set(this.sourcePhoto());
    this.modalRef?.hide('cancel');
  }

  /**
   * Callback from the image cropper on every mouse drag invoking a cropping.
   *
   * @param event - Event containing the cropped image and the image cropped position.
   *
   */
  protected cropperImageCropped(event: ImageCroppedEvent): void {
    this.imageCroppedEvent = event;
  }

  /**
   * Lifecycle hook from the image cropper component. Informs
   * us when initialized and ready.
   */
  protected cropperReady(): void {
    // When the user opens cropper dialog multiple times we need to
    // apply existing cropper position.
    const imageCropper = this.imageCropper();
    if (this.cropperPosition && imageCropper) {
      imageCropper.cropper = { ...this.cropperPosition };
      imageCropper.crop();
    }
  }

  private resetFileInputValue(): void {
    if (this.fileInput()) {
      // Remove fileInput value to allow for selecting the same
      // file for being uploaded again.
      this.fileInput().nativeElement.value = null;
    }
  }

  private resetErrorMessage(): void {
    this.uploadErrorMessage.set(undefined);
  }

  private setPhoto(photo?: string): void {
    this.resetErrorMessage();
    this.sanitizedPhotoUrl.set(
      photo ? this.sanitizer.bypassSecurityTrustResourceUrl(photo) : undefined
    );
  }
}
