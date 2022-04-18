import express from 'express';
import { searchBooks, searchUsers, searchAuthors } from '../controllers/search.js'

const router = express.Router();

router.get('/books', searchBooks);
router.get('/users', searchUsers);
router.get('/authors', searchAuthors);

export default router;