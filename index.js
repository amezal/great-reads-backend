import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import { getUserInfo, checkJwt } from './middleware.js';
import usersRouter from './routes/users.js';
import booksRouter from './routes/books.js';
import searchRouter from './routes/search.js';

const app = express();


app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const CONNECTION_URL = process.env.CONNECTION_URL;
const PORT = process.env.PORT || 5000;
mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
  .catch((error) => console.log(error.message));


app.get('/public', async (req, res) => {
  res.send('Hola');
  console.log(req.user);
});


app.get('/protected', checkJwt, getUserInfo, async (req, res) => {
  res.send('Hola from protected');
  console.log(req.userInfo);
});


app.use('/users', usersRouter);
app.use('/books', booksRouter);
app.use('/search', searchRouter);