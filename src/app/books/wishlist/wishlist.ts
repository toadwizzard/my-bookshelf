import { Component, inject } from '@angular/core';
import { WishlistFilter } from './wishlist-filter/wishlist-filter';
import { WishlistTable } from './wishlist-table/wishlist-table';
import { BookService } from '../shared/book-service';
import { BookInfo } from '../shared/book-info';
import { stringMatches } from '../shared/utils';

@Component({
  selector: 'app-wishlist',
  imports: [WishlistFilter, WishlistTable],
  template: `
    <div class="bookshelf-container">
      <app-wishlist-filter (filter)="filterBooks($event)"/>
      <app-wishlist-table [books]="filteredBooks" />
    </div>
  `,
  styleUrl: "../shared/shelf-styles.css",
})
export class Wishlist {
  bookService = inject(BookService);
  books: BookInfo[] = [];
  filteredBooks: BookInfo[] = [];

  constructor() {
    this.books = this.bookService.getWishlistedBooks(1);
    this.filteredBooks = this.books;
  }

  filterBooks(filterValues: {title: string}){
    this.filteredBooks = this.books.filter(book => !filterValues.title || stringMatches(book.title, filterValues.title))
  }

}
