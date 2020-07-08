"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const index_controller_1 = require("../controllers/index.controller");
exports.router = express_1.Router();
exports.router.get('/users', index_controller_1.getUsers);
exports.router.get('/getUserById/:id', index_controller_1.getUserById);
exports.router.post('/users', index_controller_1.postUsers);
exports.router.delete('/users/:id', index_controller_1.deleteUser);
exports.router.put('/users/:id', index_controller_1.updateUser);
//# sourceMappingURL=index.js.map