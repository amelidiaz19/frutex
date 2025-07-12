import { Routes } from '@angular/router';
import { NotFoundComponent } from './components/not-found/not-found.component';

export const routes: Routes = [
    {
      path: '',
      loadChildren: () => import('./shared/ecommerce.routes').then(m => m.ecommerceRoutes)
    },
    { path: '**', component: NotFoundComponent },
  ];
