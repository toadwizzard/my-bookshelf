import { BookStatus } from '../helpers/book-status';

export interface ShelvedBookInfo {
  id: string;
  status: BookStatus;
  author: string[];
  title: string;
  full_status: string;
  owner_name: string;
}
