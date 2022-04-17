import mongoose from 'mongoose';

const Review = mongoose.Schema({
  _id: String,
  content: String,
  rating: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
})

const Rating = mongoose.Schema({
  _id: String,
  rating: Number,
})

const bookSchema = mongoose.Schema({

  _id: String,

  read: {
    type: Number,
    default: 0,
  },
  reading: {
    type: Number,
    default: 0,
  },
  want: {
    type: Number,
    default: 0,
  },

  users_read: [String],
  users_reading: [String],
  users_want: [String],

  rating: {
    type: Number,
    default: 0,
  },

  ratings: [Rating],
  reviews: [Review],
  cover: String,
})


bookSchema.pre('save', function (next) {
  //Calculating sums
  const ratingSum = this.ratings.reduce((total, current) => total + current.rating, 0);
  const rating = ratingSum / this.ratings.length;
  this.rating = rating || 0;
  this.read = this.users_read.length;
  this.reading = this.users_reading.length;
  this.want = this.users_want.length;
  next();
})

const Book = mongoose.model('Book', bookSchema);

export default Book;