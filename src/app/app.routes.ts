import { Routes } from '@angular/router';
import { Bookshelf } from './books/bookshelf/bookshelf';
import { Wishlist } from './books/wishlist/wishlist';
import { Profile } from './profile/profile';

export const routes: Routes = [
  {
    path: '',
    component: Bookshelf,
    title: 'My Bookshelf'
  },
  {
    path: 'wishlist',
    component: Wishlist,
    title: 'My Wishlist'
  },
  {
    path: 'profile',
    component: Profile,
    title: 'Profile'
  }
];
