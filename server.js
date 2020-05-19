'use strict';

const express = require('express');
const superagent = require('superagent');
require('dotenv').config();

const PORT = process.env.port || 3000;
const app = express();

// form configs
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

// server config
app.set('view engine', 'ejs');

app.get('/hello', (req, res) => {
  res.render('pages/index');
});

app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new');
})

app.get('searches/show', (req, res) => {
  res.render('pages/searches/show');
})

app.post('/searches', searchBook);

function searchBook(req, res) {
  const url = 'https://www.googleapis.com/books/v1/volumes';
  const {keyword, type} = req.body.search;
  let q = '';

  if (type === 'title') {
    q+= `intitle:${keyword}`;
  } else if (type === 'author') {
    q+= `inauthor:${keyword}`;
  } else {
    res.send({message : 'type must be title or author'});
  }
 
  superagent.get(url)
    .query({q})
    .then((resultFromSuper) => {
      const dataFromAPI = resultFromSuper.body.items;
      const books = dataFromAPI.map(value => {
        return new Book(value.volumeInfo);
      })
      res.render('pages/searches/show', { 'books': books });
    })
    .catch((error) => {
      res.send(error);
    })
}

function Book(obj) {
  this.title = obj.title ? obj.title : 'Book Title';
  this.author = obj.authors ? obj.authors[0] : 'Author';
  this.image = obj.imageLinks.thumbnail ? obj.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
  this.description = obj.description ? obj.description : 'Lorem epsum...';
}


app.listen(PORT, () => console.log(PORT));