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
| POST   | `/books`     | Create a book (201, `Location` header; `authorId` must exist) |
| PUT    | `/books/:id` | Replace a book (full update) |
| DELETE | `/books/:id` | Delete a book (204) |
| GET    | `/authors`     | Return all authors |
| GET    | `/authors/:id` | Return one author by `id` |
| POST   | `/authors`     | Create an author (201, `Location` header) |
| PUT    | `/authors/:id` | Replace an author (full update) |
| DELETE | `/authors/:id` | Delete an author (204; 409 while books reference it) |
| GET    | `/authors/:id/books` | Return the books of one author |
| GET    | `/api-docs`  | Swagger UI (try every route) |

## Seed data

`npm run seed` upserts `scripts/authors.seed.json` and `scripts/books.seed.json` into the
database in `.env`. It also converts the Week 01 books (`author` text) to the Week 02 model
(`authorId` referencing `authors.id`). Books and authors are specified in
[`docs/week02-spec.md`](docs/week02-spec.md).

## API documentation

Swagger UI is served at `/api-docs` (locally `http://localhost:3000/api-docs`, deployed
`https://cse341-books-api-qe83.onrender.com/api-docs`). The OpenAPI document is `swagger.json`.

## Tests

`npm test` runs the API against a MongoDB that runs in memory (the first run downloads the
MongoDB binary), so the tests never touch Atlas.
