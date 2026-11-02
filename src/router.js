// src/router.js
import express from 'express';
import {
  getBooksHandler,
  getBookByIdHandler,
  createBookHandler,
  updateBookHandler,
  deleteBookHandler,
} from './controllers/books.js';
import {
  getAuthorsHandler,
  getAuthorByIdHandler,
  getAuthorBooksHandler,
  createAuthorHandler,
  updateAuthorHandler,
  deleteAuthorHandler,
} from './controllers/authors.js';

const router = express.Router();

router.get('/books', getBooksHandler);
router.get('/books/:id', getBookByIdHandler);
router.post('/books', createBookHandler);
router.put('/books/:id', updateBookHandler);
router.delete('/books/:id', deleteBookHandler);

router.get('/authors', getAuthorsHandler);
router.get('/authors/:id', getAuthorByIdHandler);
router.get('/authors/:id/books', getAuthorBooksHandler);
router.post('/authors', createAuthorHandler);
router.put('/authors/:id', updateAuthorHandler);
router.delete('/authors/:id', deleteAuthorHandler);

export default router;
