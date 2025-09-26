import { formatDate } from "@angular/common";
import { BookInfo, BookStatus } from "../models/book-info";

const dateFormat = "y. MM. dd.";
const locale = "en-US";

export function getOwnerNameFromBook(book: BookInfo): string {
  if(book.status === BookStatus.Default || book.status === BookStatus.Lent)
    return "Me";
  if(book.status === BookStatus.Borrowed)
    return book.otherName ? book.otherName : "Other";
  if(book.status === BookStatus.LibraryBorrowed)
    return book.otherName ? book.otherName : "Library";
  return "";
}

export function getStatusFromBook(book: BookInfo): string {
  if(book.status === BookStatus.Lent)
    return "Lent" + (book.otherName ? ` to ${book.otherName}` : "")
    + (book.date ? ` on ${formatDate(book.date, dateFormat, locale)}` : "");
  if(book.status === BookStatus.Borrowed)
    return "Borrowed" + (book.date ? ` on ${formatDate(book.date, dateFormat, locale)}` : "");
  if(book.status === BookStatus.LibraryBorrowed)
    return "Borrowed" + (book.date ? ` (due ${formatDate(book.date, dateFormat, locale)})` : "");
  return "";
}

export function stringMatches(searchString: string, searchToken: string): boolean {
  return searchString.toLowerCase().includes(searchToken.toLowerCase());
}
