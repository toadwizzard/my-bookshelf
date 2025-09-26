import { Component, computed, input, output, signal } from '@angular/core';
import { BookInfo } from '../../../models/book-info';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-wishlist-table',
  imports: [NgClass],
  template: `
    <table class="bookshelf">
      <thead>
        <tr>
          <th class="orderable title" [ngClass]="{
            orderAscend: orderedByTitleAsc(),
            orderDescend: orderedByTitleAsc() === false
          }"
          (click)="orderByTitle()"
          (keyup.enter)="orderByTitle()" tabindex=0>Title</th>
          <th class="actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        @if(orderedBooks().length === 0){
          <tr>
            <td class="empty-warning" colspan=2>No items to show. (Try adding a book first!)</td>
          </tr>
        }
        @for (book of orderedBooks(); track $index) {
          <tr>
            <td>{{book.title}}</td>
            <td>
              <div class="action-button-container">
                <button title="To owned" class="base-button icon-button green" (click)="addBookToOwned(book.id)">
                  <span class="material-icons">input</span>
                </button>
                <button title="Edit" class="base-button icon-button" (click)="editBook(book.id)">
                  <span class="material-icons">edit</span>
                </button>
                <button title="Remove" class="base-button icon-button red" (click)="deleteBook(book.id)">
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
      width: 85%;
    }
    .actions {
      width: 15%;
    }
  `,
  styleUrl: `../../shared/table-styles.css`,
})
export class WishlistTable {
  orderedByTitleAsc = signal<true | false | undefined>(undefined);
  books = input<BookInfo[]>([]);
  orderedBooks = computed<BookInfo[]>(() => {
    if(this.orderedByTitleAsc() !== undefined)
      return this.getOrderByTitle();
    return this.books();
  })
  delete = output<number>();
  edit = output<number>();
  addToOwned = output<number>();

  orderByTitle(){
    this.orderedByTitleAsc.set(!this.orderedByTitleAsc());
  }

  private getOrderByTitle(): BookInfo[]{
    return this.books().toSorted((a, b) =>
      this.orderedByTitleAsc() ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
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
