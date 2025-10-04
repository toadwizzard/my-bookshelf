import { inject, Injectable } from '@angular/core';
import { BookInfo } from '../models/book-info';
import { AuthService } from './auth-service';
import { UserService } from './user-service';
import { BookResultInfo } from '../models/book-result-info';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BookStatus, ShelvedBookInfo } from '../models/shelved-book-info';
import { ShelvedBookWithData } from '../models/shelved-book-with-data';

export interface ShelvedBookInfoWithId extends ShelvedBookInfo {
  ownerId: number;
}

const books: BookInfo[] = [
  {
    bookKey: '/works/OL492658W',
    title: 'The Lightning Thief',
    author_name: ['Rick Riordan'],
  },
  {
    bookKey: '/works/OL492646W',
    title: 'The Sea of Monsters',
    author_name: ['Rick Riordan'],
  },
  {
    bookKey: '/works/OL17054790W',
    title: "Percy Jackson's Greek Gods",
    author_name: ['Rick Riordan'],
  },
  {
    bookKey: '/works/OL24372071W',
    title: 'The Wizard of Oz',
    author_name: ['L. Frank Baum', 'Harold Arlen', 'E Y Harburg'],
  },
  {
    bookKey: '/works/OL52987W',
    title: 'The Very Hungry Caterpillar',
    author_name: ['Eric Carle'],
  },
  {
    bookKey: '/works/OL27448W',
    title: 'The Lord of the Rings',
    author_name: ['J.R.R. Tolkien'],
  },
  {
    bookKey: '/works/OL5735363W',
    title: 'The Hunger Games',
    author_name: ['Suzanne Collins'],
  },
];

