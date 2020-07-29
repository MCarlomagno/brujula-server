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
exports.router.put('/coworkers/:id', coworkers_controller_1.updateCoworker);
exports.router.delete('/coworkers/:id', coworkers_controller_1.deleteCoworker);
/// Groups
exports.router.get('/groups', groups_controller_1.getGroups);
exports.router.get('/groups/getAll', groups_controller_1.getAllGroups);
exports.router.get('/groups/count', groups_controller_1.getGroupsCount);
exports.router.get('/groups/getById/:id', groups_controller_1.getGroupById);
exports.router.post('/groups', groups_controller_1.createGroup);
exports.router.put('/groups/:id', groups_controller_1.editGroup);
exports.router.delete('/groups/:id', groups_controller_1.deleteGroup);
//# sourceMappingURL=index.js.map