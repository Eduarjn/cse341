// src/controllers/books.js
import { getAllBooks, getBookById, createBook, updateBook, deleteBook } from '../models/books.js';
import { getAuthorById } from '../models/authors.js';
import { validateBook } from '../validation.js';

const serverError = (res, route, error) => {
  console.error(`${route} failed:`, error.message);
  return res.status(500).json({ message: 'Internal server error' });
};

const validationFailed = (res, errors) => res.status(400).json({ message: 'Validation failed', errors });

// Validates the body and checks that authorId points to an existing author.
// Returns the fields to save, or null after sending a 400 response.
const readBookBody = async (req, res) => {
  const { value, errors } = validateBook(req.body);
  if (errors.length > 0) {
    validationFailed(res, errors);
    return null;
  }
  const author = await getAuthorById(value.authorId);
  if (!author) {
    validationFailed(res, ['authorId does not match an existing author']);
    return null;
  }
  return value;
};

const getBooksHandler = async (req, res) => {
  try {
    const books = await getAllBooks();
    return res.status(200).json(books);
  } catch (error) {
    return serverError(res, 'GET /books', error);
  }
};

const getBookByIdHandler = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const book = await getBookById(requestedId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    return serverError(res, 'GET /books/:id', error);
  }
};

const createBookHandler = async (req, res) => {
  try {
    const fields = await readBookBody(req, res);
    if (!fields) {
      return res;
    }
    const book = await createBook(fields);
    return res.status(201).location(`/books/${book.id}`).json(book);
  } catch (error) {
    return serverError(res, 'POST /books', error);
  }
};

const updateBookHandler = async (req, res) => {
  try {
    const fields = await readBookBody(req, res);
    if (!fields) {
      return res;
    }
    const book = await updateBook(req.params.id, fields);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    return res.status(200).json(book);
  } catch (error) {
    return serverError(res, 'PUT /books/:id', error);
  }
};

const deleteBookHandler = async (req, res) => {
  try {
    const deleted = await deleteBook(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Book not found' });
    }
    return res.status(204).end();
  } catch (error) {
    return serverError(res, 'DELETE /books/:id', error);
  }
};

export { getBooksHandler, getBookByIdHandler, createBookHandler, updateBookHandler, deleteBookHandler };
