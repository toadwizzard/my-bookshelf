import { Component, inject, viewChild } from '@angular/core';
import { BookService } from '../shared/book-service';
import { BookInfo, BookStatus } from '../shared/book-info';
import { BookshelfFilter, BookshelfFilterValues } from './bookshelf-filter/bookshelf-filter';
import { BookshelfTable } from './bookshelf-table/bookshelf-table';
import { getOwnerNameFromBook, stringMatches } from '../shared/utils';
import { Dialog } from '@angular/cdk/dialog';
import { BookshelfFormDialog } from './bookshelf-form-dialog/bookshelf-form-dialog';

@Component({
  selector: 'app-bookshelf',
  imports: [BookshelfFilter, BookshelfTable],
  template: `
    <div class="bookshelf-container">
      <div class="bookshelf-top">
        <app-bookshelf-filter (filter)="filterBooks($event)"/>
        <button (click)="openAddBookDialog()" class="base-button">Add</button>
      </div>
      <app-bookshelf-table [books]="filteredBooks" />
    </div>
  `,
  styleUrl: "../shared/shelf-styles.css",
})
export class Bookshelf {
  bookService = inject(BookService);
  bookFilter = viewChild(BookshelfFilter);

  books: BookInfo[] = [];
  filteredBooks: BookInfo[] = [];

  addBookDialog = inject(Dialog);

  constructor() {
    this.books = this.bookService.getShelvedBooks(1);
    this.filteredBooks = this.books;
  }

  filterBooks(filterValues: BookshelfFilterValues){
    this.filteredBooks = this.books.filter(book =>
      (!filterValues.hasCheck || (
        (filterValues.onShelf && book.status === BookStatus.Default) ||
        (filterValues.lent && book.status === BookStatus.Lent) ||
        (filterValues.borrowed && book.status === BookStatus.Borrowed) ||
        (filterValues.libraryBook && book.status === BookStatus.LibraryBorrowed)
      ) &&
      (!filterValues.owner || stringMatches(getOwnerNameFromBook(book), filterValues.owner)) &&
      (!filterValues.title || stringMatches(book.title, filterValues.title))
      )
    )
  }

  openAddBookDialog(){
    const addBookDialogRef = this.addBookDialog.open<BookInfo>(BookshelfFormDialog, {
      width: '400px'
    });

    addBookDialogRef.closed.subscribe(result => {
      if(result){
        console.log("In bookshelf:")
        console.log(result);
        const addedBook = this.bookService.addBook(1, result);
        this.books.push(addedBook);
        this.bookFilter()?.filterBooks();
      }
    })
  }
}
