import { Router } from 'express';
import { getUsers, postUsers, getUserById, deleteUser, updateUser, loginUser } from '../controllers/users.controller';
import { getCoworkers } from '../controllers/coworkers.controller';
import { getGroups } from '../controllers/groups.controller';

export const router = Router();

/// Users
router.get('/users', getUsers)
router.get('/getUserById/:id', getUserById)
router.post('/users', postUsers)
router.delete('/users/:id', deleteUser)
router.put('/users/:id', updateUser)
router.post('/users/login', loginUser)

/// Coworkers
router.get('/coworkers', getCoworkers)

/// Groups
router.get('/groups', getGroups)