import { Injectable } from '@angular/core';
import { BookInfo, BookStatus } from './book-info';

interface BookInfoWithId extends BookInfo {
  ownerId: number
}

const books: BookInfoWithId[] = [
  {
    id: 1,
    ownerId: 1,
    title: "Book1",
    otherName: undefined,
    status: BookStatus.Default,
    date: undefined,
  },
  {
    id: 2,
    ownerId: 1,
    title: "Book1",
    otherName: undefined,
    status: BookStatus.Lent,
    date: undefined,
  },
  {
    id: 3,
    ownerId: 1,
    title: "Book3",
    otherName: "some borrower",
    status: BookStatus.Lent,
    date: new Date(2025,3,5),
  },
  {
    id: 4,
    ownerId: 1,
    title: "Book1",
    otherName: undefined,
    status: BookStatus.Borrowed,
    date: undefined,
  },
  {
    id: 5,
    ownerId: 1,
    title: "Book1",
    otherName: "some owner",
    status: BookStatus.Borrowed,
    date: new Date(2025,3,5),
  },
  {
    id: 6,
    ownerId: 1,
    title: "Book6",
    otherName: undefined,
    status: BookStatus.LibraryBorrowed,
    date: undefined,
  },
  {
    id: 7,
    ownerId: 1,
    title: "Book7",
    otherName: "some library",
    status: BookStatus.LibraryBorrowed,
    date: new Date(2025,3,5),
  },
  {
    id: 8,
    ownerId: 1,
    title: "Book8",
    otherName: undefined,
    status: BookStatus.Wishlist,
    date: undefined,
  },
  {
    id: 9,
    ownerId: 1,
    title: "Book9",
    otherName: undefined,
    status: BookStatus.Wishlist,
    date: undefined,
  },
  {
    id: 10,
    ownerId: 2,
    title: "Book1",
    otherName: undefined,
    status: BookStatus.Default,
    date: undefined,
  },
  {
    id: 11,
    ownerId: 2,
    title: "Book2",
    otherName: undefined,
    status: BookStatus.Lent,
    date: undefined,
  },
  {
    id: 12,
    ownerId: 2,
    title: "Book3",
    otherName: "some borrower",
    status: BookStatus.Lent,
    date: new Date(2025,3,5),
  },
  {
    id: 13,
    ownerId: 2,
    title: "Book4",
    otherName: undefined,
    status: BookStatus.Borrowed,
    date: undefined,
  },
  {
    id: 14,
    ownerId: 2,
    title: "Book5",
    otherName: "some owner",
    status: BookStatus.Borrowed,
    date: new Date(2025,3,5),
  },
  {
    id: 15,
    ownerId: 2,
    title: "Book6",
    otherName: undefined,
    status: BookStatus.LibraryBorrowed,
    date: undefined,
  },
  {
    id: 16,
    ownerId: 2,
    title: "Book7",
    otherName: "some library",
    status: BookStatus.LibraryBorrowed,
    date: new Date(2025,3,5),
  },
  {
    id: 17,
    ownerId: 2,
    title: "Book8",
    otherName: undefined,
    status: BookStatus.Wishlist,
    date: undefined,
  },
  {
    id: 18,
    ownerId: 2,
    title: "Book9",
    otherName: undefined,
    status: BookStatus.Wishlist,
    date: undefined,
  },
]

@Injectable({
  providedIn: 'root'
})
export class BookService {
  getShelvedBooks(userId: number): BookInfo[] {
    return books.filter(book => book.ownerId === userId && book.status !== BookStatus.Wishlist)
      .map(book => ({
        id: book.id,
        title: book.title,
        otherName: book.otherName,
        status: book.status,
        date: book.date
      }));
  };

  getWishlistedBooks(userId: number): BookInfo[] {
    return books.filter(book => book.ownerId === userId && book.status === BookStatus.Wishlist)
      .map(book => ({
        id: book.id,
        title: book.title,
        otherName: book.otherName,
        status: book.status,
        date: book.date
      }));
  }

  getBookById(userId: number, bookId: number): BookInfo | undefined {
    let book: BookInfoWithId | undefined =
      books.find(book => book.id === bookId && book.ownerId === userId);
    return book ? {
      id: book.id,
      title: book.title,
      otherName: book.otherName,
      status: book.status,
      date: book.date
    } : undefined
  }

  private getLargestBookId(): number {
    return books.reduce((acc, cur) => {
      if(acc.id === undefined)
        return cur;
      else if (cur.id === undefined)
        return acc;
      else return acc.id < cur.id ? cur : acc;
    }).id ?? 1;
  }

  addBook(userId: number, book: BookInfo): BookInfo {
    let otherName, date;
    if(book.status === BookStatus.Default || book.status === BookStatus.Wishlist){
      otherName = undefined;
      date = undefined;
    } else {
      otherName = book.otherName;
      date = book.date;
    }
    const newBook = {
      id: this.getLargestBookId() + 1,
      title: book.title,
      otherName: otherName,
      status: book.status,
      date: date
    };
    books.push({
      ...newBook,
      ownerId: userId
    });
    return newBook;
  }

  updateBook(userId: number, book: BookInfo): BookInfo | undefined {
    const bookIndex = books.findIndex(bk => bk.ownerId === userId && bk.id === book.id);
    if(bookIndex >= 0){
      books[bookIndex].title = book.title;
      books[bookIndex].status = book.status;
      if(book.status === BookStatus.Default || book.status === BookStatus.Wishlist){
        books[bookIndex].otherName = undefined;
        books[bookIndex].date = undefined;
      } else {
        books[bookIndex].otherName = book.otherName;
        books[bookIndex].date = book.date;
      }
      return books[bookIndex];
    }
    return undefined;
  }

  deleteBook(userId: number, bookId: number): boolean {
    const bookIndex = books.findIndex(book => book.ownerId === userId && book.id === bookId)
    if(bookIndex >= 0){
      books.splice(bookIndex, 1);
      return true;
    }
    return false;
  }
}
