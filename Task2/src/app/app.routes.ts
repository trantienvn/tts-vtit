import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'students',
    loadComponent: () =>
      import('./features/students/students.component').then(
        (m) => m.StudentsComponent
      ),
  },
  {
    path: 'rxjs-demo',
    loadComponent: () =>
      import('./features/rxjs-demo/rxjs-demo.component').then(
        (m) => m.RxjsDemoComponent
      ),
  },
  { path: '**', redirectTo: 'dashboard' }
];
