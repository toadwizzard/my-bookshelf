import { Routes } from '@angular/router';
import { Bookshelf } from './books/bookshelf/bookshelf';
import { Wishlist } from './books/wishlist/wishlist';
import { Profile } from './user/profile/profile';
import { Login } from './user/login/login';
import { Register } from './user/register/register';
import { authGuard } from './helpers/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: Bookshelf,
    title: 'My Bookshelf',
    canActivate: [authGuard],
  },
  {
    path: 'wishlist',
    component: Wishlist,
    title: 'My Wishlist',
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    component: Profile,
    title: 'Profile',
    canActivate: [authGuard],
  },
  {
    path: 'login',
    component: Login,
    title: 'Log in',
    canActivate: [authGuard],
  },
  {
    path: 'register',
    component: Register,
    title: 'Register',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
