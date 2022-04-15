import mongoose from 'mongoose';

const Book = mongoose.Schema({
  _id: String,
  cover: String,
  title: String,

  rating: {
    type: Number,
    min: 0,
    max: 5,
  }
})

const userSchema = mongoose.Schema({
  _id: String,
  name: String,
  email: String,
  sub: String,
  picture: String,
  books: {
    read: [Book],
    want: [Book],
    reading: [Book],
  },
  createdAt: {
    type: Date,
    immutable: true,
    default: Date.now,
  },
});

userSchema.index({ name: 'text' });

const User = mongoose.model('User', userSchema);
User.createIndexes();
export default User;