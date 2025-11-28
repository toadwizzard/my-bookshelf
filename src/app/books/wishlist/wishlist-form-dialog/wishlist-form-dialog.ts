import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BookSearch } from '../../book-search/book-search';
import { BookService } from '../../../services/book-service';
import { BookResultInfo } from '../../../models/book-result-info';
import { ShelvedBookData } from '../../../models/shelved-book-data';
import { BookStatus } from '../../../helpers/book-status';
import { isFormError } from '../../../helpers/form-error';

@Component({
  selector: 'app-wishlist-form-dialog',
  imports: [ReactiveFormsModule, BookSearch],
  host: {
    class: 'dialog',
  },
  template: `
    <button (click)="cancel()" class="close">X</button>
    <h2>{{ isEditing ? 'Edit wishlist item' : 'Add new book' }}</h2>
    @if(getLoading){
    <p class="loading">Loading...</p>
    } @else if (isGetError) {
    <p class="error-msg">
      <span class="material-icons">error</span> {{ errorMsg }}
    </p>
    } @else {
    <form [formGroup]="bookForm" (submit)="submitForm()">
      <app-book-search formControlName="bookData" />
      @if(bookForm.hasError('formError')){
      <p class="error-msg">
        <span class="material-icons">error</span> {{ errorMsg }}
      </p>
      } @if (postLoading) {
      <p class="loading">Loading...</p>
      }
      <button class="base-button" type="submit" [disabled]="!bookForm.valid">
        {{ isEditing ? 'Edit' : 'Add' }}
      </button>
    </form>
    }
  `,
  styleUrl: `../../../shared/form-styles.css`,
})
export class WishlistFormDialog {
  dialogRef = inject<DialogRef<boolean>>(DialogRef<boolean>);
  data = inject<{ bookId: string } | undefined>(DIALOG_DATA);
  bookService = inject(BookService);

  bookForm = new FormGroup({
    bookData: new FormControl<BookResultInfo | undefined>(undefined, [
      Validators.required,
    ]),
  });
  isEditing: boolean = false;

  postLoading = false;
  getLoading = false;
  isGetError = false;
  errorMsg = '';
  isOpen = false;

  constructor() {
    this.isOpen = true;
    this.isEditing = !!this.data;
    if (this.data) {
      this.getLoading = true;
      this.bookService.getBookById(this.data.bookId, true).subscribe({
        next: (wishlistedBook) => {
          this.bookForm.patchValue({
            bookData: {
              key: wishlistedBook.book_key,
              title: wishlistedBook.title,
              author_name: wishlistedBook.author,
            },
          });
          this.getLoading = false;
        },
        error: (err) => {
          this.errorMsg = err.message;
          this.isGetError = true;
          this.getLoading = false;
        },
        complete: () => {
          if (this.getLoading) {
            // 401 error handled by interceptor
            this.isOpen = false;
            this.cancel();
          }
        },
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  submitForm() {
    if (this.bookForm.valid) {
      const bookData = this.bookForm.getRawValue().bookData;
      const book: ShelvedBookData = {
        book_key: bookData ? bookData.key ?? '' : '',
        status: BookStatus.Wishlist,
      };
      this.postLoading = true;
      let serviceMethod;
      if (this.isEditing)
        serviceMethod = this.bookService.updateBook(
          this.data?.bookId ?? '',
          book,
          true
        );
      else serviceMethod = this.bookService.addBook(book, true);
      serviceMethod.subscribe({
        next: (value) => {
          if (value) {
            this.isOpen = false;
            this.dialogRef.close(value);
          }
        },
        error: (err) => {
          if (isFormError(err)) {
            err.errors.forEach((error) => {
              this.bookForm
                .get(error.field)
                ?.setErrors({ fieldError: error.message });
            });
          } else {
            this.errorMsg = err.message;
            this.bookForm.setErrors({ formError: true });
          }
          this.postLoading = false;
        },
        complete: () => {
          this.postLoading = false;
          if (this.isOpen) this.dialogRef.close();
        },
      });
    }
  }
}
