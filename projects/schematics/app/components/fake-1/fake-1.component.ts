import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SiButtonComponent } from '@simpl/element-ng/button';
import { SiInputDirective } from '@simpl/element-ng/input';
import { SiSliderComponent } from '@simpl/element-ng/slider';

@Component({
  selector: 'app-fake-1',
  standalone: true,
  imports: [CommonModule, FormsModule, SiButtonComponent, SiInputDirective, SiSliderComponent],
  template: `
    <div class="fake-component">
      <h2>Fake Component 1</h2>
      <si-input placeholder="Enter text here"></si-input>
      <si-slider [min]="0" [max]="100" [value]="50"></si-slider>
      <si-button>Click me</si-button>
    </div>
  `,
  styleUrls: ['./fake-1.component.scss']
})
export class Fake1Component {
  value = 50;
}
