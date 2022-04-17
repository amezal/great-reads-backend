import axios from 'axios';
import Book from '../models/book.js';
import User from '../models/user.js';

const formatBook = async (book) => {
  const cover = book.covers ? book.covers[0] : '-1';
  book.cover = cover;

  //delete unnecesary props that come from the api
  deleteProps(book, ['subject_places', 'subjects', 'subject_people',
    'subject_times', 'type', 'latest_revision', 'revision', 'created',
    'last_modified', 'links', 'first_publish_date', 'excerpts', 'covers'])

  //get authors names;
  const authors = await getAuthors(book);
  book.authors = authors;

  if (book.description) {
    if (book.description.value) {
      book.description = book.description.value;
    }
  } else {
    book.description = 'No description available'
  }

  return book;

}

const deleteProps = (obj, prop) => {
  for (const p of prop) {
    (p in obj) && (delete obj[p]);
  }
}

const nullBook = {
  _id: null,

  read: 0,
  reading: 0,
  want: 0,
  rating: 0,

  ratings: [],
  reviews: [],
}

//get book

const getBookFromDB = async (id, userSub) => {
  try {
    const book = await Book.findOne({ _id: id });
    if (book) {
      const formattedBook = book.toObject();
      const reviews = await getReviews(formattedBook);
      formattedBook.reviews = reviews;

      if (userSub) {
        const userId = userSub.split('|')[1];
        const userRating = formattedBook.ratings.find(rating => rating._id === userId);
        formattedBook.userRating = userRating ? userRating.rating : null;
        const lists = ['read', 'reading', 'want'];

        const isInList = lists.find(list => {
          return formattedBook[`users_${list}`].find(user => user === userId);
        })

        formattedBook.isInList = isInList || null;

      }
      deleteProps(formattedBook, ['users_read', 'users_reading', 'users_want', 'ratings']);
      return formattedBook;
    } else {
      return nullBook;
    }
  } catch (error) {
    console.log(error.message);
  }
}

const getBookFromAPI = async (id) => {
  const url = `https://openlibrary.org/works/${id}.json`;
  const res = await axios.get(url);
  const book = await formatBook(res.data);
  return book;
}

const getAuthors = async (book) => {
  return Promise.all(book.authors.map(async (author) => {
    const path = author.author.key;
    const authorRes = await axios.get(`https://openlibrary.org${path}.json`);
    const id = author.author.key.substring(9)
    return { name: authorRes.data.name, id: id }
  }))
}

const getReviews = async (book) => {
  if (book.reviews.length === 0) {
    return book.reviews;
  }
  const userIds = book.reviews.map(review => review._id);

  const users = await User.find({ _id: { $in: userIds } });
  const reviews = book.reviews.map((review, i) => ({ ...review, name: users[i].name, picture: users[i].picture }));
  return reviews;
}

export const getBook = async (req, res) => {
  const info = await getBookFromAPI(req.params.id);
  const stats = await getBookFromDB(req.params.id, req.query.user);
  const book = { ...info, ...stats };
  res.send(book);
}

//create/update book
export const updateBook = async (req, res) => {
  const bookId = req.params.id;
  const book = await Book.findOneAndUpdate({ _id: bookId }, { _id: bookId }, { upsert: true });
  Object.assign(book, req.body);

  await book.save();
  res.send(req.body);
};

//update stats
export const updateBookStats = async (req, res) => {
  const { sub } = req.user;
  const listToUpdate = req.params.list;
  const userId = sub.split('|')[1];
  const bookId = req.query.book;

  const book = await Book.findOneAndUpdate({ _id: bookId }, { _id: bookId }, { upsert: true, new: true });

  const updatedStats = {
    users_read: book.users_read || [],
    users_reading: book.users_reading || [],
    users_want: book.users_want || [],
  };

  const lists = ['users_read', 'users_reading', 'users_want']//.filter(list => list !== `users_${listToUpdate}`);
  lists.forEach(list => {
    updatedStats[list] = book[list].filter(id => id !== userId);
  })

  updatedStats[`users_${listToUpdate}`].push(userId);

  Object.assign(book, updatedStats);

  await book.save();

  const statsResponse = {
    read: book.read,
    reading: book.reading,
    want: book.want,
  }

  res.send(statsResponse);

}

export const deleteBookStats = async (req, res) => {
  const { sub } = req.user;
  const listToUpdate = req.params.list;
  const userId = sub.split('|')[1];
  const bookId = req.query.book;

  const book = await Book.findOne({ _id: bookId });
  const newList = book[`users_${listToUpdate}`].filter(id => id !== userId);
  book[`users_${listToUpdate}`] = newList;
  const newRatings = book.ratings.filter(rating => rating._id !== userId);
  book.ratings = newRatings;

  await book.save()
}

export const updateBookRatings = async (req, res) => {
  const bookId = req.params.id;
  const userId = req.query.user.split('|')[1];
  const rating = req.query.rating;
  const book = await Book.findOneAndUpdate({ _id: bookId }, { _id: bookId }, { upsert: true, new: true });

  const ratings = book.ratings.filter(rating => rating._id !== userId)
  ratings.push({ _id: userId, rating: rating });
  const updatedRatings = { ratings: ratings };
  Object.assign(book, updatedRatings);
  await book.save();
}

export const updateBookReviews = async (req, res) => {
  const bookId = req.params.id;
  const userId = req.query.user.split('|')[1];
  const review = req.body;

  const book = await Book.findOneAndUpdate({ _id: bookId }, { _id: bookId }, { upsert: true, new: true });

  const reviews = book.reviews.filter(review => review._id !== userId);
  reviews.unshift({ _id: userId, ...review });
  const updatedReviews = { reviews: reviews };
  Object.assign(book, updatedReviews);

  await book.save();

}