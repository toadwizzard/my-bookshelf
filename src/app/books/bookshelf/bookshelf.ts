import { Component, inject } from '@angular/core';
import { BookService } from '../shared/book-service';
import { BookInfo, BookStatus } from '../shared/book-info';
import { NgClass } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-bookshelf',
  imports: [NgClass, ReactiveFormsModule],
  template: `
    <div class="bookshelf-container">
      <div class="form-container">
        <p class="filterTitle" (click)="toggleForm()">Filter</p>
        <form [formGroup]="filterForm" (submit)="filterByOwnerAndTitle()" [ngClass]="{hidden: !formVisible}">
          <div>
            <label for="owner">Owner:</label>
            <input type="text" placeholder="Filter by owner" name="owner" formControlName="owner">
          </div>
          <div>
            <label for="title">Title:</label>
            <input type="text" placeholder="Filter by title" name="title" formControlName="title">
          </div>
          <button type="submit">Filter</button>
        </form>
      </div>
      <table class="bookshelf">
        <thead>
          <tr>
            <th class="orderable" tabindex=0 [ngClass]="{
              orderAscend: orderedByOwner,
              orderDescend: orderedByOwner === false
            }" (click)="orderByOwner()">Owner</th>
            <th class="orderable" tabindex=0 [ngClass]="{
              orderAscend: orderedByTitle,
              orderDescend: orderedByTitle === false
            }" (click)="orderByTitle()">Title</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (book of filteredBooks; track $index) {
            <tr>
              <td>{{getOwnerNameFromBook(book)}}</td>
              <td>{{book.title}}</td>
              <td>{{getStatusFromBook(book)}}</td>
              <td>actions</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: ``,
  styleUrl: "../shared/book-styles.css",
})
export class Bookshelf {
  bookService = inject(BookService);
  books: BookInfo[] = [];
  orderedBooks: BookInfo[] = [];
  filteredBooks: BookInfo[] = [];
  orderedByOwner: true | false | undefined;
  orderedByTitle: true | false | undefined;
  filterForm = new FormGroup({
    owner: new FormControl(''),
    title: new FormControl('')
  });
  formVisible: boolean = false;

  constructor() {
    this.books = this.bookService.getShelvedBooks(1);
    this.orderedBooks = this.books;
    this.filteredBooks = this.books;
    this.orderedByOwner = undefined;
    this.orderedByTitle = undefined;
  }

  getOwnerNameFromBook(book: BookInfo): string {
    if(book.status === BookStatus.Default || book.status === BookStatus.Lent)
      return "Me";
    if(book.status === BookStatus.Borrowed)
      return book.otherName ?? "Other";
    if(book.status === BookStatus.LibraryBorrowed)
      return book.otherName ?? "Library";
    return "";
  }

  getStatusFromBook(book: BookInfo): string {
    if(book.status === BookStatus.Lent)
      return "Lent" + (book.otherName ? ` to ${book.otherName}` : "")
      + (book.date ? ` on ${this.formatDate(book.date)}` : "");
    if(book.status === BookStatus.Borrowed)
      return "Borrowed" + (book.date ? ` on ${this.formatDate(book.date)}` : "");
    if(book.status === BookStatus.LibraryBorrowed)
      return "Borrowed" + (book.date ? ` (due ${this.formatDate(book.date)})` : "");
    return "";
  }

  private formatDate(date: Date): string {
    return date.getFullYear().toString() + ". "
      + date.getMonth().toString().padStart(2, "0") + ". "
      + date.getDate().toString().padStart(2, "0") + ".";
  }

  orderByOwner(){
    this.orderedByTitle = undefined;
    this.orderedByOwner = !this.orderedByOwner;
    const ordered = this.books.toSorted((a, b) =>
      this.getOwnerNameFromBook(a).localeCompare(this.getOwnerNameFromBook(b))
    );
    this.orderedBooks = this.orderedByOwner ? ordered : ordered.reverse()
    this.filterByOwnerAndTitle();
  }

  orderByTitle(){
    this.orderedByOwner = undefined;
    this.orderedByTitle = !this.orderedByTitle;
    const ordered = this.books.toSorted((a, b) => a.title.localeCompare(b.title));
    this.orderedBooks = this.orderedByTitle ? ordered : ordered.reverse();
    this.filterByOwnerAndTitle();
  }

  toggleForm(){
    this.formVisible = !this.formVisible;
  }

  filterByOwnerAndTitle(){
    this.filteredBooks = this.orderedBooks.filter(book =>
      (!this.filterForm.value.owner ||
      this.getOwnerNameFromBook(book).toLowerCase().includes(this.filterForm.value.owner))
      &&
      (!this.filterForm.value.title ||
      book.title.toLowerCase().includes(this.filterForm.value.title))
    )
  }
}
