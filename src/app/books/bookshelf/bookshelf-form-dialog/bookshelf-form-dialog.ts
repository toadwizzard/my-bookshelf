import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { BookInfo, BookStatus } from '../../../models/book-info';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { formatDate } from '@angular/common';
import { BookSearch } from '../../book-search/book-search';

@Component({
  selector: 'app-bookshelf-form-dialog',
  imports: [ReactiveFormsModule, BookSearch],
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
        <app-book-search [bookKeyInput]="bookForm.controls.bookKey" />
        <div>
          <div class="input-container">
            <label for="owner">{{ isEditing ? 'Status' : 'Add to:' }}</label>
            <select id="owner" formControlName="owner">
              @for (owner of ownerOptions; track $index){
              <option [ngValue]="owner.value">{{ owner.text }}</option>
              } @if (isEditing) {
              <option [ngValue]="lentStatus">Lent</option>
              }
            </select>
          </div>
          @if(!ownerMe){
          <div>
            <div class="input-container">
              <label for="otherName"
                >{{ isLent ? 'Lent to' : 'Owner name' }} (optional):</label
              >
              <input
                type="text"
                id="otherName"
                formControlName="otherName"
                [placeholder]="isLent ? 'Lent to' : 'Owner name'"
              />
            </div>
            <div class="input-container">
              <label for="sinceDueDate"
                >{{
                  isLent ? 'Lent on' : isDue ? 'Due' : 'Borrowed on'
                }}
                (optional):</label
              >
              <input
                type="date"
                id="sinceDueDate"
                formControlName="sinceDueDate"
              />
            </div>
          </div>
          }
        </div>
      </div>
      <button class="base-button" type="submit" [disabled]="!bookForm.valid">
        {{ isLend ? 'Lend' : isEditing ? 'Edit' : 'Add' }}
      </button>
    </form>
  `,
  styleUrl: `../../../shared/form-styles.css`,
})
export class BookshelfFormDialog {
  dialogRef = inject<DialogRef<BookInfo>>(DialogRef<BookInfo>);
  data = inject<{ book: BookInfo; isLend: boolean } | undefined>(DIALOG_DATA);

  bookForm = new FormGroup({
    bookKey: new FormControl<string>('', [Validators.required]),
    owner: new FormControl<
      | BookStatus.Default
      | BookStatus.Borrowed
      | BookStatus.LibraryBorrowed
      | BookStatus.Lent
    >(BookStatus.Default),
    otherName: new FormControl<string>(''),
    sinceDueDate: new FormControl<string>(''),
  });
  ownerOptions = [
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
    return this.bookForm.value.owner === BookStatus.Default;
  }
  get isDue(): boolean {
    return this.bookForm.value.owner === BookStatus.LibraryBorrowed;
  }
  get isLent(): boolean {
    return this.bookForm.value.owner === BookStatus.Lent;
  }

  get lentStatus() {
    return BookStatus.Lent;
  }

  constructor() {
    this.isEditing = !!this.data;
    this.isLend = !!this.data?.isLend;
    if (this.data) {
      const book: BookInfo = this.data.book;
      this.bookForm.patchValue({
        bookKey: book.title,
        owner: this.isLend
          ? BookStatus.Lent
          : book.status === BookStatus.Wishlist
          ? BookStatus.Default
          : book.status,
        otherName: book.otherName,
        sinceDueDate: book.date
          ? formatDate(book.date, 'y-MM-dd', 'en-US')
          : '',
      });
      if (this.isLend) {
        this.bookForm.get('title')?.disable();
        this.bookForm.get('owner')?.disable();
      }
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  submitForm() {
    if (this.bookForm.valid) {
      let otherName, date;
      if (
        this.bookForm.value.owner === BookStatus.Default ||
        !this.bookForm.getRawValue().owner
      ) {
        otherName = undefined;
        date = undefined;
      } else {
        otherName = this.bookForm.value.otherName;
        date = this.bookForm.value.sinceDueDate;
      }
      this.dialogRef.close({
        id: -1,
        title: this.bookForm.getRawValue().bookKey ?? '',
        otherName: otherName,
        status: this.bookForm.getRawValue().owner ?? BookStatus.Default,
        date: date ? new Date(date) : undefined,
      });
    }
  }
}
