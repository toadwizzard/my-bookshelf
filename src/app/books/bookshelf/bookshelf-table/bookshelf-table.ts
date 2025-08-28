import { NgClass } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { BookInfo } from '../../shared/book-info';
import { getOwnerNameFromBook, getStatusFromBook } from '../../shared/utils';

@Component({
  selector: 'app-bookshelf-table',
  imports: [NgClass],
  template: `
    <table class="bookshelf">
      <thead>
        <tr>
          <th class="orderable owner" [ngClass]="{
            orderAscend: orderedByOwnerAsc(),
            orderDescend: orderedByOwnerAsc() === false
          }" (click)="orderByOwner()">Owner</th>
          <th class="orderable title" [ngClass]="{
            orderAscend: orderedByTitleAsc(),
            orderDescend: orderedByTitleAsc() === false
          }" (click)="orderByTitle()">Title</th>
          <th class="status">Status</th>
          <th class="actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        @for (book of orderedBooks(); track $index) {
          <tr>
            <td>{{getOwnerNameFromBook(book)}}</td>
            <td>{{book.title}}</td>
            <td>{{getStatusFromBook(book)}}</td>
            <td>actions</td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    .owner {
      width: 20%;
    }
    .title {
      width: 30%;
    }
    .status {
      width: 35%;
    }
    .actions {
      width: 10%;
    }
  `,
  styleUrl: `../../shared/table-styles.css`,
})
export class BookshelfTable {
  orderedByOwnerAsc = signal<true | false | undefined>(undefined);
  orderedByTitleAsc = signal<true | false | undefined>(undefined);
  books = input<BookInfo[]>([]);
  orderedBooks = computed<BookInfo[]>(() => {
    if(this.orderedByOwnerAsc() !== undefined)
      return this.getOrderByOwner();
    if(this.orderedByTitleAsc() !== undefined)
      return this.getOrderByTitle();
    return this.books();
  })

  getOwnerNameFromBook(book: BookInfo): string {
    return getOwnerNameFromBook(book);
  }

  getStatusFromBook(book: BookInfo): string {
    return getStatusFromBook(book);
  }

  orderByOwner(){
    this.orderedByTitleAsc.set(undefined);
    this.orderedByOwnerAsc.set(!this.orderedByOwnerAsc());
  }

  private getOrderByOwner(): BookInfo[]{
    return this.books().toSorted((a, b) =>
      this.orderedByOwnerAsc() ?
      getOwnerNameFromBook(a).localeCompare(getOwnerNameFromBook(b)) :
      getOwnerNameFromBook(b).localeCompare(getOwnerNameFromBook(a))
    );
  }

  orderByTitle(){
    this.orderedByOwnerAsc.set(undefined);
    this.orderedByTitleAsc.set(!this.orderedByTitleAsc());
  }

  private getOrderByTitle(): BookInfo[]{
    return this.books().toSorted((a, b) =>
      this.orderedByTitleAsc() ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );
  }
}
