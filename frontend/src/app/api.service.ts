import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  identificacion: string;
  nombre: string;
  apellido: string;
  email: string;
  cargo: 'Doctor' | 'Especialista' | 'Administrativo';
  telefono: string;
  nombre_usuario: string;
  contrasena?: string;
  estado?: 'Activado' | 'Desactivado';
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = 'http://localhost:8000';
  constructor(private http: HttpClient) {}

  login(identificacion: string, contrasena: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.base}/auth/login`, { identificacion, contrasena });
  }
  register(u: Usuario) { return this.http.post(`${this.base}/auth/register`, u); }
  listar(): Observable<Usuario[]> { return this.http.get<Usuario[]>(`${this.base}/usuarios`); }
  crear(u: Usuario) { return this.http.post(`${this.base}/usuarios`, u); }
  actualizar(id: string, u: Usuario) { return this.http.put(`${this.base}/usuarios/${id}`, u); }
  estado(id: string, estado: 'Activado' | 'Desactivado') {
    return this.http.patch(`${this.base}/usuarios/${id}/estado`, { estado });
  }
  borrar(id: string) { return this.http.delete(`${this.base}/usuarios/${id}`); }
}
