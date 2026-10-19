// Books API - Laboratory Activity (ITPE101)
// A simple RESTful API built with Express.js using in-memory storage.

const express = require("express");

const app = express();

// Enable JSON request-body parsing
app.use(express.json());

// Render supplies the port via process.env.PORT; fall back to 3000 locally
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// In-memory data store (temporary - resets when the server restarts)
// ---------------------------------------------------------------------------
let books = [
  { id: 1, title: "Clean Code", author: "Robert C. Martin", year: 2008, genre: "Programming" },
  { id: 2, title: "The Pragmatic Programmer", author: "Andrew Hunt", year: 1999, genre: "Programming" },
  { id: 3, title: "Noli Me Tangere", author: "Jose Rizal", year: 1887, genre: "Novel" },
];
let nextId = 4;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const currentYear = new Date().getFullYear();

// Validate book data. When `partial` is true (PATCH), only provided fields are
// checked. When false (POST/PUT), title, author and year are required.
function validateBook(data, partial = false) {
  const errors = [];

  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    return ["Request body must be a JSON object."];
  }

  if (!partial || data.title !== undefined) {
    if (typeof data.title !== "string" || data.title.trim() === "") {
      errors.push("title is required and must be a non-empty string.");
    }
  }

  if (!partial || data.author !== undefined) {
    if (typeof data.author !== "string" || data.author.trim() === "") {
      errors.push("author is required and must be a non-empty string.");
    }
  }

  if (!partial || data.year !== undefined) {
    if (!Number.isInteger(data.year) || data.year < 1 || data.year > currentYear) {
      errors.push(`year is required and must be an integer between 1 and ${currentYear}.`);
    }
  }

  if (data.genre !== undefined && (typeof data.genre !== "string" || data.genre.trim() === "")) {
    errors.push("genre, if provided, must be a non-empty string.");
  }

  if (partial && Object.keys(data).filter((k) => ["title", "author", "year", "genre"].includes(k)).length === 0) {
    errors.push("Provide at least one field to update: title, author, year, genre.");
  }

  return errors;
}

// Parse and validate the :id route parameter. Returns a number or null.
function parseId(value) {
  return /^\d+$/.test(value) ? Number(value) : null;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Root route - handy for verifying the deployment
app.get("/", (req, res) => {
  res.json({
    message: "Books API is running",
    endpoints: "/api/books",
  });
});

// READ ALL - GET /api/books  (optional ?author= filter)
app.get("/api/books", (req, res) => {
  let result = books;
  if (req.query.author) {
    const q = String(req.query.author).toLowerCase();
    result = books.filter((b) => b.author.toLowerCase().includes(q));
  }
  res.status(200).json({ count: result.length, data: result });
});

// READ ONE - GET /api/books/:id
app.get("/api/books/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Invalid ID. ID must be a positive integer." });
  }
  const book = books.find((b) => b.id === id);
  if (!book) {
    return res.status(404).json({ error: `Book with id ${id} not found.` });
  }
  res.status(200).json(book);
});

// CREATE - POST /api/books
app.post("/api/books", (req, res) => {
  const errors = validateBook(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed.", details: errors });
  }

  const { title, author, year, genre } = req.body;
  const newBook = {
    id: nextId++,
    title: title.trim(),
    author: author.trim(),
    year,
    genre: genre ? genre.trim() : "Uncategorized",
  };
  books.push(newBook);
  res.status(201).json(newBook);
});

// UPDATE (full replacement) - PUT /api/books/:id
app.put("/api/books/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Invalid ID. ID must be a positive integer." });
  }
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Book with id ${id} not found.` });
  }

  const errors = validateBook(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed.", details: errors });
  }

  const { title, author, year, genre } = req.body;
  books[index] = {
    id,
    title: title.trim(),
    author: author.trim(),
    year,
    genre: genre ? genre.trim() : "Uncategorized",
  };
  res.status(200).json(books[index]);
});

// UPDATE (partial) - PATCH /api/books/:id
app.patch("/api/books/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Invalid ID. ID must be a positive integer." });
  }
  const book = books.find((b) => b.id === id);
  if (!book) {
    return res.status(404).json({ error: `Book with id ${id} not found.` });
  }

  const errors = validateBook(req.body, true);
  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed.", details: errors });
  }

  // Only the permitted fields can be updated (id cannot be changed)
  ["title", "author", "genre"].forEach((field) => {
    if (req.body[field] !== undefined) book[field] = req.body[field].trim();
  });
  if (req.body.year !== undefined) book.year = req.body.year;

  res.status(200).json(book);
});

// DELETE - DELETE /api/books/:id
app.delete("/api/books/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Invalid ID. ID must be a positive integer." });
  }
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Book with id ${id} not found.` });
  }
  const [deleted] = books.splice(index, 1);
  res.status(200).json({ message: `Book with id ${id} deleted successfully.`, deleted });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

// Unknown routes
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

// Malformed JSON and other errors
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Malformed JSON in request body." });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
