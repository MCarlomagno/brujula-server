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