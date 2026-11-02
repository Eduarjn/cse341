// src/models/authors.js
import { getDb } from '../db/connect.js';
import { byIdNumber, insertWithNextId } from './ids.js';

// Only return the fields defined in the spec (hide MongoDB's internal _id)
const authorProjection = { _id: 0, id: 1, name: 1, nationality: 1 };

const authors = () => getDb().collection('authors');

const getAllAuthors = async () => {
  const list = await authors().find({}, { projection: authorProjection }).toArray();
  return list.sort(byIdNumber);
};

const getAuthorById = async (authorId) => {
  return authors().findOne({ id: authorId }, { projection: authorProjection });
};

// fields: { name, nationality? } already validated; returns the created author
const createAuthor = async (fields) => {
  return insertWithNextId(authors(), 'a', fields);
};

// Full update: the stored author becomes { id, ...fields }. Returns null if the id does not exist.
const updateAuthor = async (authorId, fields) => {
  return authors().findOneAndReplace(
    { id: authorId },
    { id: authorId, ...fields },
    { returnDocument: 'after', projection: authorProjection },
  );
};

// Returns true if an author was deleted
const deleteAuthor = async (authorId) => {
  const result = await authors().deleteOne({ id: authorId });
  return result.deletedCount === 1;
};

export { getAllAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor };
