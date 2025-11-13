import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-with-error',
  imports: [ReactiveFormsModule],
  template: `<div class="input-with-error-container">
    <div class="input-container">
      <label [for]="name()">{{ label() }}:</label>
      <input
        [type]="type()"
        [id]="name()"
        [placeholder]="placeholder()"
        [formControl]="input()"
      />
    </div>
    @if (input().hasError('fieldError') && input().touched && input().dirty) {
    <p>{{ input().getError('fieldError') }}</p>
    }
  </div>`,
  styleUrl: '../form-styles.css',
})
export class InputWithError {
  input = input.required<FormControl>();
  name = input.required<string>();
  label = input.required<string>();
  type = input.required<string>();
  placeholder = input.required<string>();
}
