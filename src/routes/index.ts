import { Router } from 'express';
import { getUsers, postUsers, getUserById, deleteUser, updateUser, loginUser } from '../controllers/index.controller'


export const router = Router();




router.get('/users', getUsers)
router.get('/getUserById/:id', getUserById)
router.post('/users', postUsers)
router.delete('/users/:id', deleteUser)
router.put('/users/:id', updateUser)
router.post('/users/login', loginUser)