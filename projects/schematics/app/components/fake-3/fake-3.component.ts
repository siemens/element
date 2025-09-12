import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SiTextareaComponent } from '@simpl/element-ng/textarea';
import { SiToggleComponent } from '@simpl/element-ng/toggle';
import { SiButtonComponent } from '@simpl/element-ng/button';
import { SiInputDirective } from '@simpl/element-ng/input';

@Component({
  selector: 'app-fake-3',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SiTextareaComponent,
    SiToggleComponent,
    SiButtonComponent,
    SiInputDirective
  ],
  template: `
    <div class="fake-component">
      <h2>Fake Component 3</h2>
      <div class="form-group">
        <label>Name:</label>
        <input siInput [(ngModel)]="formData.name" placeholder="Enter your name" />
      </div>

      <div class="form-group">
        <label>Description:</label>
        <si-textarea
          [(ngModel)]="formData.description"
          placeholder="Enter description"
          rows="4">
        </si-textarea>
      </div>

      <div class="form-group">
        <si-toggle
          [(ngModel)]="formData.isEnabled"
          label="Enable notifications">
        </si-toggle>
      </div>

      <div class="form-actions">
        <si-button type="primary" (click)="onSave()">Save</si-button>
        <si-button type="secondary" (click)="onCancel()">Cancel</si-button>
      </div>
    </div>
  `,
  styleUrls: ['./fake-3.component.scss']
})
export class Fake3Component {
  formData = {
    name: '',
    description: '',
    isEnabled: false
  };

  onSave() {
    console.log('Saving form data:', this.formData);
  }

  onCancel() {
    this.formData = {
      name: '',
      description: '',
      isEnabled: false
    };
  }
}
