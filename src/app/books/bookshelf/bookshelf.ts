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
        <p class="filterTitle" [ngClass]="{open: formVisible}" (click)="toggleForm()">Filter</p>
        <form [formGroup]="filterForm" (submit)="filterBooks()" [ngClass]="{hidden: !formVisible}">
          <div class="checkboxes">
            <input type="checkbox" id="onShelf" formControlName="onShelf"><label for="onShelf">Books on shelf</label><br>
            <input type="checkbox" id="lent" formControlName="lent"><label for="lent">Lent books</label><br>
            <input type="checkbox" id="borrowed" formControlName="borrowed"><label for="borrowed">Borrowed books</label><br>
            <input type="checkbox" id="libraryBooks" formControlName="libraryBooks"><label for="libraryBooks">Borrowed from library</label>
          </div>
          <div>
            <label for="owner">Owner:</label>
            <input type="text" placeholder="Filter by owner" name="owner" formControlName="owner">
          </div>
          <div>
            <label for="title">Title:</label>
            <input type="text" placeholder="Filter by title" name="title" formControlName="title">
          </div>
          <div class="buttons">
            <button type="submit">Filter</button>
            <button (click)="clearFilter()">Clear</button>
          </div>
        </form>
      </div>
      <table class="bookshelf">
        <thead>
          <tr>
            <th class="orderable owner" [ngClass]="{
              orderAscend: orderedByOwner,
              orderDescend: orderedByOwner === false
            }" (click)="orderByOwner()">Owner</th>
            <th class="orderable title" [ngClass]="{
              orderAscend: orderedByTitle,
              orderDescend: orderedByTitle === false
            }" (click)="orderByTitle()">Title</th>
            <th class="status">Status</th>
            <th class="actions">Actions</th>
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
  styles: `
    .owner {
      width: 20%;
    }
    .title {
      width: 30%;
    }
    .status {
      width: 35%;
    }
    .actions {
      width: 10%;
    }
  `,
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
    title: new FormControl(''),
    onShelf: new FormControl(),
    lent: new FormControl(),
    borrowed: new FormControl(),
    libraryBooks: new FormControl(),
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
    this.orderedBooks = this.books.toSorted((a, b) =>
      this.orderedByOwner ?
      this.getOwnerNameFromBook(a).localeCompare(this.getOwnerNameFromBook(b)) :
      this.getOwnerNameFromBook(b).localeCompare(this.getOwnerNameFromBook(a))
    );
    this.filterBooks();
  }

  orderByTitle(){
    this.orderedByOwner = undefined;
    this.orderedByTitle = !this.orderedByTitle;
    this.orderedBooks = this.books.toSorted((a, b) =>
      this.orderedByTitle ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );
    this.filterBooks();
  }

  toggleForm(){
    this.formVisible = !this.formVisible;
  }

  filterBooks(){
    this.filteredBooks = this.orderedBooks.filter(book =>
    (!this.hasCheck() ||
      (this.isOnShelf(book) || this.isLent(book) || this.isBorrowed(book) || this.isLibraryBook(book)))
      && this.ownerMatches(book) && this.titleMatches(book)
    )
  }

  private hasCheck(): boolean {
    return this.filterForm.value.onShelf ||
      this.filterForm.value.lent ||
      this.filterForm.value.borrowed ||
      this.filterForm.value.libraryBooks;
  }

  private isOnShelf(book: BookInfo): boolean {
    return this.filterForm.value.onShelf && book.status === BookStatus.Default;
  }

  private isLent(book: BookInfo): boolean {
    return this.filterForm.value.lent && book.status === BookStatus.Lent;
  }

  private isBorrowed(book: BookInfo): boolean {
    return this.filterForm.value.borrowed && book.status === BookStatus.Borrowed;
  }

  private isLibraryBook(book: BookInfo): boolean {
    return this.filterForm.value.libraryBooks && book.status === BookStatus.LibraryBorrowed;
  }

  private ownerMatches(book: BookInfo): boolean {
    return !this.filterForm.value.owner ||
      this.getOwnerNameFromBook(book).toLowerCase().includes(this.filterForm.value.owner);
  }

  private titleMatches(book: BookInfo): boolean {
    return !this.filterForm.value.title || book.title.toLowerCase().includes(this.filterForm.value.title);
  }

  clearFilter(){
    this.filterForm.reset();
  }
}
