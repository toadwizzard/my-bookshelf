import { Component, inject, viewChild } from '@angular/core';
import { BookService } from '../../services/book-service';
import { BookInfo, BookStatus } from '../../models/book-info';
import { BookshelfFilter, BookshelfFilterValues } from './bookshelf-filter/bookshelf-filter';
import { BookshelfTable } from './bookshelf-table/bookshelf-table';
import { getOwnerNameFromBook, stringMatches } from '../../helpers/utils';
import { Dialog } from '@angular/cdk/dialog';
import { BookshelfFormDialog } from './bookshelf-form-dialog/bookshelf-form-dialog';

@Component({
  selector: 'app-bookshelf',
  imports: [BookshelfFilter, BookshelfTable],
  template: `
    <div class="bookshelf-container">
      <div class="bookshelf-top">
        <app-bookshelf-filter (filter)="filterBooks($event)"/>
        <button (click)="openAddBookDialog()" class="base-button icon-button" title="Add book">
          <span class="material-icons">add</span>
        </button>
      </div>
      <app-bookshelf-table [books]="filteredBooks"
        (edit)="openEditBookDialog($event, false)"
        (return)="returnBook($event)"
        (lend)="openEditBookDialog($event, true)"
        (delete)="deleteBook($event)"
      />
    </div>
  `,
  styleUrl: "../shared/shelf-styles.css",
})
export class Bookshelf {
  bookService = inject(BookService);
  bookFilter = viewChild(BookshelfFilter);

  books: BookInfo[] = [];
  filteredBooks: BookInfo[] = [];

  bookFormDialog = inject(Dialog);

  constructor() {
    this.books = this.bookService.getShelvedBooks();
    this.filteredBooks = this.books;
  }

  filterBooks(filterValues: BookshelfFilterValues){
    this.filteredBooks = this.books.filter(book =>
      (!filterValues.hasCheck || (
        (filterValues.onShelf && book.status === BookStatus.Default) ||
        (filterValues.lent && book.status === BookStatus.Lent) ||
        (filterValues.borrowed && book.status === BookStatus.Borrowed) ||
        (filterValues.libraryBook && book.status === BookStatus.LibraryBorrowed)
      ) &&
      (!filterValues.owner || stringMatches(getOwnerNameFromBook(book), filterValues.owner)) &&
      (!filterValues.title || stringMatches(book.title, filterValues.title))
      )
    )
  }

  openAddBookDialog(){
    const addBookDialogRef = this.bookFormDialog.open<BookInfo>(BookshelfFormDialog, {
      width: '800px'
    });

    addBookDialogRef.closed.subscribe(result => {
      if(result){
        const addedBook = this.bookService.addBook(result);
        if(addedBook){
          this.books.push(addedBook);
          this.bookFilter()?.filterBooks();
        }
      }
    })
  }

  openEditBookDialog(id: number, isLend: boolean){
    const book = this.bookService.getBookById(id);
    if(!book)
      return;
    const editBookDialogRef = this.bookFormDialog.open<BookInfo>(BookshelfFormDialog, {
      width: '400px',
      data: {book, isLend}
    })

    editBookDialogRef.closed.subscribe(result => {
      if(result && (
        book.title !== result.title ||
        book.status !== result.status ||
        book.otherName !== result.otherName ||
        book.date !== result.date
      )) {
        result.id = book.id;
        const editedBook = this.bookService.updateBook(result);
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

  returnBook(id: number){
    const originalBook = this.bookService.getBookById(id);
    if(!originalBook || originalBook.status !== BookStatus.Lent)
      return;
    const returnedBook = this.bookService.updateBook({
      ...originalBook,
      status: BookStatus.Default,
      otherName: undefined,
      date: undefined
    });
    if(returnedBook){
      const returnedIndex = this.findBookIndex(returnedBook);
      if(returnedIndex >= 0){
        this.books[returnedIndex] = returnedBook;
        this.bookFilter()?.filterBooks();
      }
    }
  }

  deleteBook(id: number){
    if(this.bookService.deleteBook(id)){
      this.books = this.bookService.getShelvedBooks();
      this.bookFilter()?.filterBooks();
    }
  }

  private findBookIndex(book: BookInfo): number {
    return this.books.findIndex(bk => bk.id === book.id);
  }
}
