import axios from 'axios';
import User from '../models/user.js';

export const getCurrentUser = async (req, res) => {
  const { sub, name, email, picture } = req.userInfo;
  let user;
  const id = sub.split('|')[1];
  if (await User.exists({ _id: id })) {
    user = await User.findOne({ _id: id });
  } else {
    user = await User.create({ _id: id, name, email, picture });
  }

  res.send(user);

}

export const getUserById = async (req, res) => {

  const id = req.params.id;
  const user = await User.findOne({ _id: id });
  res.send(user);
  // console.log(user);

}

export const addToList = async (req, res, next) => {
  //add book to user list
  const { sub } = req.user;
  const listToUpdate = req.params.list;
  const id = sub.split('|')[1];
  const user = await User.findOne({ _id: id });
  const bookId = req.query.book;
  const bookCover = req.body.cover;
  const bookTitle = req.body.title;

  let books = {};

  for (const list in user.books) {
    if (user.books.hasOwnProperty(list)) {
      books[list] = user.books[list].filter(b => b.id !== bookId);
    }
  }

  books[listToUpdate].push({ _id: bookId, cover: bookCover, title: bookTitle });
  user.books = books;
  await user.save();
  //add user to book stats
  next();
}

//update book lists
export const updateLists = async (req, res, next) => {
  const { sub } = req.user;
  const id = sub.split('|')[1];
  const books = req.body.books;
  await User.findOneAndUpdate({ _id: id }, { books })
  next();
}

export const deleteBook = async (req, res, next) => {
  const { sub } = req.user;
  const id = sub.split('|')[1];
  const listToUpdate = req.params.list;
  const bookId = req.query.book;
  const user = await User.findOne({ _id: id })

  const newList = user.books[listToUpdate].filter(book => book._id !== bookId);
  user.books[listToUpdate] = newList;
  await user.save();
  next();

}