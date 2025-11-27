import { NgClass } from '@angular/common';
import { Component, input, model, output } from '@angular/core';
import { ShelvedBookInfo } from '../../../models/shelved-book-info';
import { BookStatus } from '../../../helpers/book-status';
import { BookOrderValues } from '../../../models/book-order-values';

@Component({
  selector: 'app-bookshelf-table',
  imports: [NgClass],
  template: `
    <table class="bookshelf">
      <thead>
        <tr>
          <th
            class="orderable owner"
            [ngClass]="{
              orderAscend: orderedByOwnerAsc,
              orderDescend: orderedByOwnerAsc === false
            }"
            (click)="orderByOwner()"
            (keyup.enter)="orderByOwner()"
            tabindex="0"
          >
            Owner
          </th>
          <th
            class="orderable title"
            [ngClass]="{
              orderAscend: orderedByTitleAsc,
              orderDescend: orderedByTitleAsc === false
            }"
            (click)="orderByTitle()"
            (keyup.enter)="orderByTitle()"
            tabindex="0"
          >
            Title
          </th>
          <th class="author">Author(s)</th>
          <th class="status">Status</th>
          <th class="actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        @if(books().length === 0){
        <tr>
          <td class="empty-warning" colspan="5">
            No books to show. (Try adding a book first!)
          </td>
        </tr>
        } @for (book of books(); track $index) {
        <tr>
          <td>{{ book.owner_name }}</td>
          <td>{{ book.title }}</td>
          <td>{{ book.author.join(', ') }}</td>
          <td>{{ book.full_status }}</td>
          <td>
            <div class="action-button-container">
              @if (book.status === defaultStatus){
              <button
                title="Lend"
                class="base-button icon-button green"
                (click)="lendBook(book.id)"
              >
                <span class="material-icons">output</span>
              </button>
              } @if (book.status === borrowedStatus || book.status ===
              libraryBorrowedStatus) {
              <button
                title="Return to owner"
                class="base-button icon-button green"
                (click)="deleteBook(book.id)"
              >
                <span class="material-icons">output</span>
              </button>
              } @if (book.status === lentStatus) {
              <button
                title="Return to me"
                class="base-button icon-button green"
                (click)="returnBook(book.id)"
              >
                <span class="material-icons">input</span>
              </button>
              }
              <button
                title="Edit"
                class="base-button icon-button"
                (click)="editBook(book.id)"
              >
                <span class="material-icons">edit</span>
              </button>
              @if (book.status === defaultStatus || book.status === lentStatus)
              {
              <button
                title="Delete"
                class="base-button icon-button red"
                (click)="deleteBook(book.id)"
              >
                <span class="material-icons">delete</span>
              </button>
              }
            </div>
          </td>
        </tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    .owner {
      width: 15%;
    }
    .title {
      width: 15%;
    }
    .author {
      width: 20%;
    }
    .status {
      width: 25%;
    }
    .actions {
      width: 15%;
    }
  `,
  styleUrl: `../../shared/table-styles.css`,
})
export class BookshelfTable {
  bookOrder = model<BookOrderValues>({});
  books = input<ShelvedBookInfo[]>([]);
  delete = output<string>();
  edit = output<string>();
  lend = output<string>();
  return = output<string>();

  get defaultStatus() {
    return BookStatus.Default;
  }

  get lentStatus() {
    return BookStatus.Lent;
  }

  get borrowedStatus() {
    return BookStatus.Borrowed;
  }

  get libraryBorrowedStatus() {
    return BookStatus.LibraryBorrowed;
  }

  get orderedByOwnerAsc(): boolean | undefined {
    return this.bookOrder().owner_sort;
  }

  get orderedByTitleAsc(): boolean | undefined {
    return this.bookOrder().title_sort;
  }

  orderByOwner() {
    this.bookOrder.update((currentOrder) => ({
      owner_sort: !currentOrder.owner_sort,
    }));
  }

  orderByTitle() {
    this.bookOrder.update((currentOrder) => ({
      title_sort: !currentOrder.title_sort,
    }));
  }

  editBook(id: string) {
    this.edit.emit(id);
  }

  returnBook(id: string) {
    this.return.emit(id);
  }

  lendBook(id: string) {
    this.lend.emit(id);
  }

  deleteBook(id: string) {
    this.delete.emit(id);
  }
}
