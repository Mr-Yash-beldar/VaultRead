import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  genre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Genre",
    required: true,
  },
  publicationDate: {
    type: String,
    required: true,
  },
  coverimage: {
    type: String,
    required: true,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
});

export const Book = mongoose.model("Book", bookSchema);
