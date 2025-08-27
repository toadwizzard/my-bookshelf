export enum BookStatus {
  Default,
  Lent,
  Borrowed,
  LibraryBorrowed,
  Wishlist,
}

export interface BookInfo {
  id: number,
  title: string,
  otherName: string | undefined,
  status: BookStatus,
  date: Date | undefined,
}
