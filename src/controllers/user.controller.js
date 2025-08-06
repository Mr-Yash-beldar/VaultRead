import { Book } from "../model/book.model.js";
import { Request } from "../model/request.model.js";
import { User } from "../model/user.model.js";
import { Review } from "../model/review.model.js";
import { Genre } from "../model/genre.model.js";

export const getUserDashboard = async (req, res) => {
  try {
    const books = await Book.find()
      .populate("genre")
      .sort({ totalReviews: -1, averageRating: -1 })
      .limit(5)
      .lean();

    const limit = 4;
    const page = parseInt(req.query.page) || 1;

    const totalGenres = await Genre.countDocuments();
    const genres = await Genre.find()
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // ensure plain JS objects

    const totalPages = Math.ceil(totalGenres / limit);

    res.render("pages/user/userdashboard", {
      active: "dashboard",
      layout: "user",
      page: {
        title: "Dashboard",
        info: "User Dashboard",
      },
      genres,
      books,
      pagination: {
        current: page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
      },
    });
  } catch (err) {
    req.flash("error", "Failed to load dashboard");
    redirect("/home");
  }
};

export const getMyBooks = async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await Request.find({
      user: userId,
      status: { $in: ["Borrowed", "Due", "Overdue"] },
    })
      .populate({
        path: "book",
        populate: {
          path: "genre",
          model: "Genre",
        },
      })
      .sort({ borrowDate: -1 }); // optional: most recent first

    const books = requests.map((request) => request.toObject());

    res.render("pages/user/mybooks", {
      books: books,
      active: "mybooks",
      layout: "user",
      page: {
        title: "My Books",
        info: "See Your Borrowed Books",
      },
    });
  } catch (err) {
    console.error("Error fetching borrowed books:", err);
    res.status(500).send("Server Error");
  }
};

export const getBorrowBooks = async (req, res) => {
  try {
    const perPage = 8;
    const page = parseInt(req.query.page) || 1;

    const userId = req.user.userId;

    const totalBooks = await Book.countDocuments();
    const booksRaw = await Book.find()
      .populate("genre")
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    // Get user requests for already requested/borrowed books
    const userRequests = await Request.find({
      user: userId,
      status: { $in: ["Requested", "Borrowed", "Due", "Overdue"] },
    }).select("book status");

    const requestedBookMap = {};
    userRequests.forEach((req) => {
      requestedBookMap[req.book.toString()] = req.status;
    });

    const books = booksRaw.map((book) => {
      const bookObj = book.toObject();
      bookObj.userRequestStatus = requestedBookMap[book._id.toString()] || null;
      return bookObj;
    });

    const totalPages = Math.ceil(totalBooks / perPage);

    res.render("pages/user/borrowbooks", {
      books,
      layout: "user",
      active: "borrowbooks",
      page: {
        title: "Borrow Books",
        info: "Request to borrow books",
      },
      pagination: {
        current: page,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
        prevPage: page - 1,
        nextPage: page + 1,
      },
    });
  } catch (err) {
    console.error("Failed to load books:", err);
    req.flash("error", "Failed to load books");
    res.redirect("/home");
  }
};

export const borrowBook = async (req, res) => {
  try {
    const userId = req.user.userId;
    const bookId = req.params.bookId;

    // 2. Check if a Request already exists for this book & user
    const existingRequest = await Request.findOne({
      user: userId,
      book: bookId,
      status: { $in: ["Requested", "Borrowed", "Due", "Overdue"] },
    });

    if (existingRequest) {
      req.flash("info", "You already have a request or borrowed this book.");
      return res.redirect("/borrowbooks");
    }

    await Request.create({
      user: userId,
      book: bookId,
    });

    req.flash("success", "Book Requested successfully!");
    res.redirect("/borrowbooks");
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not borrow book.");
    res.redirect("/borrowbooks");
  }
};

