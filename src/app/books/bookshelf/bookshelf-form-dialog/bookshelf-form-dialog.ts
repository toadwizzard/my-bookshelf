import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { formatDate } from '@angular/common';
import { BookSearch } from '../../book-search/book-search';
import { ShelvedBookData } from '../../../models/shelved-book-data';
import { BookStatus } from '../../../helpers/book-status';
import { BookService } from '../../../services/book-service';
import { BookResultInfo } from '../../../models/book-result-info';
import { InputWithError } from '../../../shared/input-with-error/input-with-error';
import { isFormError } from '../../../helpers/form-error';

@Component({
  selector: 'app-bookshelf-form-dialog',
  imports: [ReactiveFormsModule, BookSearch, InputWithError],
  host: {
    class: 'dialog',
  },
  template: `
    <button (click)="cancel()" class="close">X</button>
    <h2>
      {{ isLend ? 'Lend book' : isEditing ? 'Edit book' : 'Add new book' }}
    </h2>
    <form [formGroup]="bookForm" (submit)="submitForm()">
      <div class="split-form-content">
        <app-book-search
          formControlName="bookData"
          [error]="bookForm.get('bookData')?.getError('fieldError')"
        />
        <div>
          <div class="input-container">
            <label for="status">{{ isEditing ? 'Status' : 'Add to:' }}</label>
            <select id="status" formControlName="status">
              @for (status of statusOptions; track $index){
              <option [ngValue]="status.value">{{ status.text }}</option>
              } @if (isEditing) {
              <option [ngValue]="lentStatus">Lent</option>
              }
            </select>
          </div>
          @if(!ownerMe){
          <div>
            <app-input-with-error
              name="otherName"
              [label]="otherNameLabel"
              [placeholder]="
                isLend ? 'Lend to' : isLent ? 'Lent to' : 'Owner name'
              "
              type="text"
              [input]="bookForm.controls.other_name"
            />
            <app-input-with-error
              name="date"
              [label]="dateLabel"
              type="date"
              [input]="bookForm.controls.date"
            />
          </div>
          }
        </div>
      </div>
      @if(bookForm.hasError('formError')){
      <p class="error-msg">
        <span class="material-icons">error</span> {{ errorMsg }}
      </p>
      } @if (loading) {
      <p class="loading">Loading...</p>
      }
      <button class="base-button" type="submit" [disabled]="!bookForm.valid">
        {{ isLend ? 'Lend' : isEditing ? 'Edit' : 'Add' }}
      </button>
    </form>
  `,
  styleUrl: `../../../shared/form-styles.css`,
})
export class BookshelfFormDialog {
  dialogRef = inject<DialogRef<boolean>>(DialogRef<boolean>);
  data = inject<{ shelvedBook: ShelvedBookData; isLend: boolean } | undefined>(
    DIALOG_DATA
  );
  bookService = inject(BookService);

  bookForm = new FormGroup({
    bookData: new FormControl<BookResultInfo | undefined>(undefined, [
      Validators.required,
    ]),
    status: new FormControl<
      | BookStatus.Default
      | BookStatus.Borrowed
      | BookStatus.LibraryBorrowed
      | BookStatus.Lent
    >(BookStatus.Default),
    other_name: new FormControl<string>(''),
    date: new FormControl<string>(''),
  });
  statusOptions = [
    {
      value: BookStatus.Default,
      text: 'My shelf',
    },
    {
      value: BookStatus.Borrowed,
      text: 'Borrowed',
    },
    {
      value: BookStatus.LibraryBorrowed,
      text: 'Borrowed from library',
    },
  ];
  isEditing: boolean = false;
  isLend: boolean = false;

  get ownerMe(): boolean {
    return this.bookForm.value.status === BookStatus.Default;
  }
  get isDue(): boolean {
    return this.bookForm.value.status === BookStatus.LibraryBorrowed;
  }
  get isLent(): boolean {
    return this.bookForm.value.status === BookStatus.Lent;
  }

  get lentStatus() {
    return BookStatus.Lent;
  }

  get otherNameLabel(): string {
    return `${
      this.isLend ? 'Lend to' : this.isLent ? 'Lent to' : 'Owner name'
    } (optional)`;
  }
  get dateLabel(): string {
    return `${
      this.isLend
        ? 'Lend on'
        : this.isLent
        ? 'Lent on'
        : this.isDue
        ? 'Due'
        : 'Borrowed on'
    } (optional)`;
  }

  loading = false;
  errorMsg = '';
  isOpen = false;

  constructor() {
    this.isOpen = true;
    this.isEditing = !!this.data;
    this.isLend = !!this.data?.isLend;
    if (this.data) {
      const shelvedBook: ShelvedBookData = this.data.shelvedBook;
      this.bookForm.patchValue({
        bookData: {
          key: shelvedBook.book_key,
          title: shelvedBook.title,
          author_name: shelvedBook.author,
        },
        status: this.isLend
          ? BookStatus.Lent
          : shelvedBook.status === BookStatus.Wishlist
          ? BookStatus.Default
          : shelvedBook.status,
        other_name: shelvedBook.other_name,
        date: shelvedBook.date
          ? formatDate(shelvedBook.date, 'y-MM-dd', 'en-US')
          : '',
      });
      if (this.isLend) {
        this.bookForm.get('bookData')?.disable();
        this.bookForm.get('status')?.disable();
      }
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  submitForm() {
    if (this.bookForm.valid) {
      const bookData = this.bookForm.getRawValue().bookData;
      const addedBook: ShelvedBookData = {
        book_key: bookData ? bookData.key ?? '' : '',
        status: this.bookForm.getRawValue().status ?? BookStatus.Default,
      };
      if (this.bookForm.value.other_name) {
        addedBook.other_name = this.bookForm.value.other_name;
      }
      if (this.bookForm.value.date) {
        addedBook.date = new Date(this.bookForm.value.date);
      }
      this.loading = true;
      this.bookService.addShelvedBook(addedBook).subscribe({
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
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
          if (this.isOpen) this.dialogRef.close();
        },
      });
    }
  }
}
