import express from 'express';
import { searchBooks, searchUsers } from '../controllers/search.js'

const router = express.Router();

router.get('/books', searchBooks)
router.get('/users', searchUsers)

export default router;