# CSE 341 Books API

A read-only web service built with Express and MongoDB that returns book data.

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

## Seed data

Create the `books` collection in the `cse341-books-db` database with MongoDB Atlas
Data Explorer and insert the documents from `scripts/books.seed.json`
(Insert Document → JSON view → paste the array).
