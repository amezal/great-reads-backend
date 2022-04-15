import express from 'express';
import { checkJwt, getUserInfo } from '../middleware.js';
import { getCurrentUser, getUserById, addToList, updateLists, deleteBook } from '../controllers/users.js';
import { updateBookStats, deleteBookStats } from '../controllers/books.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Users');
})

router.get('/current', checkJwt, getUserInfo, getCurrentUser);

router.get('/:id', getUserById);

router.post('/current/:list', checkJwt, addToList, updateBookStats);

router.patch('/current/:list', checkJwt, updateLists, updateBookStats);

router.delete('/current/:list', checkJwt, deleteBook, deleteBookStats);

export default router;