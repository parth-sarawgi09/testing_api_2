const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3010;

app.use(express.json());

// Load book data from data.json
let booksData = JSON.parse(fs.readFileSync('data.json', 'utf8'));




// ✅ Get all books
app.get('/books', (req, res) => {
    res.json({ count: booksData.length, books: booksData });
});

// ✅ Get a book by ID
app.get('/books/:id', (req, res) => {
    const book = booksData.find(b => b.book_id === req.params.id);
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }
    res.json(book);
});


// ✅ Add a new book
app.post('/books/add', (req, res) => {
    const { book_id, title, author, genre, year, copies } = req.body;

    if (!book_id || !title || !author || !genre || !year || !copies) {
        return res.status(400).json({ message: "Missing required fields: book_id, title, author, genre, year, copies" });
    }

    const newBook = { book_id, title, author, genre, year, copies };
    booksData.push(newBook);

    fs.writeFileSync('data.json', JSON.stringify(booksData, null, 2));

    res.status(201).json({ message: "Book added successfully", book: newBook });
});

// ✅ Get books published after a certain year
app.post('/books/after-year', (req, res) => {
    const { year } = req.body;

    if (typeof year !== 'number' || isNaN(year)) {
        return res.status(400).json({ message: "Invalid year. Please provide a valid number." });
    }

    const filteredBooks = booksData.filter(book => book.year > year);

    res.json({
        count: filteredBooks.length,
        books: filteredBooks.map(book => ({
            title: book.title,
            author: book.author,
            year: book.year
        }))
    });
});

// ✅ DELETE a book by ID
app.delete('/books/:id', (req, res) => {
  const bookId = req.params.id;
  
  // Find the book
  const bookIndex = booksData.findIndex(b => b.book_id === bookId);
  
  if (bookIndex === -1) {
      return res.status(404).json({ message: "Book not found" });
  }

  // Remove the book
  const deletedBook = booksData.splice(bookIndex, 1);

  // Save the updated list to data.json
  fs.writeFileSync('data.json', JSON.stringify(booksData, null, 2));

  res.json({ message: "Book deleted successfully", book: deletedBook[0] });
});

// ✅ Serve static files (for future use)
app.use(express.static('static'));

// ✅ Serve homepage
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'pages/index.html'));
});

// ✅ Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
