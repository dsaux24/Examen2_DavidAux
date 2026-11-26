# Examen 2 – Computación Gráfica (Universidad de Nariño)

Gestión de usuarios de un hospital: Angular + PrimeNG, FastAPI y MySQL.

```
frontend/   Proyecto Angular
backend/    API FastAPI
DB/         script.sql
```

> Antes de empezar reemplaza `NombreApellido` por tu nombre y apellido en `DB/script.sql` y en `backend/main.py` (variable `DB_NAME`).

## 1. Base de datos
```bash
mysql -u root -p < DB/script.sql
```

## 2. Backend (puerto 8000)
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export DB_PASSWORD=tu_clave                          # Windows: set DB_PASSWORD=tu_clave
uvicorn main:app --reload --port 8000
```
Documentación interactiva: http://localhost:8000/docs

## 3. Frontend (puerto 4200)
```bash
cd frontend
npm install
npm start
```
Abrir http://localhost:4200

## Pruebas manuales
1. Registrar un usuario en `/registro`.
2. Iniciar sesión con su identificación y contraseña.
3. Crear, editar y eliminar usuarios.
4. Desactivar un usuario, cerrar sesión e intentar entrar con él: debe rechazarlo.
5. Reactivarlo y comprobar que vuelve a entrar.

## Git
```bash
git checkout -b Examen2-NombreApellido
git add frontend backend DB README.md .gitignore
git commit -m "Examen 2"
git push -u origin Examen2-NombreApellido
```
