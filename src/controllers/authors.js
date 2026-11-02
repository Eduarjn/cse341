// src/controllers/authors.js
import { getAllAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor } from '../models/authors.js';
import { validateAuthor } from '../validation.js';

const serverError = (res, route, error) => {
  console.error(`${route} failed:`, error.message);
  return res.status(500).json({ message: 'Internal server error' });
};

const validationFailed = (res, errors) => res.status(400).json({ message: 'Validation failed', errors });

const getAuthorsHandler = async (req, res) => {
  try {
    const authors = await getAllAuthors();
    return res.status(200).json(authors);
  } catch (error) {
    return serverError(res, 'GET /authors', error);
  }
};

const getAuthorByIdHandler = async (req, res) => {
  try {
    const author = await getAuthorById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    return res.status(200).json(author);
  } catch (error) {
    return serverError(res, 'GET /authors/:id', error);
  }
};

const createAuthorHandler = async (req, res) => {
  const { value, errors } = validateAuthor(req.body);
  if (errors.length > 0) {
    return validationFailed(res, errors);
  }

  try {
    const author = await createAuthor(value);
    return res.status(201).location(`/authors/${author.id}`).json(author);
  } catch (error) {
    return serverError(res, 'POST /authors', error);
  }
};

const updateAuthorHandler = async (req, res) => {
  const { value, errors } = validateAuthor(req.body);
  if (errors.length > 0) {
    return validationFailed(res, errors);
  }

  try {
    const author = await updateAuthor(req.params.id, value);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    return res.status(200).json(author);
  } catch (error) {
    return serverError(res, 'PUT /authors/:id', error);
  }
};

const deleteAuthorHandler = async (req, res) => {
  try {
    const deleted = await deleteAuthor(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Author not found' });
    }
    return res.status(204).end();
  } catch (error) {
    return serverError(res, 'DELETE /authors/:id', error);
  }
};

export { getAuthorsHandler, getAuthorByIdHandler, createAuthorHandler, updateAuthorHandler, deleteAuthorHandler };
