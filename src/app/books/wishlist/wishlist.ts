import { Component, inject, viewChild } from '@angular/core';
import { WishlistFilter } from './wishlist-filter/wishlist-filter';
import { WishlistTable } from './wishlist-table/wishlist-table';
import { BookService } from '../shared/book-service';
import { BookInfo, BookStatus } from '../shared/book-info';
import { stringMatches } from '../shared/utils';
import { Dialog } from '@angular/cdk/dialog';
import { WishlistFormDialog } from './wishlist-form-dialog/wishlist-form-dialog';

@Component({
  selector: 'app-wishlist',
  imports: [WishlistFilter, WishlistTable],
  template: `
    <div class="bookshelf-container">
      <div class="bookshelf-top">
        <app-wishlist-filter (filter)="filterBooks($event)"/>
        <button (click)="openAddBookDialog()" class="base-button icon-button" title="Add book">
          <span class="material-icons">add</span>
        </button>
      </div>
      <app-wishlist-table [books]="filteredBooks"
        (edit)="openEditBookDialog($event)"
        (addToOwned)="addBookToOwned($event)"
        (delete)="deleteBook($event)"/>
    </div>
  `,
  styleUrl: "../shared/shelf-styles.css",
})
export class Wishlist {
  bookService = inject(BookService);
  bookFilter = viewChild(WishlistFilter);

  bookFormDialog = inject(Dialog);

  books: BookInfo[] = [];
  filteredBooks: BookInfo[] = [];

  constructor() {
    this.books = this.bookService.getWishlistedBooks();
    this.filteredBooks = this.books;
  }

  filterBooks(filterValues: {title: string}){
    this.filteredBooks = this.books.filter(book => !filterValues.title || stringMatches(book.title, filterValues.title))
  }

  openAddBookDialog(){
    const addBookDialogRef = this.bookFormDialog.open<string>(WishlistFormDialog, {
      width: '400px'
    });

    addBookDialogRef.closed.subscribe(result => {
      if(result){
        const addedBook = this.bookService.addBook({
          id: -1,
          title: result,
          status: BookStatus.Wishlist,
          otherName: undefined,
          date: undefined
        });
        if(addedBook){
          this.books.push(addedBook);
          this.bookFilter()?.filterBooks();
        }
      }
    })
  }

  openEditBookDialog(id: number){
    const book = this.bookService.getBookById(id);
    if(!book)
      return;
    const editBookDialogRef = this.bookFormDialog.open<string>(WishlistFormDialog, {
      width: '400px',
      data: {title: book.title}
    })

    editBookDialogRef.closed.subscribe(result => {
      if(result && book.title !== result) {
        const editedBook = this.bookService.updateBook({
          ...book,
          title: result
        });
        if(editedBook){
          const modifiedIndex = this.findBookIndex(editedBook);
          if(modifiedIndex >= 0){
            this.books[modifiedIndex] = editedBook;
            this.bookFilter()?.filterBooks();
          }
        }
      }
    })
  }

  addBookToOwned(id: number){
    const originalBook = this.bookService.getBookById(id);
    if(!originalBook || originalBook.status !== BookStatus.Wishlist)
      return;
    const toOwnedBook = this.bookService.updateBook({
      ...originalBook,
      status: BookStatus.Default,
      otherName: undefined,
      date: undefined
    });
    if(toOwnedBook){
      const ownedIndex = this.findBookIndex(toOwnedBook);
      if(ownedIndex >= 0){
        this.books.splice(ownedIndex, 1);
        this.bookFilter()?.filterBooks();
      }
    }
  }

  deleteBook(id: number){
    if(this.bookService.deleteBook(id)){
      this.books = this.bookService.getWishlistedBooks();
      this.bookFilter()?.filterBooks();
    }
  }

  private findBookIndex(book: BookInfo): number {
    return this.books.findIndex(bk => bk.id === book.id);
  }

}
