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
exports.createCoworker = exports.getCoworkersCount = exports.getCoworkers = void 0;
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
        // table filters
        const itemsPerPage = req.query.pageSize;
        const pageNumber = req.query.pageNumber;
        const order = req.query.sortOrder;
        const filter = req.query.filter;
        // selects data for table loading
        // in the where, matches the filter value with nombre, apellido and email
        // LIMIT gets the items and number of page
        const query = `SELECT u.nombre, u.apellido, u.email, p.horas_sala, u.horas_sala_consumidas
                    FROM users u INNER JOIN plans p ON u.id_plan = p.id
                    WHERE is_coworker = true AND (LOWER(u.nombre) LIKE '%' || LOWER($3) || '%' OR LOWER(u.apellido) LIKE '%' || LOWER($3) || '%' OR LOWER(u.email) LIKE '%' || LOWER($3) ||'%')
                    ORDER BY u.created_at DESC
                    LIMIT $1 OFFSET ($2::numeric * $1)`;
        const queryResult = yield pool.query(query, [itemsPerPage, pageNumber, filter]);
        res.json(queryResult.rows);
    });
}
exports.getCoworkers = getCoworkers;
function getCoworkersCount(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = 'SELECT COUNT(*) FROM users u INNER JOIN plans p ON u.id_plan = p.id WHERE is_coworker = true';
        const queryResult = yield pool.query(query);
        res.json(queryResult.rows[0]);
    });
}
exports.getCoworkersCount = getCoworkersCount;
/// createCoworker
/// 1. Create coworker (insert)
/// 2. If its group leader update group (update)
/// 3. If not private office get free seats/puestos so set to the new coworker (select)
/// 4. creates the users_puestos instance (Insert).
function createCoworker(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const coworker = req.body.coworker;
        const usersPuestos = req.body.usersPuestos;
        const selectedPlan = req.body.selectedPlan;
        // creating random password for new user
        const pass = Math.random().toString(36).slice(-8);
        try {
            if (selectedPlan.is_custom) {
                const insertPlanQuery = "INSERT INTO plans (horas_sala, is_custom, nombre, descripcion) VALUES ($1, $2, $3, $4) RETURNING id;";
                const insertPlanQueryResult = yield pool.query(insertPlanQuery, [selectedPlan.horas_sala, selectedPlan.is_custom, selectedPlan.nombre, selectedPlan.descripcion]);
                selectedPlan.id = insertPlanQueryResult.rows[0].id;
                coworker.id_plan = insertPlanQueryResult.rows[0].id;
            }
            // insert query to users
            const insertCoworkerQuery = "INSERT INTO users (nombre, apellido, email, password, is_coworker, id_grupo, dni, fecha_nacimiento, direccion, celular, id_plan, horas_sala_consumidas, created_at) VALUES ($1, $2, $3, crypt($4, gen_salt('bf')), $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP) RETURNING id;";
            const queryResult = yield pool.query(insertCoworkerQuery, [coworker.nombre, coworker.apellido, coworker.email, pass, coworker.is_coworker, coworker.id_grupo, coworker.dni, coworker.fecha_nacimiento, coworker.direccion, coworker.celular, coworker.id_plan, coworker.horas_sala_consumidas]);
            if (coworker.is_leader) {
                const idLider = queryResult.rows[0].id;
                const idGrupo = coworker.id_grupo;
                // update query to groups (in case of group leader)
                const updateIdLeader = "UPDATE groups SET id_lider=$1 WHERE id=$2";
                const result = yield pool.query(updateIdLeader, [idLider, idGrupo]);
            }
            if (coworker.id_plan !== 4) {
                // select from puestos to set a free one to the user
                const puestosQuery = 'SELECT id FROM puestos WHERE disponible = true';
                const puestosQueryResult = yield pool.query(puestosQuery);
                const idPuesto = puestosQueryResult.rows[0].id;
                const idUser = queryResult.rows[0].id;
                const horaDesde = usersPuestos.hora_desde.hours + ':' + usersPuestos.hora_desde.minutes;
                const horaHasta = usersPuestos.hora_hasta.hours + ':' + usersPuestos.hora_hasta.minutes;
                // insert query to users_puestos
                const insertUsersPuestosQuery = "INSERT INTO users_puestos (id_user, id_puesto, hora_desde, hora_hasta, fecha_desde, fecha_hasta, lunes, martes, miercoles, jueves, viernes, sabado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)";
                const queryResultUsersPuestos = yield pool.query(insertUsersPuestosQuery, [idUser, idPuesto, horaDesde,
                    horaHasta, usersPuestos.fecha_desde, usersPuestos.fecha_hasta,
                    usersPuestos.dias[0], usersPuestos.dias[1], usersPuestos.dias[2],
                    usersPuestos.dias[3], usersPuestos.dias[4], usersPuestos.dias[5]]);
            }
            const response = {
                success: true,
                body: {
                    coworker,
                    usersPuestos,
                    password: pass,
                },
            };
            console.log('createCoworker performed successfully!');
            res.status(200).json(response);
        }
        catch (err) {
            console.log(err);
            const response = {
                success: false,
                error: err
            };
            res.status(400).json(response);
        }
    });
}
exports.createCoworker = createCoworker;
//# sourceMappingURL=coworkers.controller.js.map