"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.updateUser = exports.deleteUser = exports.postUsers = exports.getUserById = exports.getUsers = void 0;
const pg_1 = require("pg");
const jsonwebtoken_1 = require("jsonwebtoken");
const pool = new pg_1.Pool({
    host: process.env.DBHOST || 'localhost',
    port: 5432,
    user: process.env.DBUSER || 'postgres',
    password: process.env.DBPASS || 'du3nak7Q7LdaPGr',
    database: process.env.DBNAME || 'brujuladb',
    ssl: true
});
function getUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const queryResult = yield pool.query('SELECT * FROM users');
        console.log(queryResult.rows);
        res.json(queryResult.rows);
    });
}
exports.getUsers = getUsers;
function getUserById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const queryResult = yield pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        res.status(200).json(queryResult.rows);
    });
}
exports.getUserById = getUserById;
function postUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(req.body);
        const { nombre, email } = req.body;
        const queryResult = yield pool.query('INSERT INTO users (nombre, email) VALUES ($1, $2)', [nombre, email]);
        res.json({
            message: "User added succesfully",
            body: {
                user: { nombre, email }
            }
        });
    });
}
exports.postUsers = postUsers;
function deleteUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const queryResult = yield pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.status(200).json(queryResult.rows);
    });
}
exports.deleteUser = deleteUser;
function updateUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(req.body);
        const { nombre, email } = req.body;
        const queryResult = yield pool.query('UPDATE users SET nombre = $1, email = $2 WHERE id = $3', [nombre, email, req.params.id]);
        res.status(200).json(queryResult.rows);
    });
}
exports.updateUser = updateUser;
function loginUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(req.body);
        const email = req.body.email;
        const password = req.body.password;
        const queryResultUser = yield pool.query("SELECT id, nombre, email, password FROM users WHERE email = $1", [email]);
        // TODO: validate
        console.log('after query rows cournt: ' + queryResultUser.rowCount);
        if (queryResultUser.rowCount === 0) {
            return res.status(401).json({ message: "El usuario no existe" });
        }
        const userId = queryResultUser.rows[0].id;
        const queryResultPassword = yield pool.query("SELECT id FROM users WHERE password = crypt($1, password) AND id = $2;", [password, userId]);
        if (queryResultPassword.rowCount === 0) {
            return res.status(401).json({ message: "Contrasena incorrecta" });
        }
        const token = jsonwebtoken_1.sign({ id: userId }, process.env.SECRETKEY);
        res.status(200).json({ message: "welcome", token, data: req.body });
    });
}
exports.loginUser = loginUser;
//# sourceMappingURL=index.controller.js.map