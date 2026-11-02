// src/validation.js
// Each validator returns { value, errors }: value holds only the allowed fields (trimmed),
// errors lists every problem so the client can fix them all at once.

const isPlainObject = (body) => body !== null && typeof body === 'object' && !Array.isArray(body);

// Required or optional text field, trimmed, with a maximum length
const readText = (body, field, { required, max }, errors) => {
  const raw = body[field];
  if (raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '')) {
    if (required) {
      errors.push(`${field} is required`);
    }
    return undefined;
  }
  if (typeof raw !== 'string') {
    errors.push(`${field} must be a string`);
    return undefined;
  }
  const text = raw.trim();
  if (text.length > max) {
    errors.push(`${field} must be at most ${max} characters`);
  }
  return text;
};

const validateAuthor = (body) => {
  if (!isPlainObject(body)) {
    return { value: null, errors: ['request body must be a JSON object'] };
  }
  const errors = [];
  const name = readText(body, 'name', { required: true, max: 100 }, errors);
  const nationality = readText(body, 'nationality', { required: false, max: 60 }, errors);

  const value = { name };
  if (nationality !== undefined) {
    value.nationality = nationality;
  }
  return { value, errors };
};

// Required ISO 8601 date (YYYY-MM-DD) that exists on the calendar (2021-02-30 does not)
const readDate = (body, field, errors) => {
  const raw = body[field];
  if (raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '')) {
    errors.push(`${field} is required`);
    return undefined;
  }
  const text = typeof raw === 'string' ? raw.trim() : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    errors.push(`${field} must be a date in YYYY-MM-DD format`);
    return undefined;
  }
  const [year, month, day] = text.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    errors.push(`${field} must be a real calendar date`);
    return undefined;
  }
  return text;
};

// Checks the fields only; whether authorId exists is checked against the database in the controller
const validateBook = (body) => {
  if (!isPlainObject(body)) {
    return { value: null, errors: ['request body must be a JSON object'] };
  }
  const errors = [];
  const title = readText(body, 'title', { required: true, max: 200 }, errors);
  const authorId = readText(body, 'authorId', { required: true, max: 20 }, errors);
  const publicationDate = readDate(body, 'publicationDate', errors);
  return { value: { title, authorId, publicationDate }, errors };
};

export { validateAuthor, validateBook, isPlainObject, readText };
