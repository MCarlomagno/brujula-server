import { Router } from 'express';
import { getUsers, postUsers, getUserById, deleteUser, updateUser, loginUser } from '../controllers/users.controller';
import { getCoworkers, createCoworker, getCoworkersCount, getCoworkerById, updateCoworker, deleteCoworker, getAllPlanesAndGropus } from '../controllers/coworkers.controller';
import { getGroups, getGroupsCount, createGroup, deleteGroup, getAllGroups, getGroupById, editGroup } from '../controllers/groups.controller';
import { getSalas } from '../controllers/salas.controller';
import { createReservation, getReservationByWeek } from '../controllers/reservation.controller';
import { getOficinas } from '../controllers/oficinas.controller';

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
router.get('/coworkers/allPlanesAndGroups', getAllPlanesAndGropus)

/// Groups
router.get('/groups', getGroups)
router.get('/groups/getAll', getAllGroups);
router.get('/groups/count', getGroupsCount)
router.get('/groups/getById/:id', getGroupById)
router.post('/groups', createGroup)
router.put('/groups/:id', editGroup)
router.delete('/groups/:id', deleteGroup)

/// Salas
router.get('/salas', getSalas)

/// Reservation
router.post('/reservation', createReservation)
router.get('/reservation/byWeek', getReservationByWeek)

/// Oficinas
router.get('/oficinas', getOficinas)