import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BookSearch } from '../../book-search/book-search';
import { BookInfo } from '../../../models/book-info';

@Component({
  selector: 'app-wishlist-form-dialog',
  imports: [ReactiveFormsModule, BookSearch],
  host: {
    class: 'dialog',
  },
  template: `
    <button (click)="cancel()" class="close">X</button>
    <h2>{{ isEditing ? 'Edit wishlist item' : 'Add new book' }}</h2>
    <form [formGroup]="bookForm" (submit)="submitForm()">
      <app-book-search formControlName="bookData" />
      <button class="base-button" type="submit" [disabled]="!bookForm.valid">
        {{ isEditing ? 'Edit' : 'Add' }}
      </button>
    </form>
  `,
  styleUrl: `../../../shared/form-styles.css`,
})
export class WishlistFormDialog {
  dialogRef = inject<DialogRef<BookInfo>>(DialogRef<BookInfo>);
  data = inject<{ book: BookInfo } | undefined>(DIALOG_DATA);

  bookForm = new FormGroup({
    bookData: new FormControl<BookInfo | undefined>(undefined, [
      Validators.required,
    ]),
  });
  isEditing: boolean = false;

  constructor() {
    this.isEditing = !!this.data;
    if (!!this.data) {
      this.bookForm.patchValue({
        bookData: this.data.book,
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  submitForm() {
    if (this.bookForm.valid) {
      this.dialogRef.close(
        this.bookForm.value.bookData ?? {
          title: '',
          author_name: [],
          bookKey: '',
        }
      );
    }
  }
}
