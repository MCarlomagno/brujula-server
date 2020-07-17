CREATE DATABASE brujuladb;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(40),
    email VARCHAR(50)
);

ALTER TABLE users ADD COLUMN password TEXT NOT NULL;

CREATE EXTENSION pgcrypto;

/* SAMPLE QUERIES */
INSERT INTO users (nombre, email, password) VALUES (
    'Jon',
  'jon@doe.com',
  crypt('jon', gen_salt('bf'))
);

SELECT id FROM users WHERE email = 'jon@doe.com' AND password = crypt('jon', password);

/* 10/07 */
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(40)
);

CREATE TABLE roles_users (
    id SERIAL PRIMARY KEY,
    id_user INTEGER,
	id_rol INTEGER,
	FOREIGN KEY (id_user) REFERENCES users (id),
	FOREIGN KEY (id_rol) REFERENCES roles (id)
);

ALTER TABLE users 
ADD COLUMN apellido VARCHAR(40),
ADD COLUMN is_coworker BOOLEAN,
ADD COLUMN dni VARCHAR(10),
ADD COLUMN fecha_nacimiento DATE,
ADD COLUMN direccion VARCHAR(100),
ADD COLUMN celular VARCHAR(40);


CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    hoas_sala INTEGER,
	is_custom BOOLEAN
);

ALTER TABLE users ADD COLUMN id_plan INTEGER;
ALTER TABLE users 
   ADD CONSTRAINT fk_id_plan
   FOREIGN KEY (id_plan) 
   REFERENCES plans(id);


CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    id_lider INTEGER,
	nombre VARCHAR(40),
	cuit_cuil VARCHAR(20),
	FOREIGN KEY (id_lider) REFERENCES users (id)
);

ALTER TABLE plans ADD COLUMN nombre VARCHAR(40);
ALTER TABLE plans ADD COLUMN descripcion VARCHAR(255);

ALTER TABLE users ADD COLUMN horas_sala_consumidas REAL;

ALTER TABLE plans 
RENAME COLUMN hoas_sala TO horas_sala;

INSERT INTO plans (horas_sala, is_custom, nombre, descripcion) 
VALUES (2, false, 'Movil x 6', 'Puesto de trabajo movil 6 horas al dia'),
(4, false, 'Movil x 12', 'Puesto de trabajo movil 12 horas al dia'),
(4, false, 'Fijo x 12', 'Puesto de trabajo fijo 12 horas al dia'),
(4, false, 'Oficina Privada', 'Oficina privada 12 horas al dia');

/* ejemplo horas sala disponibles */
SELECT u.nombre, (p.horas_sala - u.horas_sala_consumidas) as horas_disponibles FROM users u INNER JOIN plans p ON u.id_plan = p.id;

-- PUESTOS
CREATE TABLE puestos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(40)
);

-- USERS_PUESTOS
CREATE TABLE users_puestos (
    id SERIAL PRIMARY KEY,
    id_user INTEGER,
	id_puesto INTEGER,
	hora_desde TIME,
	hora_hasta TIME,
	fecha_desde TIME,
	fecha_hasta TIME,
	lunes BOOLEAN,
	martes BOOLEAN,
	miercoles BOOLEAN,
	jueves BOOLEAN,
	viernes BOOLEAN,
	FOREIGN KEY (id_user) REFERENCES users (id),
	FOREIGN KEY (id_puesto) REFERENCES puestos (id)
);