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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.getAllPlanesAndGropus = exports.deleteCoworker = exports.updateCoworker = exports.createCoworker = exports.getCoworkerById = exports.getCoworkersCount = exports.getCoworkers = void 0;
var pg_1 = require("pg");
var pool = new pg_1.Pool({
    host: process.env.DBHOST || 'localhost',
    port: 5432,
    user: process.env.DBUSER || 'postgres',
    password: process.env.DBPASS || 'du3nak7Q7LdaPGr',
    database: process.env.DBNAME || 'brujuladb',
    ssl: true
});
function getCoworkers(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var itemsPerPage, pageNumber, order, filter, group, bornDate, plan, query, queryResult, countQuery, countQueryResult, resultRows, countResult, response, err_1, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    itemsPerPage = req.query.pageSize;
                    pageNumber = req.query.pageNumber;
                    order = req.query.sortOrder;
                    filter = req.query.filter;
                    group = req.query.group;
                    bornDate = req.query.bornDate;
                    plan = req.query.plan;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    if (group === 'null') {
                        group = 0;
                    }
                    else {
                        group = parseInt(group, 10);
                    }
                    if (plan === 'null') {
                        plan = 0;
                    }
                    else {
                        plan = parseInt(plan, 10);
                        // plan === -1  means that the user selected customized in the front
                        if (plan === 0) {
                            plan = -1;
                        }
                    }
                    query = "SELECT u.id, u.nombre, u.apellido, u.email, p.horas_sala, u.horas_sala_consumidas, u.fecha_nacimiento, u.id_plan, u.id_grupo as id_grupo, p.is_custom as is_custom\n                    FROM users u INNER JOIN plans p ON u.id_plan = p.id\n                    WHERE is_coworker = true\n                    AND (LOWER(u.nombre) LIKE '%' || LOWER($3) || '%' OR LOWER(u.apellido) LIKE '%' || LOWER($3) || '%' OR LOWER(u.email) LIKE '%' || LOWER($3) ||'%')\n                    AND ($4 = 0 OR u.id_plan = $4 OR ($4 = -1 AND p.is_custom))\n                    AND ($5 = 0 OR u.id_grupo = $5)\n                    AND ($6 LIKE 'null' OR DATE_PART('day', u.fecha_nacimiento) = DATE_PART('day',TO_TIMESTAMP($6, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"')) AND DATE_PART('month', u.fecha_nacimiento) = DATE_PART('month',TO_TIMESTAMP($6, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"')))\n                    ORDER BY u.created_at DESC\n                    LIMIT $1 OFFSET ($2::numeric * $1)";
                    queryResult = void 0;
                    return [4 /*yield*/, pool.query(query, [itemsPerPage, pageNumber, filter, plan, group, bornDate])];
                case 2:
                    queryResult = _a.sent();
                    countQuery = "SELECT COUNT(*) as coworkersCount\n                    FROM users u INNER JOIN plans p ON u.id_plan = p.id\n                    WHERE is_coworker = true\n                    AND (LOWER(u.nombre) LIKE '%' || LOWER($1) || '%' OR LOWER(u.apellido) LIKE '%' || LOWER($1) || '%' OR LOWER(u.email) LIKE '%' || LOWER($1) ||'%')\n                    AND ($2 = 0 OR u.id_plan = $2 OR ($2 = -1 AND p.is_custom))\n                    AND ($3 = 0 OR u.id_grupo = $3)\n                    AND ($4 LIKE 'null' OR DATE_PART('day', u.fecha_nacimiento) = DATE_PART('day',TO_TIMESTAMP($4, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"')) AND DATE_PART('month', u.fecha_nacimiento) = DATE_PART('month',TO_TIMESTAMP($4, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"')))";
                    countQueryResult = void 0;
                    return [4 /*yield*/, pool.query(countQuery, [filter, plan, group, bornDate])];
                case 3:
                    countQueryResult = _a.sent();
                    resultRows = __spreadArrays(queryResult.rows);
                    countResult = countQueryResult.rows[0].coworkerscount;
                    response = {
                        coworkers: resultRows,
                        coworkersCount: countResult
                    };
                    res.status(200).json(response);
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    console.log(err_1);
                    response = {
                        success: false,
                        error: err_1
                    };
                    res.status(400).json(response);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getCoworkers = getCoworkers;
