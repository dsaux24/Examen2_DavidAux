import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ApiService } from './api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CardModule, InputTextModule, PasswordModule, ButtonModule, MessageModule],
  template: `
    <div class="auth-page">
      <p-card class="auth-card">
        <ng-template pTemplate="header">
          <div class="brand"><i class="pi pi-heart-fill"></i><h1>Hospital · Gestión de Usuarios</h1></div>
        </ng-template>
        <form (ngSubmit)="entrar()" class="form-col">
          <h2>Iniciar sesión</h2>
          <label for="id">Usuario (número de identificación)</label>
          <input pInputText id="id" name="id" [(ngModel)]="identificacion" required autocomplete="username" />
          <label for="pw">Contraseña</label>
          <p-password inputId="pw" name="pw" [(ngModel)]="contrasena" [feedback]="false" [toggleMask]="true"
                      styleClass="w-full" inputStyleClass="w-full" required />
          @if (error) { <p-message severity="error" [text]="error" /> }
          <p-button type="submit" label="Ingresar" icon="pi pi-sign-in" [loading]="cargando"
                    [disabled]="!identificacion || !contrasena" styleClass="w-full" />
          <p class="center">¿No tienes cuenta? <a routerLink="/registro">Regístrate</a></p>
        </form>
      </p-card>
    </div>
  `,
})
export class LoginComponent {
  identificacion = '';
  contrasena = '';
  error = '';
  cargando = false;

  constructor(private api: ApiService, private router: Router) {}

  entrar() {
    this.error = '';
    this.cargando = true;
    this.api.login(this.identificacion.trim(), this.contrasena).subscribe({
      next: (u) => {
        sessionStorage.setItem('usuario', JSON.stringify(u));
        this.router.navigate(['/usuarios']);
      },
      error: (e) => {
        this.cargando = false;
        this.error = e.status === 0
          ? 'No se pudo conectar con el servidor'
          : (e.error?.detail ?? 'Usuario o contraseña inválidos');
        if (e.status === 401) this.error += '. Si no tienes cuenta, regístrate.';
      },
    });
  }
}
