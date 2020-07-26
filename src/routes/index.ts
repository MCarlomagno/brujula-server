import { Router } from 'express';
import { getUsers, postUsers, getUserById, deleteUser, updateUser, loginUser } from '../controllers/users.controller';
import { getCoworkers, createCoworker, getCoworkersCount, getCoworkerById, updateCoworker, deleteCoworker } from '../controllers/coworkers.controller';
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
router.get('/coworkers/count', getCoworkersCount)
router.get('/coworkers/getById/:id', getCoworkerById)
router.post('/coworkers', createCoworker)
router.put('/coworkers/:id', updateCoworker)
router.delete('/coworkers/:id', deleteCoworker)

/// Groups
router.get('/groups', getGroups)