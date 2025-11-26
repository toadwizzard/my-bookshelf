import { Component, inject, viewChild } from '@angular/core';
import { BookService } from '../../services/book-service';
import {
  BookshelfFilter,
  BookshelfFilterValues,
} from './bookshelf-filter/bookshelf-filter';
import { BookshelfTable } from './bookshelf-table/bookshelf-table';
import { getOwnerNameFromBook, stringMatches } from '../../helpers/utils';
import { Dialog } from '@angular/cdk/dialog';
import { BookshelfFormDialog } from './bookshelf-form-dialog/bookshelf-form-dialog';
import { ShelvedBookInfo } from '../../models/shelved-book-info';

@Component({
  selector: 'app-bookshelf',
  imports: [BookshelfFilter, BookshelfTable],
  template: `
    <div class="bookshelf-container">
      <div class="bookshelf-top">
        <app-bookshelf-filter (filter)="filterBooks($event)" />
        <button
          (click)="openAddBookDialog()"
          class="base-button icon-button"
          title="Add book"
        >
          <span class="material-icons">add</span>
        </button>
      </div>
      @if(loading) {
      <p class="loading">Loading...</p>
      } @else { @if(isError) {
      <p class="error-msg">
        <span class="material-icons">error</span> {{ errorMsg }}
      </p>
      }
      <app-bookshelf-table
        [books]="books"
        (edit)="openEditBookDialog($event, false)"
        (return)="returnBook($event)"
        (lend)="openEditBookDialog($event, true)"
        (delete)="deleteBook($event)"
      />
      }
    </div>
  `,
  styleUrl: '../shared/shelf-styles.css',
})
export class Bookshelf {
  bookService = inject(BookService);
  bookFilter = viewChild(BookshelfFilter);
  bookFormDialog = inject(Dialog);

  books: ShelvedBookInfo[] = [];
  loading = false;
  isError = false;
  errorMsg = '';

  constructor() {
    this.getShelvedBooks();
  }

  getShelvedBooks() {
    this.isError = false;
    this.loading = true;
    this.bookService.getShelvedBooks().subscribe({
      next: (shelf) => {
        this.books = shelf.books;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  filterBooks(filterValues: BookshelfFilterValues) {
    this.filteredBooks = this.books.filter(
      (book) =>
        (!filterValues.hasCheck ||
          (filterValues.onShelf && book.status === BookStatus.Default) ||
          (filterValues.lent && book.status === BookStatus.Lent) ||
          (filterValues.borrowed && book.status === BookStatus.Borrowed) ||
          (filterValues.libraryBook &&
            book.status === BookStatus.LibraryBorrowed)) &&
        (!filterValues.owner ||
          stringMatches(getOwnerNameFromBook(book), filterValues.owner)) &&
        (!filterValues.title ||
          stringMatches(book.title, filterValues.title)) &&
        (!filterValues.author ||
          book.author_name.some((author) =>
            stringMatches(author, filterValues.author)
          ))
    );
  }

  openAddBookDialog() {
    const addBookDialogRef = this.bookFormDialog.open<boolean>(
      BookshelfFormDialog,
      {
        width: '800px',
      }
    );

    addBookDialogRef.closed.subscribe((result) => {
      if (result) {
        this.getShelvedBooks();
      }
    });
  }

  openEditBookDialog(id: string, isLend: boolean) {
    const editBookDialogRef = this.bookFormDialog.open<boolean>(
      BookshelfFormDialog,
      {
        width: '800px',
        data: { shelvedBookId: id, isLend },
      }
    );
    editBookDialogRef.closed.subscribe((result) => {
      if (result) {
        this.getShelvedBooks();
      }
    });
  }

  returnBook(id: string) {
    this.loading = true;
    this.bookService.getShelvedBookById(id).subscribe({
      next: (originalBook) => {
        if (originalBook.status === BookStatus.Lent) {
          this.bookService
            .updateShelvedBook(id, {
      ...originalBook,
      status: BookStatus.Default,
              other_name: undefined,
      date: undefined,
            })
            .subscribe({
              next: (result) => {
                if (result) {
                  this.getShelvedBooks();
                }
              },
              error: (err) => {
                this.loading = false;
                this.isError = true;
                this.errorMsg = `Could not return book: ${err.message}`;
              },
            });
        }
      },
      error: (err) => {
        this.loading = false;
        this.isError = true;
        this.errorMsg = `Could not return book: ${err.message}`;
      },
    });
  }

  deleteBook(id: string) {
    this.loading = true;
    this.bookService.deleteShelvedBook(id).subscribe({
      next: (value) => {
        if (value) {
          this.getShelvedBooks();
        }
      },
      error: (err) => {
        this.loading = false;
        this.isError = true;
        this.errorMsg = `Could not remove book from list: ${err.message}`;
      },
    });
  }
}