const shelvedBooks: ShelvedBookInfoWithId[] = [
  {
    ownerId: 1,
    id: 1,
    bookKey: '/works/OL492658W',
    otherName: undefined,
    status: BookStatus.Default,
    date: undefined,
  },
  {
    ownerId: 1,
    id: 2,
    bookKey: '/works/OL492646W',
    otherName: undefined,
    status: BookStatus.Lent,
    date: undefined,
  },
  {
    ownerId: 1,
    id: 3,
    bookKey: '/works/OL17054790W',
    otherName: 'Example borrower',
    status: BookStatus.Lent,
    date: new Date(2025, 1, 15),
  },
  {
    ownerId: 1,
    id: 4,
    bookKey: '/works/OL24372071W',
    otherName: undefined,
    status: BookStatus.Borrowed,
    date: undefined,
  },
  {
    ownerId: 1,
    id: 5,
    bookKey: '/works/OL52987W',
    otherName: 'Example lender',
    status: BookStatus.Borrowed,
    date: new Date(2025, 2, 28),
  },
  {
    ownerId: 1,
    id: 6,
    bookKey: '/works/OL27448W',
    otherName: undefined,
    status: BookStatus.LibraryBorrowed,
    date: undefined,
  },
  {
    ownerId: 1,
    id: 7,
    bookKey: '/works/OL5735363W',
    otherName: 'Example library',
    status: BookStatus.LibraryBorrowed,
    date: new Date(2025, 3, 17),
  },
];

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private OL_BASE_URL = 'https://openlibrary.org';

  authService = inject(AuthService);
  http = inject(HttpClient);

  getShelvedBooks(): ShelvedBookWithData[] {
    const userId = this.handleAuthentication();
    if (userId === undefined) return [];
    return shelvedBooks
      .filter(
        (shelvedBook) =>
          shelvedBook.ownerId === userId &&
          shelvedBook.status !== BookStatus.Wishlist
      )
      .map((shelvedBook) => {
        const bookData = books.find(
          (book) => book.bookKey === shelvedBook.bookKey
        );
        if (!bookData) return undefined;
        return { ...shelvedBook, ...bookData } as ShelvedBookWithData;
      })
      .filter(Boolean) as ShelvedBookWithData[];
  }

  getWishlistedBooks(): ShelvedBookWithData[] {
    const userId = this.handleAuthentication();
    if (userId === undefined) return [];
    return shelvedBooks
      .filter(
        (shelvedBook) =>
          shelvedBook.ownerId === userId &&
          shelvedBook.status === BookStatus.Wishlist
      )
      .map((shelvedBook) => {
        const bookData = books.find(
          (book) => book.bookKey === shelvedBook.bookKey
        );
        if (!bookData) return undefined;
        return { ...shelvedBook, ...bookData } as ShelvedBookWithData;
      })
      .filter(Boolean) as ShelvedBookWithData[];
  }

  getShelvedBookById(bookId: number): ShelvedBookWithData | undefined {
    const userId = this.handleAuthentication();
    if (userId === undefined) return undefined;
    const shelvedBook: ShelvedBookInfo | undefined = shelvedBooks.find(
      (shelvedBook) =>
        shelvedBook.id === bookId && shelvedBook.ownerId === userId
    );
    const book: BookInfo | undefined = books.find(
      (book) => book.bookKey === shelvedBook?.bookKey
    );
    return shelvedBook && book ? { ...shelvedBook, ...book } : undefined;
  }

  private getLargestShelvedBookId(): number {
    return shelvedBooks.reduce((acc, cur) => (acc.id < cur.id ? cur : acc), {
      id: 0,
    }).id;
  }

  addShelvedBook(
    shelvedBook: ShelvedBookWithData
  ): ShelvedBookWithData | undefined {
    const userId = this.handleAuthentication();
    if (userId === undefined) return undefined;
    let otherName, date;
    if (
      shelvedBook.status === BookStatus.Default ||
      shelvedBook.status === BookStatus.Wishlist
    ) {
      otherName = undefined;
      date = undefined;
    } else {
      otherName = shelvedBook.otherName;
      date = shelvedBook.date;
    }
    if (!this.bookWithKeyExists(shelvedBook.bookKey)) {
      books.push({
        bookKey: shelvedBook.bookKey,
        title: shelvedBook.title,
        author_name: shelvedBook.author_name,
      });
    }
    const shelvedBookId = this.getLargestShelvedBookId() + 1;
    const newShelvedBook: ShelvedBookInfo = {
      id: shelvedBookId,
      bookKey: shelvedBook.bookKey,
      otherName: otherName,
      status: shelvedBook.status,
      date: date,
    };
    shelvedBooks.push({
      ...newShelvedBook,
      ownerId: userId,
    });
    return {
      ...shelvedBook,
      id: shelvedBookId,
    };
  }

  updateShelvedBook(
    shelvedBook: ShelvedBookWithData
  ): ShelvedBookWithData | undefined {
    const userId = this.handleAuthentication();
    if (userId === undefined) return undefined;
    const bookIndex = shelvedBooks.findIndex(
      (bk) => bk.ownerId === userId && bk.id === shelvedBook.id
    );
    if (bookIndex >= 0) {
      if (!this.bookWithKeyExists(shelvedBook.bookKey)) {
        books.push({
          bookKey: shelvedBook.bookKey,
          title: shelvedBook.title,
          author_name: shelvedBook.author_name,
        });
      }
      shelvedBooks[bookIndex].bookKey = shelvedBook.bookKey;
      shelvedBooks[bookIndex].status = shelvedBook.status;
      if (
        shelvedBook.status === BookStatus.Default ||
        shelvedBook.status === BookStatus.Wishlist
      ) {
        shelvedBooks[bookIndex].otherName = undefined;
        shelvedBooks[bookIndex].date = undefined;
      } else {
        shelvedBooks[bookIndex].otherName = shelvedBook.otherName;
        shelvedBooks[bookIndex].date = shelvedBook.date;
      }
      return {
        ...shelvedBooks[bookIndex],
        title: shelvedBook.title,
        author_name: shelvedBook.author_name,
      };
    }
    return undefined;
  }

  deleteShelvedBook(shelvedBookId: number): boolean {
    const userId = this.handleAuthentication();
    if (userId === undefined) return false;
    const bookIndex = shelvedBooks.findIndex(
      (book) => book.ownerId === userId && book.id === shelvedBookId
    );
    if (bookIndex >= 0) {
      shelvedBooks.splice(bookIndex, 1);
      return true;
    }
    return false;
  }

  searchBooks(query: string): Observable<{ docs: BookResultInfo[] }> {
    const searchQuery = encodeURI(query);
    return this.http.get<{ docs: BookResultInfo[] }>(
      `${this.OL_BASE_URL}/search.json?q=${searchQuery}&fields=key,title,author_name`
    );
  }

  private bookWithKeyExists(bookKey: string): boolean {
    return books.some((book) => book.bookKey === bookKey);
  }

  //stand in for 401 http responses
  userService = inject(UserService);
  private handleAuthentication(): number | undefined {
    return this.userService.handleAuthentication();
  }
}
