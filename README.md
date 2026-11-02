# CSE 341 Books API

A web service built with Express and MongoDB that returns book data, documented with Swagger.

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and fill in your MongoDB Atlas connection string.
3. Start the dev server: `npm run dev`

## Endpoints

| Method | Path         | Description              |
| ------ | ------------ | ------------------------ |
| GET    | `/`          | Health check             |
| GET    | `/books`     | Return all books         |
| GET    | `/books/:id` | Return one book by `id`  |
| GET    | `/api-docs`  | Swagger UI (try every route) |

## Seed data

Create the `books` collection in the `cse341-books-db` database with MongoDB Atlas
Data Explorer and insert the documents from `scripts/books.seed.json`
(Insert Document → JSON view → paste the array).

## API documentation

Swagger UI is served at `/api-docs` (locally `http://localhost:3000/api-docs`, deployed
`https://cse341-books-api-qe83.onrender.com/api-docs`). The OpenAPI document is `swagger.json`.

## Tests

`npm test` runs the API against a MongoDB that runs in memory (the first run downloads the
MongoDB binary), so the tests never touch Atlas.
