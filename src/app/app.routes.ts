import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AutoresComponent } from './components/autores/autores.component';
import { LibrosComponent } from './components/libros/libros.component';
import { PrestamosComponent } from './components/prestamos/prestamos.component';
import { ReportesComponent } from './components/reportes/reportes.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'autores', component: AutoresComponent, canActivate: [authGuard] },
  { path: 'libros', component: LibrosComponent, canActivate: [authGuard] },
  { path: 'prestamos', component: PrestamosComponent, canActivate: [authGuard] },
  { path: 'reportes', component: ReportesComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
