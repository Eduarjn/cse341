// src/models/ids.js
// Ids are a prefix plus a number: a1, a2, ... for authors and b1, b2, ... for books.

const idNumber = (id) => Number(String(id).replace(/^\D+/, '')) || 0;

// Sorts by the number in the id, so a2 comes before a10
const byIdNumber = (a, b) => idNumber(a.id) - idNumber(b.id);

const nextId = async (collection, prefix) => {
  const documents = await collection
    .find({ id: { $regex: `^${prefix}\\d+$` } }, { projection: { _id: 0, id: 1 } })
    .toArray();
  const highest = documents.reduce((max, document) => Math.max(max, idNumber(document.id)), 0);
  return `${prefix}${highest + 1}`;
};

// Inserts with the next free id; tries again if another request took the same id first
const insertWithNextId = async (collection, prefix, fields) => {
  for (let attempt = 1; ; attempt += 1) {
    const document = { id: await nextId(collection, prefix), ...fields };
    try {
      await collection.insertOne({ ...document });
      return document;
    } catch (error) {
      if (error.code !== 11000 || attempt === 3) {
        throw error;
      }
    }
  }
};

export { byIdNumber, insertWithNextId };
