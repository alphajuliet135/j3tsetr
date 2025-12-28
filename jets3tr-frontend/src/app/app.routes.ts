import { Routes } from '@angular/router';
import {TripPage} from './pages/trip/trip';
import {HomePage} from './pages/home/home';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.routes').then(m => m.WELCOME_ROUTES) },
  { path: 'trip', component: TripPage },
];
