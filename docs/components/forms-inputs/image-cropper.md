# Image cropper

Element provide styling for the [ngx-image-cropper](https://github.com/Mawi137/ngx-image-cropper) component, enabling users to select and adjust a specific region of an image.

## Usage ---

The image cropper allows users to define a specific area within an uploaded image by dragging and resizing a selection frame. This is particularly useful when users need to focus on a particular portion of an image, such as creating profile pictures or selecting regions of interest.

The cropper supports both square and circular selection masks, maintains aspect ratios, and provides visual feedback through the Element design system.

### When to use

- In profile settings where users upload and crop avatar images.
- When creating thumbnails from larger images.
- When users need to extract a specific region from an uploaded photo or document.
- In applications requiring standardized image dimensions while allowing user control over the cropped area.

### Best practices

- Provide clear visual boundaries for the cropping area to help users understand what will be selected.
- Use circular masks for profile pictures and avatars to match common design patterns.
- Use square or custom aspect ratio masks for content images, thumbnails, or specific layout requirements.
- Consider setting minimum dimensions to ensure cropped images meet quality requirements.
- Provide clear action buttons (apply/cancel) to confirm or discard cropping changes.
- Display the original image dimensions and cropped dimensions when relevant to the use case.

## Design ---

### Elements

The image cropper consists of several key components that work together:

- **Image preview**: Displays the full uploaded image as the base layer.
- **Crop frame**: A resizable and draggable frame that defines the selection area.
- **Overlay**: A semi-transparent layer outside the crop frame that dims unselected portions.
- **Handles**: Corner and edge handles for resizing the crop frame.
- **Move area**: The interior of the crop frame that allows repositioning.

### Crop shapes

The cropper supports different mask shapes depending on the use case:

- **Square/Rectangle**: Used for general content, thumbnails, or when specific aspect ratios are required.
- **Circle**: Commonly used for profile pictures and avatars, providing a rounded appearance.

### Interaction

Users interact with the cropper through:

- **Dragging the frame**: Moves the selection area across the image.
- **Resizing via handles**: Adjusts the dimensions of the cropped region.
- **Zoom controls** (when enabled): Scales the image to fine-tune the selection.

## Code ---

### Usage

The `SiImageCropperStyleComponent` is a styling wrapper that applies Element theme styles to the open source [ngx-image-cropper](https://github.com/Mawi137/ngx-image-cropper) component. This wrapper ensures the cropper integrates seamlessly with Element's design system, including proper colors, spacing, and interaction states.

To use the image cropper in your application, you need to install the ngx-image-cropper package and wrap the `<image-cropper>` component with `<si-image-cropper-style>`.

??? info "Required Packages"
    - [ngx-image-cropper](https://www.npmjs.com/package/ngx-image-cropper)
    The currently supported dependency versions can be found in the [package.json of the demo app](https://github.com/siemens/element/blob/main/package.json).

Import both the `SiImageCropperStyleComponent` from Element and the `ImageCropperComponent` from ngx-image-cropper:

```ts
import { Component } from '@angular/core';
import { SiImageCropperStyleComponent } from '@siemens/element-ng/photo-upload';
import { ImageCropperComponent } from 'ngx-image-cropper';

@Component({
  selector: 'app-sample',
  template: `
    <si-image-cropper-style>
      <image-cropper
        [imageBase64]="imageSource"
        [maintainAspectRatio]="true"
        [aspectRatio]="1"
        format="png"
        (imageCropped)="onImageCropped($event)"
      />
    </si-image-cropper-style>
  `,
  standalone: true,
  imports: [ImageCropperComponent, SiImageCropperStyleComponent]
})
export class SampleComponent {
  imageSource = '';
  
  onImageCropped(event: any) {
    // Handle cropped image
  }
}
```
