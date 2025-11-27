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
import { Pagination } from '../pagination/pagination';

@Component({
  selector: 'app-bookshelf',
  imports: [BookshelfFilter, BookshelfTable, Pagination],
  template: `
    <div class="bookshelf-container">
      <app-bookshelf-filter (filter)="filterBooks($event)" />
      <div class="bookshelf-top">
        <app-pagination
          [lastPage]="lastPage()"
          (setPage)="setPage($event)"
          (setLimit)="setLimit($event)"
        />
        <button
          (click)="openAddBookDialog()"
          class="base-button icon-button"
          title="Add book"
        >
          <span class="material-icons">add</span>
        </button>
      </div>
      @if(isError) {
      <p class="error-msg">
        <span class="material-icons">error</span> {{ errorMsg }}
      </p>
      }
      <app-bookshelf-table
        [books]="books"
        [loading]="loading()"
        (edit)="openEditBookDialog($event, false)"
        (return)="returnBook($event)"
        (lend)="openEditBookDialog($event, true)"
        (delete)="deleteBook($event)"
        [(bookOrder)]="orderValues"
      />
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
  loading = signal<boolean>(false);
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
    this.loading.set(true);
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
        this.loading.set(false);
      },
    });
  }

  filterBooks(filterValues: BookFilterValues) {
    this.filterValues.set(filterValues);
  }

  setPage(pageNum: number) {
    const { page, ...withoutPage } = this.pagination();
    if (pageNum > 1)
      this.pagination.set({
        ...withoutPage,
        page: pageNum,
      });
    else this.pagination.set(withoutPage);
  }

  setLimit(pageLimit: number) {
    const { limit, ...withoutLimit } = this.pagination();
    if (pageLimit > 1)
      this.pagination.set({
        ...withoutLimit,
        limit: pageLimit,
      });
    else this.pagination.set(withoutLimit);
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
    this.loading.set(true);
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
                this.loading.set(false);
                this.isError = true;
                this.errorMsg = `Could not return book: ${err.message}`;
              },
            });
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.isError = true;
        this.errorMsg = `Could not return book: ${err.message}`;
      },
    });
  }

  deleteBook(id: string) {
    this.loading.set(true);
    this.bookService.deleteShelvedBook(id).subscribe({
      next: (value) => {
        if (value) {
          this.getShelvedBooks();
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.isError = true;
        this.errorMsg = `Could not remove book from list: ${err.message}`;
      },
    });
  }
}
