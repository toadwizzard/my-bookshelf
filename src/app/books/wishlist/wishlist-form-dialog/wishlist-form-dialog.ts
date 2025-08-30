import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-wishlist-form-dialog',
  imports: [ReactiveFormsModule],
  host: {
    'class': 'dialog',
  },
  template: `
    <button (click)="cancel()" class="close">X</button>
    <h2>{{isEditing ? "Edit wishlist item" : "Add new book"}}</h2>
    <form [formGroup]="bookForm" (submit)="submitForm()">
      <div class="input-container">
        <label for="title">Title:</label>
        <input type="text" id="title" formControlName="title" placeholder="Title">
      </div>
      <button class="base-button" type="submit" [disabled]="!bookForm.valid">
        {{isEditing ? "Edit" : "Add"}}
      </button>
    </form>
  `,
  styleUrl: `../../../shared/form-styles.css`,
})
export class WishlistFormDialog {
  dialogRef = inject<DialogRef<string>>(DialogRef<string>);
  data = inject<{title: string} | undefined>(DIALOG_DATA);

  bookForm = new FormGroup({
    title: new FormControl<string>('', [Validators.required]),
  });
  isEditing: boolean = false;

  constructor() {
    this.isEditing = !!this.data;
    if(!!this.data){
      this.bookForm.patchValue({
        title: this.data.title
      });
    }
  }

  cancel(){
    this.dialogRef.close();
  }

  submitForm(){
    if(this.bookForm.valid){
      this.dialogRef.close(this.bookForm.value.title ?? "");
    }
  }

}