function getCoworkersCount(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var query, queryResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = 'SELECT COUNT(*) FROM users u INNER JOIN plans p ON u.id_plan = p.id WHERE is_coworker = true';
                    return [4 /*yield*/, pool.query(query)];
                case 1:
                    queryResult = _a.sent();
                    res.json(queryResult.rows[0]);
                    return [2 /*return*/];
            }
        });
    });
}
exports.getCoworkersCount = getCoworkersCount;
///  returns the user, user_puesto, plan and group (if exist) by user id
function getCoworkerById(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var id, coworker, plan, groups, userPuesto, query, coworkerQueryResult, err_2, resultError, query, coworkerQueryResult, err_3, resultError, query, coworkerQueryResult, err_4, resultError, query, coworkerQueryResult, err_5, resultError, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = req.params.id;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    query = 'SELECT id, nombre, email, apellido, dni, fecha_nacimiento, direccion, celular, id_plan, horas_sala_consumidas, id_grupo FROM users WHERE id = $1';
                    return [4 /*yield*/, pool.query(query, [id])];
                case 2:
                    coworkerQueryResult = _a.sent();
                    coworker = coworkerQueryResult.rows[0];
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    console.log('error querying coworker');
                    console.log(err_2);
                    resultError = {
                        success: false,
                        msg: err_2
                    };
                    res.status(400).json(resultError);
                    return [3 /*break*/, 4];
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    query = 'SELECT id, horas_sala, is_custom, nombre, descripcion FROM plans WHERE id = $1';
                    return [4 /*yield*/, pool.query(query, [coworker.id_plan])];
                case 5:
                    coworkerQueryResult = _a.sent();
                    plan = coworkerQueryResult.rows[0];
                    return [3 /*break*/, 7];
                case 6:
                    err_3 = _a.sent();
                    console.log('error querying plan');
                    console.log(err_3);
                    resultError = {
                        success: false,
                        msg: err_3
                    };
                    res.status(400).json(resultError);
                    return [3 /*break*/, 7];
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    query = 'SELECT id, id_lider, nombre, cuit_cuil FROM groups';
                    return [4 /*yield*/, pool.query(query)];
                case 8:
                    coworkerQueryResult = _a.sent();
                    groups = coworkerQueryResult.rows;
                    return [3 /*break*/, 10];
                case 9:
                    err_4 = _a.sent();
                    console.log('error querying groups');
                    console.log(err_4);
                    resultError = {
                        success: false,
                        msg: err_4
                    };
                    res.status(400).json(resultError);
                    return [3 /*break*/, 10];
                case 10:
                    _a.trys.push([10, 12, , 13]);
                    query = 'SELECT id, id_user, id_puesto, hora_desde, hora_hasta, fecha_desde, fecha_hasta, lunes, martes, miercoles, jueves, viernes, sabado FROM users_puestos WHERE id_user = $1';
                    return [4 /*yield*/, pool.query(query, [id])];
                case 11:
                    coworkerQueryResult = _a.sent();
                    userPuesto = coworkerQueryResult.rows[0];
                    return [3 /*break*/, 13];
                case 12:
                    err_5 = _a.sent();
                    console.log('error querying userPuesto');
                    console.log(err_5);
                    resultError = {
                        success: false,
                        msg: err_5
                    };
                    res.status(400).json(resultError);
                    return [3 /*break*/, 13];
                case 13:
                    result = {
                        success: true,
                        coworker: coworker,
                        plan: plan,
                        groups: groups,
                        userPuesto: userPuesto
                    };
                    res.json(result);
                    return [2 /*return*/];
            }
        });
    });
}
exports.getCoworkerById = getCoworkerById;
/// createCoworker
/// 1. Create coworker (insert)
/// 2. If its group leader update group (update)
/// 3. If not private office get free seats/puestos so set to the new coworker (select)
/// 4. creates the users_puestos instance (Insert).
function createCoworker(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var coworker, usersPuestos, selectedPlan, pass, insertPlanQuery, insertPlanQueryResult, insertCoworkerQuery, queryResult, idLider, idGrupo, updateIdLeader, result, puestosQuery, puestosQueryResult, idPuesto, idUser, horaDesde, horaHasta, insertUsersPuestosQuery, queryResultUsersPuestos, response, err_6, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    coworker = req.body.coworker;
                    usersPuestos = req.body.usersPuestos;
                    selectedPlan = req.body.selectedPlan;
                    pass = Math.random().toString(36).slice(-8);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, , 11]);
                    if (!selectedPlan.is_custom) return [3 /*break*/, 3];
                    insertPlanQuery = "INSERT INTO plans (horas_sala, is_custom, nombre, descripcion) VALUES ($1, $2, $3, $4) RETURNING id;";
                    return [4 /*yield*/, pool.query(insertPlanQuery, [selectedPlan.horas_sala, selectedPlan.is_custom, selectedPlan.nombre, selectedPlan.descripcion])];
                case 2:
                    insertPlanQueryResult = _a.sent();
                    selectedPlan.id = insertPlanQueryResult.rows[0].id;
                    coworker.id_plan = insertPlanQueryResult.rows[0].id;
                    _a.label = 3;
                case 3:
                    insertCoworkerQuery = "INSERT INTO users (nombre, apellido, email, password, is_coworker, id_grupo, dni, fecha_nacimiento, direccion, celular, id_plan, horas_sala_consumidas, created_at) VALUES ($1, $2, $3, crypt($4, gen_salt('bf')), $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP) RETURNING id;";
                    return [4 /*yield*/, pool.query(insertCoworkerQuery, [coworker.nombre, coworker.apellido, coworker.email, pass, coworker.is_coworker, coworker.id_grupo, coworker.dni, coworker.fecha_nacimiento, coworker.direccion, coworker.celular, coworker.id_plan, coworker.horas_sala_consumidas])];
                case 4:
                    queryResult = _a.sent();
                    if (!coworker.is_leader) return [3 /*break*/, 6];
                    idLider = queryResult.rows[0].id;
                    idGrupo = coworker.id_grupo;
                    updateIdLeader = "UPDATE groups SET id_lider=$1 WHERE id=$2";
                    return [4 /*yield*/, pool.query(updateIdLeader, [idLider, idGrupo])];
                case 5:
                    result = _a.sent();
                    _a.label = 6;
                case 6:
                    if (!(coworker.id_plan !== 4)) return [3 /*break*/, 9];
                    puestosQuery = 'SELECT id FROM puestos WHERE disponible = true';
                    return [4 /*yield*/, pool.query(puestosQuery)];
                case 7:
                    puestosQueryResult = _a.sent();
                    idPuesto = puestosQueryResult.rows[0].id;
                    idUser = queryResult.rows[0].id;
                    horaDesde = usersPuestos.hora_desde ? usersPuestos.hora_desde.hours + ':' + usersPuestos.hora_desde.minutes : null;
                    horaHasta = usersPuestos.hora_hasta ? usersPuestos.hora_hasta.hours + ':' + usersPuestos.hora_hasta.minutes : null;
                    insertUsersPuestosQuery = "INSERT INTO users_puestos (id_user, id_puesto, hora_desde, hora_hasta, fecha_desde, fecha_hasta, lunes, martes, miercoles, jueves, viernes, sabado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)";
                    return [4 /*yield*/, pool.query(insertUsersPuestosQuery, [idUser, idPuesto, horaDesde,
                            horaHasta, usersPuestos.fecha_desde, usersPuestos.fecha_hasta,
                            usersPuestos.dias[0], usersPuestos.dias[1], usersPuestos.dias[2],
                            usersPuestos.dias[3], usersPuestos.dias[4], usersPuestos.dias[5]])];
                case 8:
                    queryResultUsersPuestos = _a.sent();
                    _a.label = 9;
                case 9:
                    response = {
                        success: true,
                        body: {
                            coworker: coworker,
                            usersPuestos: usersPuestos,
                            password: pass
                        }
                    };
                    console.log('createCoworker performed successfully!');
                    res.status(200).json(response);
                    return [3 /*break*/, 11];
                case 10:
                    err_6 = _a.sent();
                    console.log(err_6);
                    response = {
                        success: false,
                        error: err_6
                    };
                    res.status(400).json(response);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
