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
      } @else {
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

  constructor() {
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
    const addBookDialogRef = this.bookFormDialog.open<ShelvedBookWithData>(
      BookshelfFormDialog,
      {
        width: '800px',
      }
    );

    addBookDialogRef.closed.subscribe((result) => {
      if (result) {
        const addedBook = this.bookService.addShelvedBook(result);
        if (addedBook) {
          this.books.push(addedBook);
          this.bookFilter()?.filterBooks();
        }
      }
    });
  }

  openEditBookDialog(id: number, isLend: boolean) {
    const book = this.bookService.getShelvedBookById(id);
    if (!book) return;
    const editBookDialogRef = this.bookFormDialog.open<ShelvedBookWithData>(
      BookshelfFormDialog,
      {
        width: '800px',
        data: { shelvedBook: book, isLend },
      }
    );

    editBookDialogRef.closed.subscribe((result) => {
      if (
        result &&
        (book.title !== result.title ||
          book.status !== result.status ||
          book.otherName !== result.otherName ||
          book.date !== result.date)
      ) {
        result.id = book.id;
        const editedBook = this.bookService.updateShelvedBook(result);
        if (editedBook) {
          const modifiedIndex = this.findBookIndex(editedBook);
          if (modifiedIndex >= 0) {
            this.books[modifiedIndex] = editedBook;
            this.bookFilter()?.filterBooks();
          }
        }
      }
    });
  }

  returnBook(id: number) {
    const originalBook = this.bookService.getShelvedBookById(id);
    if (!originalBook || originalBook.status !== BookStatus.Lent) return;
    const returnedBook = this.bookService.updateShelvedBook({
      ...originalBook,
      status: BookStatus.Default,
      otherName: undefined,
      date: undefined,
    });
    if (returnedBook) {
      const returnedIndex = this.findBookIndex(returnedBook);
      if (returnedIndex >= 0) {
        this.books[returnedIndex] = returnedBook;
        this.bookFilter()?.filterBooks();
      }
    }
  }

  deleteBook(id: number) {
    if (this.bookService.deleteShelvedBook(id)) {
      this.books = this.bookService.getShelvedBooks();
      this.bookFilter()?.filterBooks();
    }
  }

  private findBookIndex(book: ShelvedBookWithData): number {
    return this.books.findIndex((bk) => bk.id === book.id);
  }
}
