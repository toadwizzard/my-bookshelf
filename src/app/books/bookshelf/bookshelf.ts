import { Component, effect, inject, signal, viewChild } from '@angular/core';
import { BookService } from '../../services/book-service';
import { BookshelfFilter } from './bookshelf-filter/bookshelf-filter';
import { BookshelfTable } from './bookshelf-table/bookshelf-table';
import { Dialog } from '@angular/cdk/dialog';
import { BookshelfFormDialog } from './bookshelf-form-dialog/bookshelf-form-dialog';
import { ShelvedBookInfo } from '../../models/shelved-book-info';
import { BookStatus } from '../../helpers/book-status';
import { BookFilterValues } from '../../models/book-filter-values';
import { BookOrderValues } from '../../models/book-order-values';
import { ShelfPagination } from '../../models/shelf-pagination';

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
        [(bookOrder)]="orderValues"
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
  filterValues = signal<BookFilterValues>({
    owner: '',
    title: '',
    author: '',
    onShelf: false,
    lent: false,
    borrowed: false,
    libraryBook: false,
  });
  orderValues = signal<BookOrderValues>({});
  pagination = signal<ShelfPagination>({});
  lastPage = signal<number>(0);
  loading = false;
  isError = false;
  errorMsg = '';

  constructor() {
    this.getShelvedBooks();
    effect(() => {
      this.getShelvedBooks();
    });
  }

  getShelvedBooks() {
    this.isError = false;
    this.loading = true;
    const shelfTransform = {
      ...this.filterValues(),
      ...this.orderValues(),
      ...this.pagination(),
    };
    this.bookService.getShelvedBooks(shelfTransform).subscribe({
      next: (shelf) => {
        this.books = shelf.books;
        this.lastPage.set(shelf.last_page);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  filterBooks(filterValues: BookFilterValues) {
    this.filterValues.set(filterValues);
  }

  setPage(pagination: ShelfPagination) {
    this.pagination.set(pagination);
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