exports.createCoworker = createCoworker;
/// updates coworker, usersPuestos and/or plan if someone is in the req.
function updateCoworker(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var coworker, usersPuestos, selectedPlan, idCoworker, insertPlanQuery, insertPlanQueryResult, updateCoworkerAfterPlansQuery, queryResult, idGrupo, updateCoworkerQuery, queryResult, idLider, updateIdLeader, result, updateIdLeader, resultUpdateIdLeader, updateIdLeader, resultUpdateIdLeader, horaDesde, horaHasta, updateUsersPuestosQuery, queryResultUsersPuestos, response, err_7, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    coworker = req.body.coworker;
                    usersPuestos = req.body.usersPuestos;
                    selectedPlan = req.body.selectedPlan;
                    idCoworker = req.params.id;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 19, , 20]);
                    if (!selectedPlan) return [3 /*break*/, 7];
                    if (!selectedPlan.is_custom) return [3 /*break*/, 3];
                    insertPlanQuery = "INSERT INTO plans (horas_sala, is_custom, nombre, descripcion) VALUES ($1, $2, $3, $4) RETURNING id;";
                    return [4 /*yield*/, pool.query(insertPlanQuery, [selectedPlan.horas_sala, selectedPlan.is_custom, selectedPlan.nombre, selectedPlan.descripcion])];
                case 2:
                    insertPlanQueryResult = _a.sent();
                    selectedPlan.id = insertPlanQueryResult.rows[0].id;
                    _a.label = 3;
                case 3:
                    if (!coworker) return [3 /*break*/, 4];
                    coworker.id_plan = selectedPlan.id;
                    return [3 /*break*/, 6];
                case 4:
                    updateCoworkerAfterPlansQuery = "UPDATE users SET id_plan = $2 WHERE id = $1";
                    return [4 /*yield*/, pool.query(updateCoworkerAfterPlansQuery, [idCoworker, selectedPlan.id])];
                case 5:
                    queryResult = _a.sent();
                    _a.label = 6;
                case 6:
                    console.log('plan created');
                    _a.label = 7;
                case 7:
                    if (!coworker) return [3 /*break*/, 16];
                    idGrupo = coworker.id_grupo;
                    if (coworker.id_grupo === 0) {
                        coworker.id_grupo = null;
                    }
                    updateCoworkerQuery = "UPDATE users SET nombre = $2, apellido = $3, email = $4, id_grupo = $5, dni = $6, fecha_nacimiento = $7, direccion = $8, celular = $9, id_plan = $10 WHERE id = $1";
                    return [4 /*yield*/, pool.query(updateCoworkerQuery, [coworker.id, coworker.nombre, coworker.apellido, coworker.email, coworker.id_grupo, coworker.dni, coworker.fecha_nacimiento, coworker.direccion, coworker.celular, coworker.id_plan])];
                case 8:
                    queryResult = _a.sent();
                    if (!(idGrupo !== 0)) return [3 /*break*/, 13];
                    if (!coworker.is_leader) return [3 /*break*/, 10];
                    idLider = idCoworker;
                    updateIdLeader = "UPDATE groups SET id_lider=$1 WHERE id=$2";
                    return [4 /*yield*/, pool.query(updateIdLeader, [idLider, idGrupo])];
                case 9:
                    result = _a.sent();
                    return [3 /*break*/, 12];
                case 10:
                    updateIdLeader = "UPDATE groups SET id_lider=NULL WHERE id_lider=$1";
                    return [4 /*yield*/, pool.query(updateIdLeader, [idCoworker])];
                case 11:
                    resultUpdateIdLeader = _a.sent();
                    _a.label = 12;
                case 12: return [3 /*break*/, 15];
                case 13:
                    updateIdLeader = "UPDATE groups SET id_lider=NULL WHERE id_lider=$1";
                    return [4 /*yield*/, pool.query(updateIdLeader, [idCoworker])];
                case 14:
                    resultUpdateIdLeader = _a.sent();
                    _a.label = 15;
                case 15:
                    console.log('coworker updated');
                    _a.label = 16;
                case 16:
                    if (!usersPuestos) return [3 /*break*/, 18];
                    horaDesde = usersPuestos.hora_desde.hours + ':' + usersPuestos.hora_desde.minutes;
                    horaHasta = usersPuestos.hora_hasta.hours + ':' + usersPuestos.hora_hasta.minutes;
                    // update query to users_puestos
                    console.log(usersPuestos.dias);
                    updateUsersPuestosQuery = "UPDATE users_puestos SET hora_desde = $1, hora_hasta = $2, fecha_desde = $3, fecha_hasta = $4, lunes = $5, martes = $6, miercoles = $7, jueves =$8, viernes = $9, sabado = $10 WHERE id_user = $11";
                    return [4 /*yield*/, pool.query(updateUsersPuestosQuery, [horaDesde, horaHasta, usersPuestos.fecha_desde, usersPuestos.fecha_hasta,
                            usersPuestos.dias[0], usersPuestos.dias[1], usersPuestos.dias[2],
                            usersPuestos.dias[3], usersPuestos.dias[4], usersPuestos.dias[5], usersPuestos.id_user])];
                case 17:
                    queryResultUsersPuestos = _a.sent();
                    console.log('users puestos updated');
                    _a.label = 18;
                case 18:
                    response = {
                        success: true,
                        body: {
                            coworker: coworker,
                            usersPuestos: usersPuestos,
                            selectedPlan: selectedPlan
                        }
                    };
                    res.status(200).json(response);
                    return [3 /*break*/, 20];
                case 19:
                    err_7 = _a.sent();
                    console.log(err_7);
                    response = {
                        success: false,
                        error: err_7
                    };
                    res.status(400).json(response);
                    return [3 /*break*/, 20];
                case 20: return [2 /*return*/];
            }
        });
    });
}
exports.updateCoworker = updateCoworker;
function deleteCoworker(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var idUser, updateGroupLeader, coworkerQueryResult, deleteUsersPuestosQuery, usersPuestosQueryResult, deleteReservasQuery, reservasQueryResult, selectPlanId, selectPlanIdResult, plan, deletePlanQuery, deletePlanQueryResult, deleteCoworkerQuery, deleteCoworkerQueryResult, response, err_8, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    idUser = req.params.id;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    updateGroupLeader = 'UPDATE groups SET id_lider = NULL WHERE id_lider = $1';
                    return [4 /*yield*/, pool.query(updateGroupLeader, [idUser])];
                case 2:
                    coworkerQueryResult = _a.sent();
                    deleteUsersPuestosQuery = 'DELETE FROM users_puestos WHERE id_user = $1';
                    return [4 /*yield*/, pool.query(deleteUsersPuestosQuery, [idUser])];
                case 3:
                    usersPuestosQueryResult = _a.sent();
                    deleteReservasQuery = 'DELETE FROM reservas WHERE id_user = $1';
                    return [4 /*yield*/, pool.query(deleteReservasQuery, [idUser])];
                case 4:
                    reservasQueryResult = _a.sent();
                    selectPlanId = 'SELECT id_plan FROM users WHERE id = $1';
                    return [4 /*yield*/, pool.query(selectPlanId, [idUser])];
                case 5:
                    selectPlanIdResult = _a.sent();
                    plan = selectPlanIdResult.rows[0];
                    deletePlanQuery = 'DELETE FROM plans WHERE id = $1 AND is_custom = true';
                    return [4 /*yield*/, pool.query(deletePlanQuery, [plan.id])];
                case 6:
                    deletePlanQueryResult = _a.sent();
                    deleteCoworkerQuery = 'DELETE FROM users WHERE id = $1';
                    return [4 /*yield*/, pool.query(deleteCoworkerQuery, [idUser])];
                case 7:
                    deleteCoworkerQueryResult = _a.sent();
                    response = {
                        success: true,
                        error: '',
                        body: {}
                    };
                    return [2 /*return*/, res.status(200).json(response)];
                case 8:
                    err_8 = _a.sent();
                    console.log(err_8);
                    response = {
                        success: false,
                        error: err_8
                    };
                    res.status(400).json(response);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.deleteCoworker = deleteCoworker;
function getAllPlanesAndGropus(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var plans, groups, selectPlans, plansQueryResult, e_1, responseError, selectGroups, groupsQueryResult, e_2, responseError, response, err_9, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    plans = [];
                    groups = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    selectPlans = 'SELECT id, horas_sala, is_custom, nombre, descripcion FROM plans WHERE is_custom = false';
                    return [4 /*yield*/, pool.query(selectPlans)];
                case 2:
                    plansQueryResult = _a.sent();
                    plans = plansQueryResult.rows;
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    console.log('error searching plans');
                    console.log(e_1);
                    responseError = {
                        success: false,
                        error: e_1
                    };
                    res.status(400).json(responseError);
                    return [3 /*break*/, 4];
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    selectGroups = 'SELECT id, id_lider, nombre, cuit_cuil FROM groups';
                    return [4 /*yield*/, pool.query(selectGroups)];
                case 5:
                    groupsQueryResult = _a.sent();
                    groups = groupsQueryResult.rows;
                    return [3 /*break*/, 7];
                case 6:
                    e_2 = _a.sent();
                    console.log('error searching groups');
                    console.log(e_2);
                    responseError = {
                        success: false,
                        error: e_2
                    };
                    res.status(400).json(responseError);
                    return [3 /*break*/, 7];
                case 7:
                    response = {
                        success: true,
                        plans: plans,
                        groups: groups
                    };
                    res.status(200).json(response);
                    return [3 /*break*/, 9];
                case 8:
                    err_9 = _a.sent();
                    console.log(err_9);
                    response = {
                        success: false,
                        error: err_9
                    };
                    res.status(400).json(response);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.getAllPlanesAndGropus = getAllPlanesAndGropus;
