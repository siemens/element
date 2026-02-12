import { Component } from '@angular/core';

@Component({
  selector: 'si-button-migration',
  template: `
    <!-- btn-xs without btn-circle should become btn-sm -->
    <button class="btn btn-sm">Extra Small</button>
    <button class="btn btn-primary btn-sm">Primary Extra Small</button>

    <!-- btn-circle with btn-xs should become btn-sm -->
    <button class="btn btn-circle btn-sm"><i class="icon-add"></i></button>

    <!-- btn-circle with btn-sm should have btn-sm removed -->
    <button class="btn btn-circle"><i class="icon-edit"></i></button>

    <!-- btn-circle without size should get btn-lg -->
    <button class="btn btn-circle btn-lg"><i class="icon-delete"></i></button>
    <button class="btn btn-circle btn-primary btn-lg"><i class="icon-save"></i></button>

    <!-- btn-circle with btn-lg should remain unchanged -->
    <button class="btn btn-circle btn-lg"><i class="icon-search"></i></button>

    <!-- Regular buttons without btn-xs should remain unchanged -->
    <button class="btn">Regular</button>
    <button class="btn btn-sm">Small</button>
    <button class="btn btn-lg">Large</button>

     <!-- Anchor buttons -->
  <a href="#" class="btn btn-sm">Link Button XS</a>
  <a href="#" class="btn btn-circle btn-lg" aria-label="Settings">
    <i class="icon-settings"></i>
  </a>
  `
})
export class ButtonMigrationComponent {}
