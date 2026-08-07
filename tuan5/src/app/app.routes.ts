import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/users/users').then(m => m.UsersComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'login' }
];
