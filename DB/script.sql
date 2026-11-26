-- Script final de base de datos (reemplaza NombreApellido por tu nombre y apellido)
CREATE DATABASE IF NOT EXISTS db_DavidAux
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_DavidAux;

CREATE TABLE IF NOT EXISTS usuarios (
  identificacion VARCHAR(20)  NOT NULL PRIMARY KEY,
  nombre         VARCHAR(80)  NOT NULL,
  apellido       VARCHAR(80)  NOT NULL,
  email          VARCHAR(120) NOT NULL UNIQUE,
  cargo          ENUM('Doctor','Especialista','Administrativo') NOT NULL,
  telefono       VARCHAR(20)  NOT NULL,
  nombre_usuario VARCHAR(50)  NOT NULL UNIQUE,
  contrasena     VARCHAR(255) NOT NULL,
  estado         ENUM('Activado','Desactivado') NOT NULL DEFAULT 'Activado'
) ENGINE=InnoDB;
