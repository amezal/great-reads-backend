import express from 'express';
import { getAuthor, getAuthorBooks } from '../controllers/authors.js';

const router = express.Router();

router.get('/:id', getAuthor)

router.get('/:id/books', getAuthorBooks)


export default router;