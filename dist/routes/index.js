"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const users_controller_1 = require("../controllers/users.controller");
const coworkers_controller_1 = require("../controllers/coworkers.controller");
const groups_controller_1 = require("../controllers/groups.controller");
exports.router = express_1.Router();
/// Users
exports.router.get('/users', users_controller_1.getUsers);
exports.router.get('/getUserById/:id', users_controller_1.getUserById);
exports.router.post('/users', users_controller_1.postUsers);
exports.router.delete('/users/:id', users_controller_1.deleteUser);
exports.router.put('/users/:id', users_controller_1.updateUser);
exports.router.post('/users/login', users_controller_1.loginUser);
/// Coworkers
exports.router.get('/coworkers', coworkers_controller_1.getCoworkers);
exports.router.get('/coworkers/count', coworkers_controller_1.getCoworkersCount);
exports.router.get('/coworkers/getById/:id', coworkers_controller_1.getCoworkerById);
exports.router.post('/coworkers', coworkers_controller_1.createCoworker);
/// Groups
exports.router.get('/groups', groups_controller_1.getGroups);
//# sourceMappingURL=index.js.map