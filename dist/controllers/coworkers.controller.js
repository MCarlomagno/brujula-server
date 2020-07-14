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
exports.getCoworkers = void 0;
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    host: process.env.DBHOST || 'localhost',
    port: 5432,
    user: process.env.DBUSER || 'postgres',
    password: process.env.DBPASS || 'du3nak7Q7LdaPGr',
    database: process.env.DBNAME || 'brujuladb',
    ssl: true
});
function getCoworkers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = 'SELECT u.nombre, u.apellido, u.email, p.horas_sala, u.horas_sala_consumidas FROM users u INNER JOIN plans p ON u.id_plan = p.id WHERE is_coworker = true';
        const queryResult = yield pool.query(query);
        console.log(queryResult.rows);
        res.json(queryResult.rows);
    });
}
exports.getCoworkers = getCoworkers;
//# sourceMappingURL=coworkers.controller.js.map