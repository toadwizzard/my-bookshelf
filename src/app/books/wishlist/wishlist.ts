import { Component, inject, viewChild } from '@angular/core';
import { WishlistFilter } from './wishlist-filter/wishlist-filter';
import { WishlistTable } from './wishlist-table/wishlist-table';
import { BookService } from '../../services/book-service';
import { BookInfo } from '../../models/book-info';
import { stringMatches } from '../../helpers/utils';
import { Dialog } from '@angular/cdk/dialog';
import { WishlistFormDialog } from './wishlist-form-dialog/wishlist-form-dialog';
import { ShelvedBookWithData } from '../../models/shelved-book-with-data';
import { BookStatus } from '../../models/shelved-book-info';

@Component({
  selector: 'app-wishlist',
  imports: [WishlistFilter, WishlistTable],
  template: `
    <div class="bookshelf-container">
      <div class="bookshelf-top">
        <app-wishlist-filter (filter)="filterBooks($event)" />
        <button
          (click)="openAddBookDialog()"
          class="base-button icon-button"
          title="Add book"
        >
          <span class="material-icons">add</span>
        </button>
      </div>
      <app-wishlist-table
        [books]="filteredBooks"
        (edit)="openEditBookDialog($event)"
        (addToOwned)="addBookToOwned($event)"
        (delete)="deleteBook($event)"
      />
    </div>
  `,
  styleUrl: '../shared/shelf-styles.css',
})
export class Wishlist {
  bookService = inject(BookService);
  bookFilter = viewChild(WishlistFilter);

  bookFormDialog = inject(Dialog);

  books: ShelvedBookWithData[] = [];
  filteredBooks: ShelvedBookWithData[] = [];

  constructor() {
    this.books = this.bookService.getWishlistedBooks();
    this.filteredBooks = this.books;
  }

  filterBooks(filterValues: { title: string; author: string }) {
    this.filteredBooks = this.books.filter(
      (book) =>
        (!filterValues.title ||
          stringMatches(book.title, filterValues.title)) &&
        (!filterValues.author ||
          book.author_name.some((author) =>
            stringMatches(author, filterValues.author)
          ))
    );
  }

  openAddBookDialog() {
    const addBookDialogRef = this.bookFormDialog.open<BookInfo>(
      WishlistFormDialog,
      {
        width: '400px',
      }
    );

    addBookDialogRef.closed.subscribe((result) => {
      if (result) {
        const addedBook = this.bookService.addShelvedBook({
          id: -1,
          title: result.title,
          author_name: result.author_name,
          bookKey: result.bookKey,
          status: BookStatus.Wishlist,
          otherName: undefined,
          date: undefined,
        });
        if (addedBook) {
          this.books.push(addedBook);
          this.bookFilter()?.filterBooks();
        }
      }
    });
  }

  openEditBookDialog(id: number) {
    const book = this.bookService.getShelvedBookById(id);
    if (!book) return;
    const editBookDialogRef = this.bookFormDialog.open<BookInfo>(
      WishlistFormDialog,
      {
        width: '400px',
        data: {
          book: {
            title: book.title,
            author_name: book.author_name,
            bookKey: book.bookKey,
          },
        },
      }
    );

    editBookDialogRef.closed.subscribe((result) => {
      if (result && book.bookKey !== result.bookKey) {
        const editedBook = this.bookService.updateShelvedBook({
          ...book,
          title: result.title,
          author_name: result.author_name,
          bookKey: result.bookKey,
        });
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

  addBookToOwned(id: number) {
    const originalBook = this.bookService.getShelvedBookById(id);
    if (!originalBook || originalBook.status !== BookStatus.Wishlist) return;
    const toOwnedBook = this.bookService.updateShelvedBook({
      ...originalBook,
      status: BookStatus.Default,
      otherName: undefined,
      date: undefined,
    });
    if (toOwnedBook) {
      const ownedIndex = this.findBookIndex(toOwnedBook);
      if (ownedIndex >= 0) {
        this.books.splice(ownedIndex, 1);
        this.bookFilter()?.filterBooks();
      }
    }
  }

  deleteBook(id: number) {
    if (this.bookService.deleteShelvedBook(id)) {
      this.books = this.bookService.getWishlistedBooks();
      this.bookFilter()?.filterBooks();
    }
  }

  private findBookIndex(book: ShelvedBookWithData): number {
    return this.books.findIndex((bk) => bk.id === book.id);
  }
}
