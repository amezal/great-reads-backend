import express from 'express';
import { getBook, updateBook, updateBookRatings, updateBookReviews } from '../controllers/books.js';

const router = express.Router();

router.get('/:id', getBook)

router.post('/:id', updateBook)

router.post('/:id/ratings', updateBookRatings);

router.post('/:id/reviews', updateBookReviews);

export default router;