export const getBookReviews = async (req, res) => {
  const bookId = req.params.Id;
  console.log("Fetching reviews for book:", bookId);

  //also populate book details like title, author, etc.
  if (!bookId) {
    req.flash("error", "Invalid Book");
    return res.redirect("/borrowbooks");
  }
  try {
    //populate book and user details
    // fetch book name and cover image
    const book = await Book.findById(bookId)
      .select("title coverimage totalReviews")
      .lean();

    console.log("Book details:", book);
    if (!book) {
      req.flash("error", "Book not found");
      return res.redirect("/borrowbooks");
    }
    const reviews = await Review.find({ book: bookId })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    console.log("Reviews for book:", reviews);

    res.render("pages/user/bookReviews", {
      book,
      reviews,
      layout: "user",
      active: "borrowbooks",
      page: {
        title: "Book Reviews",
        info: "See Book Reviews",
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    req.flash("error", "Failed to load reviews");
    res.redirect("/borrowbooks");
  }
};

export const getReviewBooks = async (req, res) => {
  try {
    const userId = req.user.userId; // or req.user._id, depending on auth
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const totalRequests = await Request.countDocuments({
      user: userId,
      status: { $in: ["Borrowed", "Due", "Overdue"] },
    });

    const totalPages = Math.ceil(totalRequests / limit);

    const requests = await Request.find({
      user: userId,
      status: { $in: ["Borrowed", "Due", "Overdue"] },
    })
      .populate({
        path: "book",
        populate: { path: "genre", model: "Genre" },
      })
      .sort({ borrowDate: -1 })
      .skip(skip)
      .limit(limit);

    const books = requests.map((request) => request.book.toObject());

    res.render("pages/user/reviewbooks", {
      layout: "user",
      page: {
        title: "Review Books",
        info: "Review and Rate Books",
      },
      active: "reviewbooks",
      books,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error("Error in getReviewBooks:", error);
    res.status(500).send("Something went wrong");
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // or req.user._id, depending on auth
    const userDoc = await User.findById(userId);
    const user = userDoc.toObject();

    res.render("pages/user/profile", {
      user,
      active: "profile",
      page: {
        title: "Profile",
        info: "User Profile",
      },
      layout: "user",
    });
  } catch (err) {
    req.flash("error", "Failed to load profile");
    res.redirect("/home");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fname, lname, city, state, country } = req.body;
    console.log("Updating profile for user:", req.body);

    const updatedData = {
      name: {
        firstname: fname,
        lastname: lname,
      },
      location: {
        city,
        state,
        country,
      },
    };

    if (req.file) {
      updatedData.avatar = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
      runValidators: true,
    });

    // console.log("Updated user:", updatedUser);

    req.flash("success", "Profile updated successfully!");
    res.redirect("/profile");
  } catch (error) {
    console.error("Update error:", error);
    req.flash("error", "Something went wrong while updating profile.");
    res.redirect("/profile");
  }
};

export const createReview = async (req, res) => {
  const { rating, comment } = req.body;
  const { bookId } = req.params;
  const userId = req.user.userId;
  console.log("Creating review for book:", bookId, "by user:", userId);

  if (!rating || !comment) {
    return res.status(400).json({ message: "Rating and comment required." });
  }

  // const existing = await Review.findOne({ book: bookId, user: userId });
  // if (existing) {
  //   existing.rating = rating;
  //   existing.comment = comment;
  //   await existing.save();
  //   req.flash("success", "Review updated successfully!");
  //   return res.status(200).json({ message: "Review updated." });
  // }

  const review = new Review({
    book: bookId,
    user: userId,
    rating,
    comment,
  });

  await review.save();
  req.flash("success", "Review submitted successfully!");
  res.status(201).json({ message: "Review submitted." });
};

export const returnBook = async (req, res) => {
  try {
    const userId = req.user.userId;
    const bookId = req.params.bookId;

    const request = await Request.findOneAndDelete({
      user: userId,
      book: bookId,
      status: { $in: ["Borrowed", "Due", "Overdue"] },
    });

    if (!request) {
      req.flash("error", "No active borrow request found for this book.");
      return res.redirect("/mybooks");
    }

    req.flash("success", "Book returned successfully!");
    res.redirect("/mybooks");
  } catch (err) {
    console.error("Error returning book:", err);
    req.flash("error", "Failed to return book.");
    res.redirect("/mybooks");
  }
};

export const getUserStats = async (req, res) => {
  const userId = req.user.userId;

  try {
    const now = new Date();

    const [
      booksBorrowed,
      requestedBooks,
      booksDueSoon,
      overdueBooks,
      reviewedBooks,
    ] = await Promise.all([
      Request.countDocuments({ user: userId, status: "Borrowed" }),
      Request.countDocuments({ user: userId, status: "Requested" }),
      Request.countDocuments({
        user: userId,
        status: "Borrowed",
        dueDate: {
          $gte: now,
          $lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        }, // due in 3 days
      }),
      Request.countDocuments({ user: userId, status: "Overdue" }),
      Review.countDocuments({ user: userId }),
    ]);

    res.json({
      booksBorrowed,
      reviewedBooks,
      requestedBooks,
      booksDueSoon,
      overdueBooks,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Server error" });
  }
};
