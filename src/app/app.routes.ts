import { Routes } from '@angular/router';
import { Bookshelf } from './books/bookshelf/bookshelf';
import { Wishlist } from './books/wishlist/wishlist';
import { Profile } from './user/profile/profile';
import { Login } from './user/login/login';
import { Register } from './user/register/register';
import { authenticatedToActivate } from './user/shared/auth-service';

export const routes: Routes = [
  {
    path: '',
    component: Bookshelf,
    title: 'My Bookshelf',
    canActivate: [authenticatedToActivate],
  },
  {
    path: 'wishlist',
    component: Wishlist,
    title: 'My Wishlist',
    canActivate: [authenticatedToActivate],
  },
  {
    path: 'profile',
    component: Profile,
    title: 'Profile',
    canActivate: [authenticatedToActivate],
  },
  {
    path: 'login',
    component: Login,
    title: 'Log in'
  },
  {
    path: 'register',
    component: Register,
    title: 'Register'
  },
  {
    path: '**',
    redirectTo: '/login',
  }
];
