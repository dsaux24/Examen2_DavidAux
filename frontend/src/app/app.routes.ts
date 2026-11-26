import { Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { RegistroComponent } from './registro.component';
import { UsuariosComponent } from './usuarios.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];
