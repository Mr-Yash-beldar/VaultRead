import express from "express";

import { authUser } from "../middleware/auth.js";
import {
  getUserDashboard,
  getMyBooks,
  getBorrowBooks,
  getBookReviews,
  getReviewBooks,
  getProfile,
  borrowBook,
  updateProfile,
  createReview,
  returnBook,
  getUserStats,
} from "../controllers/user.controller.js";
import { uploadProfile } from "../middleware/fileUploadMiddleware.js";

const userRouter = express.Router();

userRouter.get("/home", authUser, getUserDashboard);

userRouter.get("/mybooks", authUser, getMyBooks);

userRouter.get("/borrowbooks", authUser, getBorrowBooks);

userRouter.get("/bookreviews/:Id", authUser, getBookReviews);

userRouter.get("/reviewbooks", authUser, getReviewBooks);

userRouter.get("/profile", authUser, getProfile);

userRouter.post("/borrow/:bookId", authUser, borrowBook);

userRouter.post("/updateprofile", authUser, uploadProfile, updateProfile);

userRouter.post("/submitreview/:bookId", authUser, createReview);

userRouter.get("/return/:bookId", authUser, returnBook);

userRouter.get("/getUserStats", authUser, getUserStats);

export default userRouter;
