import { Component, computed, input, output, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { ShelvedBookWithData } from '../../../models/shelved-book-with-data';

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
              orderAscend: orderedByTitleAsc(),
              orderDescend: orderedByTitleAsc() === false
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
        @if(orderedBooks().length === 0){
        <tr>
          <td class="empty-warning" colspan="3">
            No items to show. (Try adding a book first!)
          </td>
        </tr>
        } @for (book of orderedBooks(); track $index) {
        <tr>
          <td>{{ book.title }}</td>
          <td>{{ book.author_name.join(', ') }}</td>
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
        }
      </tbody>
    </table>
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
  orderedByTitleAsc = signal<true | false | undefined>(undefined);
  books = input<ShelvedBookWithData[]>([]);
  orderedBooks = computed<ShelvedBookWithData[]>(() => {
    if (this.orderedByTitleAsc() !== undefined) return this.getOrderByTitle();
    return this.books();
  });
  delete = output<number>();
  edit = output<number>();
  addToOwned = output<number>();

  orderByTitle() {
    this.orderedByTitleAsc.set(!this.orderedByTitleAsc());
  }

  private getOrderByTitle(): ShelvedBookWithData[] {
    return this.books().toSorted((a, b) =>
      this.orderedByTitleAsc()
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title)
    );
  }

  deleteBook(id: number) {
    this.delete.emit(id);
  }

  editBook(id: number) {
    this.edit.emit(id);
  }

  addBookToOwned(id: number) {
    this.addToOwned.emit(id);
  }
}
