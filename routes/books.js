import express from 'express';
import { getBook, updateBook, updateBookRatings } from '../controllers/books.js';

const router = express.Router();

router.get('/:id', getBook)

router.post('/:id', updateBook)

router.post('/:id/ratings', updateBookRatings);

export default router;