import { Component, input, model, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { ShelvedBookInfo } from '../../../models/shelved-book-info';
import { BookOrderValues } from '../../../models/book-order-values';

@Component({
  selector: 'app-wishlist-table',
  imports: [NgClass],
  template: `
    <table class="bookshelf">
      <thead>
        <tr>
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
          <th class="actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        @if(!loading()){ @if(books().length === 0){
        <tr>
          <td class="empty-warning" colspan="3">
            No items to show. (Try adding a book first!)
          </td>
        </tr>
        } @for (book of books(); track $index) {
        <tr>
          <td>{{ book.title }}</td>
          <td>{{ book.author.join(', ') }}</td>
          <td>
            <div class="action-button-container">
              <button
                title="To owned"
                class="base-button icon-button green"
                (click)="addBookToOwned(book.id)"
              >
                <span class="material-icons">input</span>
              </button>
              <button
                title="Edit"
                class="base-button icon-button"
                (click)="editBook(book.id)"
              >
                <span class="material-icons">edit</span>
              </button>
              <button
                title="Remove"
                class="base-button icon-button red"
                (click)="deleteBook(book.id)"
              >
                <span class="material-icons">delete</span>
              </button>
            </div>
          </td>
        </tr>
        }}
      </tbody>
    </table>
    @if(loading()){
    <p class="loading">Loading...</p>
    }
  `,
  styles: `
    .title {
      width: 45%;
    }
    .author {
      width: 40%;
    }
    .actions {
      width: 15%;
    }
  `,
  styleUrl: `../../shared/table-styles.css`,
})
export class WishlistTable {
  bookOrder = model<BookOrderValues>({});
  books = input<ShelvedBookInfo[]>([]);
  loading = input<boolean>(false);
  delete = output<string>();
  edit = output<string>();
  addToOwned = output<string>();

  get orderedByTitleAsc(): boolean | undefined {
    return this.bookOrder().title_sort;
  }

  orderByTitle() {
    this.bookOrder.update((currentOrder) => ({
      title_sort: !currentOrder.title_sort,
    }));
  }

  deleteBook(id: string) {
    this.delete.emit(id);
  }

  editBook(id: string) {
    this.edit.emit(id);
  }

  addBookToOwned(id: string) {
    this.addToOwned.emit(id);
  }
}
