import { Component, effect, inject, signal, viewChild } from '@angular/core';
import { WishlistFilter } from './wishlist-filter/wishlist-filter';
import { WishlistTable } from './wishlist-table/wishlist-table';
import { BookService } from '../../services/book-service';
import { Dialog } from '@angular/cdk/dialog';
import { WishlistFormDialog } from './wishlist-form-dialog/wishlist-form-dialog';
import { ShelvedBookInfo } from '../../models/shelved-book-info';
import { BookFilterValues } from '../../models/book-filter-values';
import { BookOrderValues } from '../../models/book-order-values';
import { ShelfPagination } from '../../models/shelf-pagination';
import { Pagination } from '../pagination/pagination';
import { BookStatus } from '../../helpers/book-status';

@Component({
  selector: 'app-wishlist',
  imports: [WishlistFilter, WishlistTable, Pagination],
  template: `
    <div class="bookshelf-container">
      <app-wishlist-filter (filter)="filterBooks($event)" />
      <div class="bookshelf-top">
        <app-pagination
          [lastPage]="lastPage()"
          (setPage)="currentPage.set($event)"
          [(limit)]="pageLimit"
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
      <app-wishlist-table
        [books]="books"
        [loading]="loading()"
        (edit)="openEditBookDialog($event)"
        (addToOwned)="addBookToOwned($event)"
        (delete)="deleteBook($event)"
        [(bookOrder)]="orderValues"
      />
    </div>
  `,
  styleUrl: '../shared/shelf-styles.css',
})
export class Wishlist {
  bookService = inject(BookService);
  bookFilter = viewChild(WishlistFilter);
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
  currentPage = signal<number>(1);
  pageLimit = signal<number>(20);
  lastPage = signal<number>(0);
  loading = signal<boolean>(false);
  isError = false;
  errorMsg = '';

  constructor() {
    this.getWishlistedBooks();
    effect(() => {
      this.getWishlistedBooks();
    });
  }

  getWishlistedBooks() {
    this.isError = false;
    this.loading.set(true);
    const shelfTransform: BookFilterValues & BookOrderValues & ShelfPagination =
      {
        ...this.filterValues(),
        ...this.orderValues(),
        limit: this.pageLimit(),
      };
    if (this.currentPage() !== 1) {
      shelfTransform.page = this.currentPage();
    }
    this.bookService.getWishlistedBooks(shelfTransform).subscribe({
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

  openAddBookDialog() {
    const addBookDialogRef = this.bookFormDialog.open<boolean>(
      WishlistFormDialog,
      {
        width: '400px',
      }
    );
    addBookDialogRef.closed.subscribe((result) => {
      if (result) {
        this.getWishlistedBooks();
      }
    });
  }

  openEditBookDialog(id: string) {
    const editBookDialogRef = this.bookFormDialog.open<boolean>(
      WishlistFormDialog,
      {
        width: '400px',
        data: {
          bookId: id,
        },
      }
    );
    editBookDialogRef.closed.subscribe((result) => {
      if (result) {
        this.getWishlistedBooks();
      }
    });
  }

  addBookToOwned(id: string) {
    this.loading.set(true);
    this.bookService.getBookById(id, true).subscribe({
      next: (originalBook) => {
        this.bookService
          .updateBook(
            id,
            {
              ...originalBook,
              status: BookStatus.Default,
            },
            true
          )
          .subscribe({
            next: (result) => {
              if (result) {
                this.getWishlistedBooks();
              }
            },
            error: (err) => {
              this.loading.set(false);
              this.isError = true;
              this.errorMsg = `Could not add book to shelf: ${err.message}`;
            },
          });
      },
      error: (err) => {
        this.loading.set(false);
        this.isError = true;
        this.errorMsg = `Could not add book to shelf: ${err.message}`;
      },
    });
  }

  deleteBook(id: string) {
    this.loading.set(true);
    this.bookService.deleteBook(id).subscribe({
      next: (value) => {
        if (value) {
          this.getWishlistedBooks();
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
