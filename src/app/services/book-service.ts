import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth-service';
import { BookResultInfo } from '../models/book-result-info';
import { catchError, map, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ShelvedBookInfo } from '../models/shelved-book-info';
import { ShelvedBookData } from '../models/shelved-book-data';
import { environment } from '../../environments/environment';
import { FormError } from '../helpers/form-error';
import { formatDate } from '@angular/common';
import { BookFilterValues } from '../models/book-filter-values';
import { BookOrderValues } from '../models/book-order-values';
import { ShelfPagination } from '../models/shelf-pagination';
import { BookStatus } from '../helpers/book-status';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  authService = inject(AuthService);
  http = inject(HttpClient);

  getShelvedBooks(
    shelfTransform:
      | (BookFilterValues & BookOrderValues & ShelfPagination)
      | undefined = undefined
  ): Observable<{
    books: ShelvedBookInfo[];
    page: number;
    last_page: number;
  }> {
    let params = new HttpParams();
    if (shelfTransform) {
      if (shelfTransform.owner)
        params = params.set('owner', shelfTransform.owner);
      if (shelfTransform.title)
        params = params.set('title', shelfTransform.title);
      if (shelfTransform.author)
        params = params.set('author', shelfTransform.author);
      const statusList: string[] = [];
      if (shelfTransform.onShelf) statusList.push(BookStatus.Default);
      if (shelfTransform.lent) statusList.push(BookStatus.Lent);
      if (shelfTransform.borrowed) statusList.push(BookStatus.Borrowed);
      if (shelfTransform.libraryBook)
        statusList.push(BookStatus.LibraryBorrowed);
      if (statusList.length > 0) {
        params = params.set('status', statusList.join(','));
      }
      if (shelfTransform.owner_sort !== undefined)
        params = params.set(
          'owner_sort',
          shelfTransform.owner_sort ? 'asc' : 'desc'
        );
      if (shelfTransform.title_sort !== undefined)
        params = params.set(
          'title_sort',
          shelfTransform.title_sort ? 'asc' : 'desc'
        );
      if (shelfTransform.page) params = params.set('page', shelfTransform.page);
      if (shelfTransform.limit)
        params = params.set('limit', shelfTransform.limit);
    }
    return this.http.get<{
      books: ShelvedBookInfo[];
      page: number;
      last_page: number;
    }>(`${environment.apiUrl}`, {
      params,
    });
  }

  getWishlistedBooks(
    shelfTransform:
      | (BookFilterValues & BookOrderValues & ShelfPagination)
      | undefined = undefined
  ): Observable<{
    books: ShelvedBookInfo[];
    page: number;
    last_page: number;
  }> {
    let params = new HttpParams();
    if (shelfTransform) {
      if (shelfTransform.title)
        params = params.set('title', shelfTransform.title);
      if (shelfTransform.author)
        params = params.set('author', shelfTransform.author);
      if (shelfTransform.title_sort !== undefined)
        params = params.set(
          'title_sort',
          shelfTransform.title_sort ? 'asc' : 'desc'
        );
      if (shelfTransform.page) params = params.set('page', shelfTransform.page);
      if (shelfTransform.limit)
        params = params.set('limit', shelfTransform.limit);
    }
    return this.http.get<{
      books: ShelvedBookInfo[];
      page: number;
      last_page: number;
    }>(`${environment.apiUrl}/wishlist`, {
      params,
    });
  }

  getBookById(
    bookId: string,
    isWishlist: boolean
  ): Observable<ShelvedBookData> {
    return this.http.get<ShelvedBookData>(
      `${environment.apiUrl}${isWishlist ? '/wishlist' : ''}/book/${bookId}`
    );
  }

  addBook(newBook: ShelvedBookData, isWishlist: boolean): Observable<boolean> {
    const book = this.formatBookDate(newBook);
    return this.http
      .post(`${environment.apiUrl}${isWishlist ? '/wishlist' : ''}`, book)
      .pipe(
        map((res) => true),
        catchError((err) => {
          if (err.status === 400) {
            const error = new FormError(
              err.error?.message,
              err.error?.errors?.map((e: { path: string; msg: string }) => ({
                field: e.path === 'book_key' ? 'bookData' : e.path,
                message: e.msg,
              })) ?? []
            );
            throw error;
          }
          throw err;
        })
      );
  }

  updateBook(
    bookId: string,
    shelvedBook: ShelvedBookData,
    isWishlist: boolean
  ): Observable<boolean> {
    const book = this.formatBookDate(shelvedBook);
    return this.http
      .patch(
        `${environment.apiUrl}${isWishlist ? '/wishlist' : ''}/book/${bookId}`,
        book
      )
      .pipe(
        map((res) => true),
        catchError((err) => {
          if (err.status === 400) {
            const error = new FormError(
              err.error?.message,
              err.error?.errors?.map((e: { path: string; msg: string }) => ({
                field: e.path === 'book_key' ? 'bookData' : e.path,
                message: e.msg,
              })) ?? []
            );
            throw error;
          }
          throw err;
        })
      );
  }

  deleteBook(shelvedBookId: string): Observable<boolean> {
    return this.http
      .delete(`${environment.apiUrl}/book/${shelvedBookId}`)
      .pipe(map((res) => true));
  }

  searchBooks(query: string): Observable<{ docs: BookResultInfo[] }> {
    const searchQuery = encodeURI(query);
    return this.http.get<{ docs: BookResultInfo[] }>(
      `${environment.apiUrl}/search?q=${searchQuery}`
    );
  }

  private formatBookDate(
    book: ShelvedBookData
  ): Omit<ShelvedBookData, 'date'> & { date?: string } {
    const { date, ...bookWithoutDate } = book;
    const formattedBook: Omit<ShelvedBookData, 'date'> & { date?: string } = {
      ...bookWithoutDate,
    };
    if (book.date) {
      formattedBook.date = formatDate(book.date, 'y-MM-dd', 'en-US');
    }
    return formattedBook;
  }
}
