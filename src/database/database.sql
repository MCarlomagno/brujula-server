CREATE DATABASE brujuladb;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(40),
    email VARCHAR(50)
);

INSERT INTO users (nombre, email) VALUES
('joe', 'joe@ibm.com');