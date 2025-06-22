import { NgIf } from '@angular/common';
import { Component, Input, Self } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  standalone: true, 
  selector: 'app-text-input',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.css',
})
export class TextInputComponent implements ControlValueAccessor {
  @Input() label: string;
  // Defaul type is string
  @Input() type = 'text';

  // Internal state
  value: any = '';
  disabled: boolean = false;

  // Callbacks that Angular gives us
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(@Self() public ngControl: NgControl) {
    this.ngControl.valueAccessor = this;
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
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    // Tell the form the value changed
    this.onChange(this.value);
  }

  onBlur(): void {
    // Tell the form the user touched this component
    this.onTouched();
  }
}
