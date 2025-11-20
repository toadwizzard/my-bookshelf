import { KeyValuePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-with-error',
  imports: [ReactiveFormsModule, KeyValuePipe],
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
    @if (input().invalid && input().touched && input().dirty) {
    @if(input().hasError("required")){
    <p>This field is required.</p>
    } @if(input().hasError("email")){
    <p>Invalid email format.</p>
    } @for(error of input().errors | keyvalue; track error.key) { @if(typeof
    error.value === "string"){
    <p>{{ error.value }}</p>
    } }}
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
