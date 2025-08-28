import { BookInfo, BookStatus } from "./book-info";

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
    + (book.date ? ` on ${formatDate(book.date)}` : "");
  if(book.status === BookStatus.Borrowed)
    return "Borrowed" + (book.date ? ` on ${formatDate(book.date)}` : "");
  if(book.status === BookStatus.LibraryBorrowed)
    return "Borrowed" + (book.date ? ` (due ${formatDate(book.date)})` : "");
  return "";
}

export function formatDate(date: Date): string {
  return date.getFullYear().toString() + ". "
    + date.getMonth().toString().padStart(2, "0") + ". "
    + date.getDate().toString().padStart(2, "0") + ".";
}

export function stringMatches(searchString: string, searchToken: string): boolean {
  return searchString.toLowerCase().includes(searchToken.toLowerCase());
}
