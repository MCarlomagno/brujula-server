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
exports.__esModule = true;
exports.getGroupById = exports.deleteGroup = exports.editGroup = exports.createGroup = exports.getGroupsCount = exports.getAllGroups = exports.getGroups = void 0;
var pg_1 = require("pg");
var pool = new pg_1.Pool({
    host: process.env.DBHOST || 'localhost',
    port: 5432,
    user: process.env.DBUSER || 'postgres',
    password: process.env.DBPASS || 'du3nak7Q7LdaPGr',
    database: process.env.DBNAME || 'brujuladb',
    ssl: true
});
function getGroups(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var itemsPerPage, pageNumber, order, filter, query, queryResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    itemsPerPage = req.query.pageSize;
                    pageNumber = req.query.pageNumber;
                    order = req.query.sortOrder;
                    filter = req.query.filter;
                    query = "SELECT g.id, g.nombre, g.id_lider, g.cuit_cuil, g.id_oficina, o.nombre as nombre_oficina\n                    FROM groups g LEFT JOIN oficinas o ON g.id_oficina = o.id\n                    WHERE LOWER(g.nombre) LIKE '%' || LOWER($3) || '%'\n                    ORDER BY g.created_at DESC\n                    LIMIT $1 OFFSET ($2::numeric * $1)";
                    return [4 /*yield*/, pool.query(query, [itemsPerPage, pageNumber, filter])];
                case 1:
                    queryResult = _a.sent();
                    res.json(queryResult.rows);
                    return [2 /*return*/];
            }
        });
    });
}
exports.getGroups = getGroups;
function getAllGroups(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var query, queryResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = "SELECT id, nombre, id_lider, cuit_cuil, id_oficina\n                    FROM groups";
                    return [4 /*yield*/, pool.query(query)];
                case 1:
                    queryResult = _a.sent();
                    res.json(queryResult.rows);
                    return [2 /*return*/];
            }
        });
    });
}
exports.getAllGroups = getAllGroups;
function getGroupsCount(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var query, queryResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = 'SELECT COUNT(*) FROM groups';
                    return [4 /*yield*/, pool.query(query)];
                case 1:
                    queryResult = _a.sent();
                    res.json(queryResult.rows[0]);
                    return [2 /*return*/];
            }
        });
    });
}
exports.getGroupsCount = getGroupsCount;
function createGroup(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var group, insertCoworkerQuery, queryResult, response, err_1, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    group = req.body.group;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    insertCoworkerQuery = "INSERT INTO groups (nombre, cuit_cuil, id_oficina, id_lider, created_at) VALUES ($1, $2, $3, NULL, CURRENT_TIMESTAMP) RETURNING id;";
                    return [4 /*yield*/, pool.query(insertCoworkerQuery, [group.nombre, group.cuit_cuil, group.id_oficina])];
                case 2:
                    queryResult = _a.sent();
                    group.id = queryResult.rows[0].id;
                    response = {
                        success: true,
                        body: {
                            group: group
                        }
                    };
                    console.log('createGroup performed successfully!');
                    res.status(200).json(response);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.log(err_1);
                    response = {
                        success: false,
                        error: err_1
                    };
                    res.status(400).json(response);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.createGroup = createGroup;
function editGroup(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var group, idGroup, insertCoworkerQuery, queryResult, response, err_2, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    group = req.body.group;
                    idGroup = req.params.id;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    insertCoworkerQuery = "UPDATE groups SET nombre = $1, cuit_cuil=$2, id_oficina=$3 WHERE id=$4";
                    return [4 /*yield*/, pool.query(insertCoworkerQuery, [group.nombre, group.cuit_cuil, group.id_oficina, idGroup])];
                case 2:
                    queryResult = _a.sent();
                    response = {
                        success: true,
                        body: {
                            group: group
                        }
                    };
                    console.log('editGroup performed successfully!');
                    res.status(200).json(response);
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    console.log(err_2);
                    response = {
                        success: false,
                        error: err_2
                    };
                    res.status(400).json(response);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.editGroup = editGroup;
function deleteGroup(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var idGroup, deleteUsersPuestosQuery, usersPuestosQueryResult, err_3, dbErrorResponse, response, err_4, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    idGroup = req.params.id;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    deleteUsersPuestosQuery = 'DELETE FROM groups WHERE id = $1';
                    return [4 /*yield*/, pool.query(deleteUsersPuestosQuery, [idGroup])];
                case 3:
                    usersPuestosQueryResult = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_3 = _a.sent();
                    console.log(err_3);
                    dbErrorResponse = {
                        success: false,
                        error: 'Existen coworkers asociados a este grupo'
                    };
                    res.status(400).json(dbErrorResponse);
                    return [3 /*break*/, 5];
                case 5:
                    response = {
                        success: true,
                        error: '',
                        body: {}
                    };
                    return [2 /*return*/, res.status(200).json(response)];
                case 6:
                    err_4 = _a.sent();
                    console.log(err_4);
                    response = {
                        success: false,
                        error: err_4
                    };
                    res.status(400).json(response);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.deleteGroup = deleteGroup;
function getGroupById(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var idGrupo, query, queryResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    idGrupo = req.params.id;
                    query = 'SELECT id, nombre, cuit_cuil, id_oficina FROM groups WHERE id = $1';
                    return [4 /*yield*/, pool.query(query, [idGrupo])];
                case 1:
                    queryResult = _a.sent();
                    res.json(queryResult.rows[0]);
                    return [2 /*return*/];
            }
        });
    });
}
exports.getGroupById = getGroupById;
