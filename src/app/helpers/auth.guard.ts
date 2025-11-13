import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const authGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  if (
    !authService.isLoggedIn() &&
    (route.url.length === 0 || route.url[0].path !== 'login')
  ) {
    const loginPath = router.parseUrl('/login');
    return new RedirectCommand(loginPath);
  } else if (
    authService.isLoggedIn() &&
    route.url.length > 0 &&
    route.url[0].path === 'login'
  ) {
    const homePagePath = router.parseUrl('/');
    return new RedirectCommand(homePagePath);
  }
  return true;
};
