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
exports.getGroupById = exports.deleteGroup = exports.editGroup = exports.createGroup = exports.getGroupsCount = exports.getAllGroups = exports.getGroups = void 0;
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    host: process.env.DBHOST || 'localhost',
    port: 5432,
    user: process.env.DBUSER || 'postgres',
    password: process.env.DBPASS || 'du3nak7Q7LdaPGr',
    database: process.env.DBNAME || 'brujuladb',
    ssl: true
});
function getGroups(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // table filters
        const itemsPerPage = req.query.pageSize;
        const pageNumber = req.query.pageNumber;
        const order = req.query.sortOrder;
        const filter = req.query.filter;
        // selects data for table loading
        // LIMIT gets the items and number of page
        const query = `SELECT g.id, g.nombre, g.id_lider, g.cuit_cuil, g.id_oficina, o.nombre as nombre_oficina
                    FROM groups g LEFT JOIN oficinas o ON g.id_oficina = o.id
                    WHERE LOWER(g.nombre) LIKE '%' || LOWER($3) || '%'
                    ORDER BY g.created_at DESC
                    LIMIT $1 OFFSET ($2::numeric * $1)`;
        const queryResult = yield pool.query(query, [itemsPerPage, pageNumber, filter]);
        res.json(queryResult.rows);
    });
}
exports.getGroups = getGroups;
function getAllGroups(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = `SELECT id, nombre, id_lider, cuit_cuil, id_oficina
                    FROM groups`;
        const queryResult = yield pool.query(query);
        res.json(queryResult.rows);
    });
}
exports.getAllGroups = getAllGroups;
function getGroupsCount(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = 'SELECT COUNT(*) FROM groups';
        const queryResult = yield pool.query(query);
        res.json(queryResult.rows[0]);
    });
}
exports.getGroupsCount = getGroupsCount;
function createGroup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const group = req.body.group;
        try {
            // insert query to users
            const insertCoworkerQuery = "INSERT INTO groups (nombre, cuit_cuil, id_oficina, id_lider, created_at) VALUES ($1, $2, $3, NULL, CURRENT_TIMESTAMP) RETURNING id;";
            const queryResult = yield pool.query(insertCoworkerQuery, [group.nombre, group.cuit_cuil, group.id_oficina]);
            group.id = queryResult.rows[0].id;
            const response = {
                success: true,
                body: {
                    group,
                },
            };
            console.log('createGroup performed successfully!');
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
exports.createGroup = createGroup;
function editGroup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const group = req.body.group;
        const idGroup = req.params.id;
        try {
            // insert query to users
            const insertCoworkerQuery = "UPDATE groups SET nombre = $1, cuit_cuil=$2, id_oficina=$3 WHERE id=$4";
            const queryResult = yield pool.query(insertCoworkerQuery, [group.nombre, group.cuit_cuil, group.id_oficina, idGroup]);
            const response = {
                success: true,
                body: {
                    group,
                },
            };
            console.log('editGroup performed successfully!');
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
exports.editGroup = editGroup;
function deleteGroup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const idGroup = req.params.id;
        try {
            try {
                const deleteUsersPuestosQuery = 'DELETE FROM groups WHERE id = $1';
                const usersPuestosQueryResult = yield pool.query(deleteUsersPuestosQuery, [idGroup]);
            }
            catch (err) {
                console.log(err);
                const dbErrorResponse = {
                    success: false,
                    error: 'Existen coworkers asociados a este grupo'
                };
                res.status(400).json(dbErrorResponse);
            }
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
exports.deleteGroup = deleteGroup;
function getGroupById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const idGrupo = req.params.id;
        const query = 'SELECT id, nombre, cuit_cuil, id_oficina FROM groups WHERE id = $1';
        const queryResult = yield pool.query(query, [idGrupo]);
        res.json(queryResult.rows[0]);
    });
}
exports.getGroupById = getGroupById;
//# sourceMappingURL=groups.controller.js.map