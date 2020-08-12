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
exports.getReservationByWeek = exports.createReservation = void 0;
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    host: process.env.DBHOST || 'localhost',
    port: 5432,
    user: process.env.DBUSER || 'postgres',
    password: process.env.DBPASS || 'du3nak7Q7LdaPGr',
    database: process.env.DBNAME || 'brujuladb',
    ssl: true
});
function createReservation(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const reservation = req.body.reservation;
        // selects data for table loading
        try {
            const query = `INSERT INTO reservas (id_user, id_sala, hora_desde, hora_hasta, fecha) VALUES ($1, $2, $3, $4, $5);`;
            const queryResult = yield pool.query(query, [reservation.id_user, reservation.id_sala, reservation.hora_desde, reservation.hora_hasta, reservation.fecha]);
            const response = {
                success: true,
                data: queryResult,
                error: ''
            };
            res.status(200).json(response);
        }
        catch (err) {
            console.log(err);
            const response = {
                success: false,
                data: '',
                error: err
            };
            res.status(400).json(response);
        }
    });
}
exports.createReservation = createReservation;
function getReservationByWeek(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let idSala = req.query.idSala;
        const dateFrom = req.query.dateFrom;
        const dateTo = req.query.dateTo;
        try {
            let salas = [];
            if (!idSala) {
                const salasQuery = `SELECT id, nombre FROM salas`;
                const salasQueryResult = yield pool.query(salasQuery);
                salas = salasQueryResult.rows;
                idSala = salas[0].id;
            }
            const query = `SELECT r.id as id, u.nombre || ' ' || u.apellido as title, r.fecha + r.hora_desde AS start, r.fecha + r.hora_hasta AS end
        FROM reservas r INNER JOIN users u ON r.id_user = u.id
        WHERE r.id_sala = $1 AND r.fecha >= $2 AND r.fecha < $3;`;
            const queryResult = yield pool.query(query, [idSala, dateFrom, dateTo]);
            const response = {
                success: true,
                data: {
                    reservations: queryResult.rows,
                    salas
                },
                error: ''
            };
            res.status(200).json(response);
        }
        catch (err) {
            console.log(err);
            const response = {
                success: false,
                data: '',
                error: err
            };
            res.status(400).json(response);
        }
    });
}
exports.getReservationByWeek = getReservationByWeek;
//# sourceMappingURL=reservation.controller.js.map