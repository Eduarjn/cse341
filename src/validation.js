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

export { validateAuthor, isPlainObject, readText };
