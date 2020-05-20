# Book App

**Author**: Melissa Galush
**Version**: 1.0.0

## Overview
Search books and add or remove them from your collection. 

## Getting Started
Git clone and npm install for the application dependencies.

## Architecture
JavaScript, Node.js, Express, EJS, superagent, dotenv, Github, postgresSQL, Heroku, Google Books API

Schema for table:
```
CREATE TABLE books(
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  title VARCHAR(255),
  isbn VARCHAR(255),
  image_url VARCHAR(255),
  description VARCHAR(511),
  bookshelf VARCHAR(255)
)
```


## Credits and Collaborations
Collaborated with Ashley Biermann, Bade Habib, and Dave Wolfe