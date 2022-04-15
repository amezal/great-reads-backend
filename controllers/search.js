import axios from 'axios';
import User from '../models/user.js';


export const searchBooks = async (req, res) => {
  const bookQuery = req.query.q.split(' ').join('+');
  const page = req.query.page;
  const fields = ['key', 'title', 'author_name', 'cover_i'].join(',');

  const url = `https://openlibrary.org/search.json?title=${bookQuery}&fields=${fields}&page=${page}&limit=15`;
  const books = await axios.get(url);
  books.data.docs.forEach(book => { book.key = book.key.split('/')[2] })
  res.send(books.data);
}

export const searchUsers = async (req, res) => {
  const userQuery = req.query.q;
  const page = req.query.page;
  const users = await User.find({ $text: { $search: userQuery } })
  res.send(users);
}

