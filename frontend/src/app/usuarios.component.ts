import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiService, Usuario } from './api.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, PasswordModule,
            SelectModule, TagModule, ToolbarModule],
  template: `
    <div class="page">
      <p-toolbar>
        <ng-template pTemplate="start">
          <i class="pi pi-heart-fill brand-icon"></i>
          <span class="title">Gestión de usuarios</span>
        </ng-template>
        <ng-template pTemplate="end">
          <span class="who">{{ sesion?.nombre }} {{ sesion?.apellido }}</span>
          <p-button label="Cerrar sesión" icon="pi pi-sign-out" severity="secondary" (onClick)="salir()" />
        </ng-template>
      </p-toolbar>

      <div class="panel">
        <p-table #dt [value]="usuarios" [paginator]="true" [rows]="8" [rowHover]="true" [loading]="cargando"
                 [globalFilterFields]="['identificacion','nombre','apellido','email','cargo','nombre_usuario']"
                 styleClass="p-datatable-sm">
          <ng-template pTemplate="caption">
            <div class="table-head">
              <p-button label="Nuevo usuario" icon="pi pi-plus" (onClick)="nuevo()" />
              <input pInputText placeholder="Buscar..." (input)="dt.filterGlobal($any($event.target).value, 'contains')" />
            </div>
          </ng-template>
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="identificacion">Identificación <p-sortIcon field="identificacion" /></th>
              <th pSortableColumn="nombre">Nombre <p-sortIcon field="nombre" /></th>
              <th pSortableColumn="apellido">Apellido <p-sortIcon field="apellido" /></th>
              <th>Email</th><th>Cargo</th><th>Teléfono</th><th>Usuario</th><th>Estado</th>
              <th style="width:12rem">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-x>
            <tr>
              <td>{{ x.identificacion }}</td><td>{{ x.nombre }}</td><td>{{ x.apellido }}</td>
              <td>{{ x.email }}</td><td>{{ x.cargo }}</td><td>{{ x.telefono }}</td><td>{{ x.nombre_usuario }}</td>
              <td><p-tag [value]="x.estado" [severity]="x.estado === 'Activado' ? 'success' : 'danger'" /></td>
              <td>
                <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" (onClick)="editar(x)" />
                <p-button [icon]="x.estado === 'Activado' ? 'pi pi-ban' : 'pi pi-check-circle'" [rounded]="true"
                          [text]="true" severity="warn" (onClick)="alternar(x)" />
                <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="borrar(x)" />
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage"><tr><td colspan="9">No hay usuarios registrados.</td></tr></ng-template>
        </p-table>
      </div>

      <p-dialog [(visible)]="dialogo" [modal]="true" [style]="{ width: '40rem' }"
                [header]="editando ? 'Editar usuario' : 'Nuevo usuario'">
        <form #f="ngForm" (ngSubmit)="guardar(f.valid)" class="grid-form">
          <div class="field"><label>Identificación</label>
            <input pInputText name="identificacion" #idc="ngModel" [(ngModel)]="u.identificacion" [disabled]="editando" required pattern="[0-9]{5,15}" />
            @if (idc.invalid && (idc.dirty || idc.touched)) { <small class="err">Solo números, entre 5 y 15 dígitos</small> }</div>
          <div class="field"><label>Nombre</label>
            <input pInputText name="nombre" [(ngModel)]="u.nombre" required /></div>
          <div class="field"><label>Apellido</label>
            <input pInputText name="apellido" [(ngModel)]="u.apellido" required /></div>
          <div class="field"><label>Email</label>
            <input pInputText type="email" name="email" #em="ngModel" [(ngModel)]="u.email" required email />
            @if (em.invalid && (em.dirty || em.touched)) { <small class="err">Ingrese un correo válido</small> }</div>
          <div class="field"><label>Cargo</label>
            <p-select name="cargo" [options]="cargos" [(ngModel)]="u.cargo" styleClass="w-full" required /></div>
          <div class="field"><label>Teléfono</label>
            <input pInputText name="telefono" #tel="ngModel" [(ngModel)]="u.telefono" required pattern="[0-9+ ]{7,15}" />
            @if (tel.invalid && (tel.dirty || tel.touched)) { <small class="err">Teléfono válido (7 a 15 dígitos)</small> }</div>
          <div class="field"><label>Nombre de usuario</label>
            <input pInputText name="nombre_usuario" [(ngModel)]="u.nombre_usuario" required /></div>
          <div class="field"><label>Contraseña {{ editando ? '(dejar vacío para no cambiar)' : '' }}</label>
            <p-password name="contrasena" #pw="ngModel" [(ngModel)]="u.contrasena" [toggleMask]="true" [feedback]="false"
                        styleClass="w-full" inputStyleClass="w-full" [required]="!editando" [minlength]="editando && !u.contrasena ? 0 : 6" />
            @if (pw.invalid && (pw.dirty || pw.touched)) { <small class="err">Mínimo 6 caracteres</small> }</div>
          <div class="actions full">
            <p-button type="button" label="Cancelar" severity="secondary" (onClick)="dialogo = false" />
            <p-button type="submit" label="Guardar" icon="pi pi-check" />
          </div>
        </form>
      </p-dialog>
    </div>
  `,
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  cargos = ['Doctor', 'Especialista', 'Administrativo'];
  cargando = false;
  dialogo = false;
  editando = false;
  u: Usuario = this.vacio();
  sesion: Usuario | null = JSON.parse(sessionStorage.getItem('usuario') ?? 'null');

  constructor(private api: ApiService, private router: Router,
              private msg: MessageService, private confirm: ConfirmationService) {}

  ngOnInit() { this.cargar(); }

  private vacio(): Usuario {
    return { identificacion: '', nombre: '', apellido: '', email: '', cargo: undefined as any,
             telefono: '', nombre_usuario: '', contrasena: '' };
  }

  cargar() {
    this.cargando = true;
    this.api.listar().subscribe({
      next: (r) => { this.usuarios = r; this.cargando = false; },
      error: () => { this.cargando = false; this.error('No se pudo cargar la lista'); },
    });
  }

  nuevo() { this.u = this.vacio(); this.editando = false; this.dialogo = true; }
  editar(x: Usuario) { this.u = { ...x, contrasena: '' }; this.editando = true; this.dialogo = true; }

  guardar(valido: boolean | null) {
    if (!valido) { this.msg.add({ severity: 'warn', summary: 'Revise los campos obligatorios' }); return; }
    const op = this.editando ? this.api.actualizar(this.u.identificacion, this.u) : this.api.crear(this.u);
    op.subscribe({
      next: () => {
        this.dialogo = false;
        this.msg.add({ severity: 'success', summary: this.editando ? 'Usuario actualizado' : 'Usuario creado' });
        this.cargar();
      },
      error: (e) => this.error(typeof e.error?.detail === 'string' ? e.error.detail : 'No se pudo guardar'),
    });
  }

  alternar(x: Usuario) {
    const nuevo = x.estado === 'Activado' ? 'Desactivado' : 'Activado';
    this.api.estado(x.identificacion, nuevo).subscribe({
      next: () => { this.msg.add({ severity: 'info', summary: `Usuario ${nuevo.toLowerCase()}` }); this.cargar(); },
      error: () => this.error('No se pudo cambiar el estado'),
    });
  }

  borrar(x: Usuario) {
    this.confirm.confirm({
      message: `¿Eliminar a ${x.nombre} ${x.apellido}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar', rejectLabel: 'Cancelar',
      accept: () => this.api.borrar(x.identificacion).subscribe({
        next: () => { this.msg.add({ severity: 'success', summary: 'Usuario eliminado' }); this.cargar(); },
        error: () => this.error('No se pudo eliminar'),
      }),
    });
  }

  salir() { sessionStorage.removeItem('usuario'); this.router.navigate(['/login']); }
  private error(detail: string) { this.msg.add({ severity: 'error', summary: 'Error', detail }); }
}
