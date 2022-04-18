import axios from 'axios';
import User from '../models/user.js';

const deleteProps = (obj, prop) => {
  for (const p of prop) {
    (p in obj) && (delete obj[p]);
  }
}

export const searchBooks = async (req, res) => {
  const bookQuery = req.query.q.split(' ').join('+');
  const page = req.query.page;
  const fields = ['key', 'title', 'author_name', 'cover_i'].join(',');


  const url = `https://openlibrary.org/search.json?title=${bookQuery}&fields=${fields}&page=${page}&limit=15`;
  const books = await axios.get(url);
  books.data.docs.forEach(book => {
    book.key = book.key.split('/')[2];
    book.cover = book.cover_i || '-1';
    delete book.cover_i;
  })
  res.send(books.data);
}

export const searchUsers = async (req, res) => {
  const userQuery = req.query.q;
  const page = req.query.page;
  const users = await User.find({ $text: { $search: userQuery } })
  res.send(users);
}

export const searchAuthors = async (req, res) => {
  const authorQuery = req.query.q;
  const url = `https://openlibrary.org/search/authors.json?q=${authorQuery}&limit=15`;
  const { data: { docs: authors } } = await axios.get(url);
  authors.forEach(author => {
    author.works = author.work_count;
    author.picture = `https://covers.openlibrary.org/a/olid/${author.key}-M.jpg`
    deleteProps(author, ['alternate_names', 'birth_date', 'top_subjects', '_version_',
      'top_work', 'work_count', 'type']);
  })
  res.send(authors)
}