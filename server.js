const express = require("express");
const path = require("path");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 8888;
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err.message);
});

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  info: String,
  read: Boolean
})
const Book = mongoose.model('Book', bookSchema);

//Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Use middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  const books = await Book.find()
  res.render("index", { title: "My Library", books });
});

app.get('/books', async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

app.get('/books/:id', async (req, res) => {
  const book = await Book.findById(req.params.id);
  res.json(book);
});


app.post('/books', async (req, res) => {
  const { title, author, info } = req.body;
  const newBook = new Book({ title, author, info, read: false });
  await newBook.save();
  res.redirect('/');
});

app.delete('/books/:id', async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.sendStatus(200);
});

app.put('/books/:id', async (req, res) => {
  const { read } = req.body;
  await Book.findByIdAndUpdate(req.params.id, { read });
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});