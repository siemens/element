import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SiSliderComponent } from "@simpl/element-ng/slider";
import { SiDateInputDirective, SiDatepickerComponent } from '@simpl/element-ng/datepicker';

@Component({
  selector: "app-main",
  imports: [FormsModule, SiSliderComponent, SiDateInputDirective, SiDatepickerComponent],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {}
