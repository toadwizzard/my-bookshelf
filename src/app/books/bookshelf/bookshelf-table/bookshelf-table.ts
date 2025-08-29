import { NgClass } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { BookInfo, BookStatus } from '../../shared/book-info';
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
            <td>
              <div class="action-button-container">
                @if (book.status === defaultStatus){
                  <button title="Lend" class="base-button icon-button green" (click)="lendBook(book.id)">
                    <span class="material-icons">output</span>
                  </button>
                }
                @if (book.status === borrowedStatus || book.status === libraryBorrowedStatus) {
                  <button title="Return to owner" class="base-button icon-button green" (click)="deleteBook(book.id)">
                    <span class="material-icons">output</span>
                  </button>
                }
                @if (book.status === lentStatus) {
                  <button title="Return to me" class="base-button icon-button green" (click)="returnBook(book.id)">
                    <span class="material-icons">input</span>
                  </button>
                }
                <button title="Edit" class="base-button icon-button" (click)="editBook(book.id)">
                  <span class="material-icons">edit</span>
                </button>
                @if (book.status === defaultStatus || book.status === lentStatus) {
                  <button title="Delete" class="base-button icon-button red" (click)="deleteBook(book.id)">
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
      width: 20%;
    }
    .title {
      width: 25%;
    }
    .status {
      width: 30%;
    }
    .actions {
      width: 15%;
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
  delete = output<number>();
  edit = output<number>();
  lend = output<number>();
  return = output<number>();

  get defaultStatus(){
    return BookStatus.Default;
  }

  get lentStatus(){
    return BookStatus.Lent;
  }

  get borrowedStatus(){
    return BookStatus.Borrowed;
  }

  get libraryBorrowedStatus(){
    return BookStatus.LibraryBorrowed;
  }

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

  editBook(id: number){
    this.edit.emit(id);
  }

  returnBook(id: number){
    this.return.emit(id);
  }

  lendBook(id: number){
    this.lend.emit(id);
  }

  deleteBook(id: number){
    this.delete.emit(id);
  }
}
