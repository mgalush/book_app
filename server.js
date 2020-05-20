'use strict';

const express = require('express');
const superagent = require('superagent');
require('dotenv').config();

// configs
const PORT = process.env.port || 3000;
const app = express();
const pg = require('pg');

// server config
app.set('view engine', 'ejs');

// form configs
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));

// pg
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);
client.connect();

app.get('/', renderHomePage);

app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new');
});

app.get('/searches/show', (req, res) => {
  res.render('pages/searches/show');
});

app.get('/books/:id', bookDetails);

app.get('/error', (req, res) => {
  res.status(404).render('pages/error');
});

app.get('*', (req, res) => {
  res.render('pages/error');
});

app.post('/searches', searchBook);

app.post('/books', saveBook);

function searchBook(req, res) {
  const url = 'https://www.googleapis.com/books/v1/volumes';
  const { keyword, type } = req.body.search;
  let q = '';

  if (type === 'title') {
    q += `intitle:${keyword}`;
  } else if (type === 'author') {
    q += `inauthor:${keyword}`;
  } else {
    res.send({ message: 'type must be title or author' });
  }

  superagent
    .get(url)
    .query({ q })
    .then((resultFromSuper) => {
      const dataFromAPI = resultFromSuper.body.items;
      const books = dataFromAPI.map((value) => {
        const googleBook = value.volumeInfo;

        // prevent mixed content warnings when API returns http instead of https on images
        let image_url = googleBook.imageLinks.thumbnail;
        if (image_url && image_url[4] === ':') {
          image_url = image_url.split(':').join('s:');
        }

        return new Book({
          title: googleBook.title,
          author: (googleBook.authors && googleBook.authors.length) ? googleBook.authors[0] : '',
          description: googleBook.description,
          image_url : image_url,
          isbn: (googleBook.industryIdentifiers && googleBook.industryIdentifiers.length)
            ? googleBook.industryIdentifiers[0].identifier
            : '',
        });
      });
      res.render('pages/searches/show', { books: books });
    })
    .catch((error) => {
      console.error(error);
      res.render('pages/error', { error: error });
    });
}

function renderHomePage(req, res) {
  client.query('SELECT * FROM books').then((result) => {
    res.render('pages/index', {
      books: result.rows,
      totalBookCount: result.rows.length,
    });
  });
}

function bookDetails(req, res) {
  client
    .query('SELECT * FROM books WHERE id=$1', [req.params.id])
    .then((dataFromSql) => {
      if (dataFromSql.rows.length === 0) {
        res.redirect('/error');
      }
      res.render('pages/books/show', { book: dataFromSql.rows[0] });
    });
}

function saveBook(req, res) {
  const sqlQuery =
    'INSERT INTO books (author, title, isbn, image_url, description, bookshelf) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
  const book = new Book(req.body.book);
  const valueArray = [
    book.author,
    book.title,
    book.isbn,
    book.image_url,
    book.description,
    'myBookshelf',
  ];
  client.query(sqlQuery, valueArray).then((dataFromSql) => {
    const id = dataFromSql.rows[0].id;
    res.redirect(`/books/${id}`);
  });
}

function Book(obj) {
  this.title = obj.title ? obj.title : 'Book Title';
  this.author = obj.author ? obj.author : 'Author';
  this.description = obj.description
    ? obj.description
    : 'Description unavailable';
  this.image_url = obj.image_url
    ? obj.image_url
    : 'https://i.imgur.com/J5LVHEL.jpg';
  this.isbn = obj.isbn ? obj.isbn : 'ISBN UNAVAILABLE';
  // this.bookshelf = bookshelf;
}

app.listen(PORT, () => console.log(PORT));
