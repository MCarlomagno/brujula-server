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
exports.deleteCoworker = exports.updateCoworker = exports.createCoworker = exports.getCoworkerById = exports.getCoworkersCount = exports.getCoworkers = void 0;
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
        const group = req.query.group;
        const bornDate = req.query.bornDate;
        const plan = req.query.plan;
        // selects data for table loading
        // in the where, matches the filter value with nombre, apellido and email
        // LIMIT gets the items and number of page
        const query = `SELECT u.id, u.nombre, u.apellido, u.email, p.horas_sala, u.horas_sala_consumidas, u.fecha_nacimiento, u.id_plan, u.id_grupo
                    FROM users u INNER JOIN plans p ON u.id_plan = p.id
                    WHERE is_coworker = true AND (LOWER(u.nombre) LIKE '%' || LOWER($3) || '%' OR LOWER(u.apellido) LIKE '%' || LOWER($3) || '%' OR LOWER(u.email) LIKE '%' || LOWER($3) ||'%')
                    ORDER BY u.created_at DESC
                    LIMIT $1 OFFSET ($2::numeric * $1)`;
        const queryResult = yield pool.query(query, [itemsPerPage, pageNumber, filter]);
        let resultRows = [...queryResult.rows];
        // other filters
        if (bornDate !== 'null') {
            console.log("borndate");
            console.log(bornDate);
            resultRows = resultRows.filter((row) => {
                const diaNacimiento = row.fecha_nacimiento.getDate();
                const mesNacimiento = row.fecha_nacimiento.getMonth() + 1;
                console.log(diaNacimiento.toString());
                console.log(mesNacimiento.toString());
                return (mesNacimiento.toString() === bornDate.split('-')[0] && diaNacimiento.toString() === bornDate.split('-')[1]);
            });
        }
        if (group !== 'null') {
            console.log("group");
            console.log(group);
            resultRows = resultRows.filter((row) => row.id_grupo === group);
        }
        if (plan !== 'null') {
            console.log("plan");
            console.log(plan);
            resultRows = resultRows.filter((row) => row.id_plan === plan);
        }
        res.json(resultRows);
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
///  returns the user, user_puesto, plan and group (if exist) by user id
function getCoworkerById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = req.params.id;
        // Variables to be returned
        let coworker;
        let plan;
        let groups;
        let userPuesto;
        try {
            // users query
            const query = 'SELECT id, nombre, email, apellido, dni, fecha_nacimiento, direccion, celular, id_plan, horas_sala_consumidas, id_grupo FROM users WHERE id = $1';
            const coworkerQueryResult = yield pool.query(query, [id]);
            coworker = coworkerQueryResult.rows[0];
        }
        catch (err) {
            console.log('error querying coworker');
            console.log(err);
            const resultError = {
                success: false,
                msg: err
            };
            res.status(400).json(resultError);
        }
        try {
            // plans query
            const query = 'SELECT id, horas_sala, is_custom, nombre, descripcion FROM plans WHERE id = $1';
            const coworkerQueryResult = yield pool.query(query, [coworker.id_plan]);
            plan = coworkerQueryResult.rows[0];
        }
        catch (err) {
            console.log('error querying plan');
            console.log(err);
            const resultError = {
                success: false,
                msg: err
            };
            res.status(400).json(resultError);
        }
        try {
            // groups query
            const query = 'SELECT id, id_lider, nombre, cuit_cuil FROM groups';
            const coworkerQueryResult = yield pool.query(query);
            groups = coworkerQueryResult.rows;
        }
        catch (err) {
            console.log('error querying groups');
            console.log(err);
            const resultError = {
                success: false,
                msg: err
            };
            res.status(400).json(resultError);
        }
        try {
            // users_puestos query
            const query = 'SELECT id, id_user, id_puesto, hora_desde, hora_hasta, fecha_desde, fecha_hasta, lunes, martes, miercoles, jueves, viernes, sabado FROM users_puestos WHERE id_user = $1';
            const coworkerQueryResult = yield pool.query(query, [id]);
            userPuesto = coworkerQueryResult.rows[0];
        }
        catch (err) {
            console.log('error querying userPuesto');
            console.log(err);
            const resultError = {
                success: false,
                msg: err
            };
            res.status(400).json(resultError);
        }
        const result = {
            success: true,
            coworker,
            plan,
            groups,
            userPuesto,
        };
        res.json(result);
    });
}
exports.getCoworkerById = getCoworkerById;
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
                const horaDesde = usersPuestos.hora_desde ? usersPuestos.hora_desde.hours + ':' + usersPuestos.hora_desde.minutes : null;
                const horaHasta = usersPuestos.hora_hasta ? usersPuestos.hora_hasta.hours + ':' + usersPuestos.hora_hasta.minutes : null;
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
/// updates coworker, usersPuestos and/or plan if someone is in the req.
function updateCoworker(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const coworker = req.body.coworker;
        const usersPuestos = req.body.usersPuestos;
        const selectedPlan = req.body.selectedPlan;
        const idCoworker = req.params.id;
        try {
            if (selectedPlan) {
                // insert query to plans
                if (selectedPlan.is_custom) {
                    const insertPlanQuery = "INSERT INTO plans (horas_sala, is_custom, nombre, descripcion) VALUES ($1, $2, $3, $4) RETURNING id;";
                    const insertPlanQueryResult = yield pool.query(insertPlanQuery, [selectedPlan.horas_sala, selectedPlan.is_custom, selectedPlan.nombre, selectedPlan.descripcion]);
                    selectedPlan.id = insertPlanQueryResult.rows[0].id;
                }
                if (coworker) {
                    coworker.id_plan = selectedPlan.id;
                }
                else {
                    const updateCoworkerAfterPlansQuery = "UPDATE users SET id_plan = $2 WHERE id = $1";
                    const queryResult = yield pool.query(updateCoworkerAfterPlansQuery, [idCoworker, selectedPlan.id]);
                }
                console.log('plan created');
            }
            // update query to users
            if (coworker) {
                // gets id_grupo to check changes in groups
                const idGrupo = coworker.id_grupo;
                if (coworker.id_grupo === 0) {
                    coworker.id_grupo = null;
                }
                const updateCoworkerQuery = "UPDATE users SET nombre = $2, apellido = $3, email = $4, id_grupo = $5, dni = $6, fecha_nacimiento = $7, direccion = $8, celular = $9, id_plan = $10 WHERE id = $1";
                const queryResult = yield pool.query(updateCoworkerQuery, [coworker.id, coworker.nombre, coworker.apellido, coworker.email, coworker.id_grupo, coworker.dni, coworker.fecha_nacimiento, coworker.direccion, coworker.celular, coworker.id_plan]);
                // when idGrupo === 0 the user does not have group
                if (idGrupo !== 0) {
                    if (coworker.is_leader) {
                        const idLider = idCoworker;
                        // update query to groups (in case of group leader)
                        const updateIdLeader = "UPDATE groups SET id_lider=$1 WHERE id=$2";
                        const result = yield pool.query(updateIdLeader, [idLider, idGrupo]);
                    }
                    else {
                        // if the user is leader and the role was changed, sets the group leader on null (no leader selected)
                        const updateIdLeader = "UPDATE groups SET id_lider=NULL WHERE id_lider=$1";
                        const resultUpdateIdLeader = yield pool.query(updateIdLeader, [idCoworker]);
                    }
                }
                else {
                    // if the user is leader and the role was changed, sets the group leader on null (no leader selected)
                    const updateIdLeader = "UPDATE groups SET id_lider=NULL WHERE id_lider=$1";
                    const resultUpdateIdLeader = yield pool.query(updateIdLeader, [idCoworker]);
                }
                console.log('coworker updated');
            }
            if (usersPuestos) {
                const horaDesde = usersPuestos.hora_desde.hours + ':' + usersPuestos.hora_desde.minutes;
                const horaHasta = usersPuestos.hora_hasta.hours + ':' + usersPuestos.hora_hasta.minutes;
                // update query to users_puestos
                console.log(usersPuestos.dias);
                const updateUsersPuestosQuery = "UPDATE users_puestos SET hora_desde = $1, hora_hasta = $2, fecha_desde = $3, fecha_hasta = $4, lunes = $5, martes = $6, miercoles = $7, jueves =$8, viernes = $9, sabado = $10 WHERE id_user = $11";
                const queryResultUsersPuestos = yield pool.query(updateUsersPuestosQuery, [horaDesde, horaHasta, usersPuestos.fecha_desde, usersPuestos.fecha_hasta,
                    usersPuestos.dias[0], usersPuestos.dias[1], usersPuestos.dias[2],
                    usersPuestos.dias[3], usersPuestos.dias[4], usersPuestos.dias[5], usersPuestos.id_user]);
                console.log('users puestos updated');
            }
            const response = {
                success: true,
                body: {
                    coworker,
                    usersPuestos,
                    selectedPlan
                },
            };
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
exports.updateCoworker = updateCoworker;
function deleteCoworker(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const idUser = req.params.id;
        try {
            const selectGroupLeader = 'SELECT id FROM groups WHERE id_lider = $1';
            const coworkerQueryResult = yield pool.query(selectGroupLeader, [idUser]);
            const result = coworkerQueryResult.rows[0];
            if (result) {
                const responseError = {
                    success: false,
                    error: 'El coworker es lider de un grupo',
                    body: {},
                };
                return res.status(401).json(responseError);
            }
            const deleteUsersPuestosQuery = 'DELETE FROM users_puestos WHERE id_user = $1';
            const usersPuestosQueryResult = yield pool.query(deleteUsersPuestosQuery, [idUser]);
            const selectPlanId = 'SELECT id_plan FROM users WHERE id = $1';
            const selectPlanIdResult = yield pool.query(selectPlanId, [idUser]);
            const plan = selectPlanIdResult.rows[0];
            const deletePlanQuery = 'DELETE FROM plans WHERE id = $1 AND is_custom = true';
            const deletePlanQueryResult = yield pool.query(deletePlanQuery, [plan.id]);
            const deleteCoworkerQuery = 'DELETE FROM users WHERE id = $1';
            const deleteCoworkerQueryResult = yield pool.query(deleteCoworkerQuery, [idUser]);
            // TODO implement delete on reservas, users roles
            const response = {
                success: true,
                error: '',
                body: {},
            };
            return res.status(200).json(response);
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
exports.deleteCoworker = deleteCoworker;
//# sourceMappingURL=coworkers.controller.js.map