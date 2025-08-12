import { DatePipe, formatDate, NgIf } from '@angular/common';
import { Component, Input, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import {
  BsDatepickerConfig,
  BsDatepickerModule,
} from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-date-input',
  imports: [BsDatepickerModule, NgIf],
  templateUrl: './date-input.component.html',
  styleUrl: './date-input.component.css',
  standalone: true,
})
export class DateInputComponent implements ControlValueAccessor {
  @Input() label: string;
  @Input() maxDate: Date;
  bsConfig: Partial<BsDatepickerConfig>;
  dateFormat: string = 'DD MMMM YYYY'

  // Internal state
  value: any = '';
  disabled: boolean = false;

  // Callbacks that Angular gives us
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(@Self() public ngControl: NgControl) {
    this.ngControl.valueAccessor = this;
    this.bsConfig = {
      containerClass: 'theme-red', 
    };
  }

  // 1. FORM → COMPONENT: "Set your value to this"
  writeValue(obj: any): void {
    this.value = obj || '';
  }

  // 2. FORM → COMPONENT: "When your value changes, call this function"
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // 3. FORM → COMPONENT: "When user touches you, call this function"
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // 4. FORM → COMPONENT: "Enable/disable yourself"
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Methods you'll use in your template
  onDateChange(date: Date): void {
    const formattedDate = formatDate(date, 'dd MMMM yyyy', 'en-US');
    this.value = formattedDate
    // Tell the form the value changed
    this.onChange(this.value);
  }

  onBlur(): void {
    // Tell the form the user touched this component
    this.onTouched();
  }
}
