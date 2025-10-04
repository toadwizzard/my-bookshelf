export enum BookStatus {
  Default,
  Lent,
  Borrowed,
  LibraryBorrowed,
  Wishlist,
}

export interface ShelvedBookInfo {
  id: number;
  bookKey: string;
  otherName: string | undefined | null;
  status: BookStatus;
  date: Date | undefined | null;
}
