import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { BookInfo, BookStatus } from '../../shared/book-info';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-bookshelf-form-dialog',
  imports: [ReactiveFormsModule],
  host: {
    'class': 'dialog',
  },
  template: `
    <button (click)="cancel()" class="close">X</button>
    <h2>Add new book</h2>
    <form [formGroup]="bookForm" (submit)="submitForm()">
      <div class="input-container">
        <label for="title">Title:</label>
        <input type="text" id="title" formControlName="title" placeholder="Title">
      </div>
      <div class="input-container">
        <label for="owner">Add to:</label>
        <select id="owner" formControlName="owner">
          @for (owner of ownerOptions; track $index){
            <option [ngValue]="owner.value">{{owner.text}}</option>
          }
        </select>
      </div>
      @if(!ownerMe){
        <div>
          <div class="input-container">
            <label for="ownerName">Owner name (optional):</label>
            <input type="text" id="ownerName" formControlName="ownerName" placeholder="Owner name">
          </div>
          <div class="input-container">
            <label for="sinceDueDate">{{isDue ? "Due" : "Borrowed on"}} (optional):</label>
            <input type="date" id="sinceDueDate" formControlName="sinceDueDate">
          </div>
        </div>
      }
      <button class="base-button" type="submit" (click)="submitForm()" [disabled]="!bookForm.valid">Add book</button>
    </form>
  `,
  styleUrl: `../../../shared/dialog-form-styles.css`,
})
export class BookshelfFormDialog {
  dialogRef = inject<DialogRef<BookInfo>>(DialogRef<BookInfo>);

  bookForm = new FormGroup({
    title: new FormControl<string>('', [Validators.required]),
    owner: new FormControl<BookStatus.Default | BookStatus.Borrowed | BookStatus.LibraryBorrowed>(BookStatus.Default),
    ownerName: new FormControl<string>(''),
    sinceDueDate: new FormControl<Date | undefined>(undefined),
  });
  ownerOptions = [
    {
      value: BookStatus.Default,
      text: "My shelf"
    },
    {
      value: BookStatus.Borrowed,
      text: "Borrowed"
    },
    {
      value: BookStatus.LibraryBorrowed,
      text: "Borrowed from library"
    }
  ];
  ownerMe: boolean = this.bookForm.value.owner === BookStatus.Default;
  isDue: boolean = this.bookForm.value.owner === BookStatus.LibraryBorrowed;

  constructor() {
    this.bookForm.get('owner')?.valueChanges.subscribe(value => {
      this.ownerMe = value === BookStatus.Default;
      this.isDue = value === BookStatus.LibraryBorrowed;
    })
  }

  cancel(){
    this.bookForm.reset();
    this.dialogRef.close();
  }

  submitForm(){
    if(this.bookForm.valid){
      const newBook = {
        title: this.bookForm.value.title ?? "",
        otherName: this.bookForm.value.ownerName,
        status: this.bookForm.value.owner ?? BookStatus.Default,
        date: this.bookForm.value.sinceDueDate ? new Date(this.bookForm.value.sinceDueDate) : undefined,
      };
      console.log("In dialog:");
      console.log(newBook);
      this.bookForm.reset();
      this.dialogRef.close(newBook);
    }
  }
}
