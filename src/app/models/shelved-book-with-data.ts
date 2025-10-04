import { BookInfo } from './book-info';
import { ShelvedBookInfo } from './shelved-book-info';

export interface ShelvedBookWithData extends BookInfo, ShelvedBookInfo {}
