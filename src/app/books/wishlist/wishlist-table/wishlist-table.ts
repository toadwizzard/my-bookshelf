import { Component, computed, input, signal } from '@angular/core';
import { BookInfo } from '../../shared/book-info';
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
          }" (click)="orderByTitle()">Title</th>
          <th class="actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        @for (book of orderedBooks(); track $index) {
          <tr>
            <td>{{book.title}}</td>
            <td>actions</td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    .title {
      width: 90%;
    }
    .actions {
      width: 10%;
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

  orderByTitle(){
    this.orderedByTitleAsc.set(!this.orderedByTitleAsc());
  }

  private getOrderByTitle(): BookInfo[]{
    return this.books().toSorted((a, b) =>
      this.orderedByTitleAsc() ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );
  }
}
