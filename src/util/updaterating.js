import { Review } from "../model/review.model.js";
import { Book } from "../model/book.model.js";

export const updateBookRating = async (bookId) => {
  const result = await Review.aggregate([
    { $match: { book: bookId } },
    {
      $group: {
        _id: "$book",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  await Book.findByIdAndUpdate(bookId, {
    averageRating: result[0]?.averageRating || 0,
    totalReviews: result[0]?.totalReviews || 0,
  });
};
