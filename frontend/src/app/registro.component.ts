import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ApiService, Usuario } from './api.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink, CardModule, InputTextModule, PasswordModule, SelectModule, ButtonModule],
  template: `
    <div class="auth-page">
      <p-card class="auth-card wide">
        <ng-template pTemplate="header">
          <div class="brand"><i class="pi pi-user-plus"></i><h1>Registro de nuevo usuario</h1></div>
        </ng-template>
        <form #f="ngForm" (ngSubmit)="registrar(f.valid)" class="grid-form">
          <div class="field"><label>Identificación</label>
            <input pInputText name="identificacion" #idc="ngModel" [(ngModel)]="u.identificacion" required pattern="[0-9]{5,15}" />
            @if (idc.invalid && (idc.dirty || idc.touched)) { <small class="err">Solo números, entre 5 y 15 dígitos</small> }</div>
          <div class="field"><label>Nombre</label>
            <input pInputText name="nombre" [(ngModel)]="u.nombre" required /></div>
          <div class="field"><label>Apellido</label>
            <input pInputText name="apellido" [(ngModel)]="u.apellido" required /></div>
          <div class="field"><label>Email</label>
            <input pInputText type="email" name="email" #em="ngModel" [(ngModel)]="u.email" required email />
            @if (em.invalid && (em.dirty || em.touched)) { <small class="err">Ingrese un correo válido</small> }</div>
          <div class="field"><label>Cargo</label>
            <p-select name="cargo" [options]="cargos" [(ngModel)]="u.cargo" placeholder="Seleccione un cargo"
                      styleClass="w-full" required /></div>
          <div class="field"><label>Teléfono</label>
            <input pInputText name="telefono" #tel="ngModel" [(ngModel)]="u.telefono" required pattern="[0-9+ ]{7,15}" />
            @if (tel.invalid && (tel.dirty || tel.touched)) { <small class="err">Teléfono válido (7 a 15 dígitos)</small> }</div>
          <div class="field"><label>Nombre de usuario</label>
            <input pInputText name="nombre_usuario" [(ngModel)]="u.nombre_usuario" required /></div>
          <div class="field"><label>Contraseña</label>
            <p-password name="contrasena" #pw="ngModel" [(ngModel)]="u.contrasena" [toggleMask]="true"
                        styleClass="w-full" inputStyleClass="w-full" required minlength="6" />
            @if (pw.invalid && (pw.dirty || pw.touched)) { <small class="err">Mínimo 6 caracteres</small> }</div>
          <div class="actions full">
            <p-button type="button" label="Volver al login" severity="secondary" icon="pi pi-arrow-left" routerLink="/login" />
            <p-button type="submit" label="Registrarme" icon="pi pi-check" [loading]="cargando" />
          </div>
        </form>
      </p-card>
    </div>
  `,
})
export class RegistroComponent {
  cargos = ['Doctor', 'Especialista', 'Administrativo'];
  cargando = false;
  u: Usuario = {
    identificacion: '', nombre: '', apellido: '', email: '',
    cargo: undefined as any, telefono: '', nombre_usuario: '', contrasena: '',
  };

  constructor(private api: ApiService, private router: Router, private msg: MessageService) {}

  registrar(valido: boolean | null) {
    if (!valido) {
      this.msg.add({ severity: 'warn', summary: 'Formulario incompleto', detail: 'Revise los campos obligatorios' });
      return;
    }
    this.cargando = true;
    this.api.register(this.u).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Registro exitoso', detail: 'Ya puede iniciar sesión' });
        this.router.navigate(['/login']);
      },
      error: (e) => {
        this.cargando = false;
        this.msg.add({ severity: 'error', summary: 'Error', detail: this.mensaje(e) });
      },
    });
  }

  private mensaje(e: any): string {
    const d = e.error?.detail;
    return typeof d === 'string' ? d : 'No se pudo registrar el usuario';
  }
}
