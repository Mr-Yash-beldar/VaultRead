import mongoose from "mongoose";
import { updateBookRating } from "../util/updaterating.js";

const reviewSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// After review is saved (created or updated)
reviewSchema.post("save", async function () {
  await updateBookRating(this.book);
});

// After review is removed (deleted)
reviewSchema.post("remove", async function () {
  await updateBookRating(this.book);
});

export const Review = mongoose.model("Review", reviewSchema);
