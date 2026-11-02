// src/models/books.js
import { getDb } from '../db/connect.js';
import { byIdNumber, insertWithNextId } from './ids.js';

// Only return the fields defined in the spec (hide MongoDB's internal _id)
const bookProjection = { _id: 0, id: 1, title: 1, authorId: 1, publicationDate: 1 };

const books = () => getDb().collection('books');

const getAllBooks = async () => {
  const list = await books().find({}, { projection: bookProjection }).toArray();
  return list.sort(byIdNumber);
};

const getBookById = async (bookId) => {
  return books().findOne({ id: bookId }, { projection: bookProjection });
};

const getBooksByAuthor = async (authorId) => {
  const list = await books().find({ authorId }, { projection: bookProjection }).toArray();
  return list.sort(byIdNumber);
};

// fields: { title, authorId, publicationDate } already validated; returns the created book
const createBook = async (fields) => {
  return insertWithNextId(books(), 'b', fields);
};

// Full update: the stored book becomes { id, ...fields }. Returns null if the id does not exist.
const updateBook = async (bookId, fields) => {
  return books().findOneAndReplace(
    { id: bookId },
    { id: bookId, ...fields },
    { returnDocument: 'after', projection: bookProjection },
  );
};

// Returns true if a book was deleted
const deleteBook = async (bookId) => {
  const result = await books().deleteOne({ id: bookId });
  return result.deletedCount === 1;
};

export { getAllBooks, getBookById, getBooksByAuthor, createBook, updateBook, deleteBook };
