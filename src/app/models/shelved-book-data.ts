import { BookStatus } from '../helpers/book-status';

export interface ShelvedBookData {
  id?: string;
  status: BookStatus;
  book_key: string;
  title?: string;
  author?: string[];
  other_name?: string;
  date?: Date;
}
