import { formatDate } from '@angular/common';
import { ShelvedBookWithData } from '../models/shelved-book-with-data';
import { BookStatus } from '../models/shelved-book-info';

const dateFormat = 'y. MM. dd.';
const locale = 'en-US';

export function getOwnerNameFromBook(book: ShelvedBookWithData): string {
  if (book.status === BookStatus.Default || book.status === BookStatus.Lent)
    return 'Me';
  if (book.status === BookStatus.Borrowed)
    return book.otherName ? book.otherName : 'Other';
  if (book.status === BookStatus.LibraryBorrowed)
    return book.otherName ? book.otherName : 'Library';
  return '';
}

export function getStatusFromBook(book: ShelvedBookWithData): string {
  if (book.status === BookStatus.Lent)
    return (
      'Lent' +
      (book.otherName ? ` to ${book.otherName}` : '') +
      (book.date ? ` on ${formatDate(book.date, dateFormat, locale)}` : '')
    );
  if (book.status === BookStatus.Borrowed)
    return (
      'Borrowed' +
      (book.date ? ` on ${formatDate(book.date, dateFormat, locale)}` : '')
    );
  if (book.status === BookStatus.LibraryBorrowed)
    return (
      'Borrowed' +
      (book.date ? ` (due ${formatDate(book.date, dateFormat, locale)})` : '')
    );
  return '';
}

export function stringMatches(
  searchString: string,
  searchToken: string
): boolean {
  return searchString.toLowerCase().includes(searchToken.toLowerCase());
}
