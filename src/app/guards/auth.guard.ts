import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Usamos authStateReady$ que solo emite cuando el estado de autenticación está determinado
  return authService.authStateReady$.pipe(
    take(1),
    map(user => {
      const isLoginPage = state.url === '/login';
      
      if (user && isLoginPage) {
        router.navigate(['/dashboard']);
        return false;
      }
      
      if (!user && !isLoginPage) {
        router.navigate(['/login']);
        return false;
      }
      
      return true;
    })
  );
};

export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Usamos authStateReady$ que solo emite cuando el estado de autenticación está determinado
  return authService.authStateReady$.pipe(
    take(1),
    map(user => {
      if (user) {
        router.navigate(['/dashboard']);
        return false;
      }
      return true;
    })
  );
};
