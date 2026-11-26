import os
from typing import Literal, Optional

import bcrypt
import mysql.connector
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "db_DavidAux"),
}

app = FastAPI(title="API Gestión de Usuarios - Hospital")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)

Cargo = Literal["Doctor", "Especialista", "Administrativo"]
Estado = Literal["Activado", "Desactivado"]


class LoginIn(BaseModel):
    identificacion: str
    contrasena: str


class UsuarioIn(BaseModel):
    identificacion: str
    nombre: str
    apellido: str
    email: EmailStr
    cargo: Cargo
    telefono: str
    nombre_usuario: str
    contrasena: Optional[str] = None  # opcional al editar


class EstadoIn(BaseModel):
    estado: Estado


def query(sql, params=(), fetch="none"):
    conn = mysql.connector.connect(**DB_CONFIG)
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(sql, params)
        result = None
        if fetch == "one":
            result = cur.fetchone()
        elif fetch == "all":
            result = cur.fetchall()
        conn.commit()
        return result if fetch != "none" else cur.rowcount
    except mysql.connector.IntegrityError:
        raise HTTPException(409, "Identificación, email o nombre de usuario ya existen")
    finally:
        conn.close()


def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


COLS = "identificacion, nombre, apellido, email, cargo, telefono, nombre_usuario, estado"


@app.post("/auth/login")
def login(data: LoginIn):
    u = query("SELECT * FROM usuarios WHERE identificacion=%s", (data.identificacion,), "one")
    if not u or not bcrypt.checkpw(data.contrasena.encode(), u["contrasena"].encode()):
        raise HTTPException(401, "Usuario o contraseña inválidos")
    if u["estado"] != "Activado":
        raise HTTPException(403, "El usuario está desactivado")
    u.pop("contrasena")
    return u


@app.post("/auth/register", status_code=201)
def register(u: UsuarioIn):
    if not u.contrasena:
        raise HTTPException(422, "La contraseña es obligatoria")
    query(
        "INSERT INTO usuarios (identificacion,nombre,apellido,email,cargo,telefono,nombre_usuario,contrasena)"
        " VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
        (u.identificacion, u.nombre, u.apellido, u.email, u.cargo, u.telefono,
         u.nombre_usuario, hash_pw(u.contrasena)),
    )
    return {"mensaje": "Usuario creado"}


@app.get("/usuarios")
def listar():
    return query(f"SELECT {COLS} FROM usuarios ORDER BY apellido, nombre", fetch="all")


@app.get("/usuarios/{identificacion}")
def obtener(identificacion: str):
    u = query(f"SELECT {COLS} FROM usuarios WHERE identificacion=%s", (identificacion,), "one")
    if not u:
        raise HTTPException(404, "Usuario no encontrado")
    return u


@app.post("/usuarios", status_code=201)
def crear(u: UsuarioIn):
    return register(u)


@app.put("/usuarios/{identificacion}")
def actualizar(identificacion: str, u: UsuarioIn):
    if not query(f"SELECT {COLS} FROM usuarios WHERE identificacion=%s", (identificacion,), "one"):
        raise HTTPException(404, "Usuario no encontrado")
    params = [u.nombre, u.apellido, u.email, u.cargo, u.telefono, u.nombre_usuario]
    sql = "UPDATE usuarios SET nombre=%s,apellido=%s,email=%s,cargo=%s,telefono=%s,nombre_usuario=%s"
    if u.contrasena:
        sql += ",contrasena=%s"
        params.append(hash_pw(u.contrasena))
    sql += " WHERE identificacion=%s"
    params.append(identificacion)
    query(sql, tuple(params))
    return {"mensaje": "Usuario actualizado"}


@app.patch("/usuarios/{identificacion}/estado")
def cambiar_estado(identificacion: str, e: EstadoIn):
    if not query(f"SELECT {COLS} FROM usuarios WHERE identificacion=%s", (identificacion,), "one"):
        raise HTTPException(404, "Usuario no encontrado")
    query("UPDATE usuarios SET estado=%s WHERE identificacion=%s", (e.estado, identificacion))
    return {"mensaje": f"Usuario {e.estado.lower()}"}


@app.delete("/usuarios/{identificacion}")
def borrar(identificacion: str):
    if query("DELETE FROM usuarios WHERE identificacion=%s", (identificacion,)) == 0:
        raise HTTPException(404, "Usuario no encontrado")
    return {"mensaje": "Usuario eliminado"}
