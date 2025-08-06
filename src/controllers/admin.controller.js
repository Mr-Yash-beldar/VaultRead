import { Genre } from "../model/genre.model.js";
import { Book } from "../model/book.model.js";
import { Request } from "../model/request.model.js";
import { User } from "../model/user.model.js";
import { formatDate } from "../util/dateFormater.js";
import { Review } from "../model/review.model.js";

export const getAdminDashboard = async (req, res, next) => {
  try {
    const limit = 4;
    const page = parseInt(req.query.page) || 1;

    const totalGenres = await Genre.countDocuments();
    const genres = await Genre.find()
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // ensure plain JS objects

    const totalPages = Math.ceil(totalGenres / limit);

    res.render("pages/admin/admindashboard", {
      active: "admindashboard",
      layout: "admin",
      page: {
        title: "Dashboard",
        info: "Admin Dashboard",
      },
      genres,
      pagination: {
        current: page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAddBooks = async (req, res) => {
  const genresRaw = await Genre.find().sort({ name: 1 });
  const genres = genresRaw.map((genre) => genre.toObject());
  res.render("pages/admin/addbooks", {
    genres,
    active: "addbooks",
    layout: "admin",
    page: {
      title: "Add Books",
      info: "Add New Books Here",
    },
  });
};
export const getMembers = async (req, res) => {
  try {
    // 1. Fetch all users with role 'user'
    const users = await User.find({ role: "user" }).lean();

    // 2. Extract user IDs
    const userIds = users.map((user) => user._id);

    // 3. Fetch all relevant requests for these users in one go
    const allRequests = await Request.find({
      user: { $in: userIds },
      status: { $in: ["Borrowed", "Due", "Overdue"] },
    }).lean();

    // 4. Group count of requests per userId
    const requestCountMap = {};
    allRequests.forEach((request) => {
      const uid = request.user.toString();
      requestCountMap[uid] = (requestCountMap[uid] || 0) + 1;
    });

    // 5. Attach request count and formatted createdAt to each user
    users.forEach((user) => {
      user.createdAt = formatDate(user.createdAt);
      user.requestCount = requestCountMap[user._id.toString()] || 0;
    });

    // 6. Log result for verification
    console.log("Users with request count:", users);

    // 7. Render the admin page
    res.render("pages/admin/members", {
      users,
      active: "members",
      layout: "admin",
      page: {
        title: "Members",
        info: "User Management ",
      },
    });
  } catch (err) {
    console.error("Error loading members:", err);
    req.flash("error", "Failed to load members");
    res.redirect("/admindashboard");
  }
};

export const getAllBooks = async (req, res) => {
  try {
    const perPage = 5;
    const page = parseInt(req.query.page) || 1;
    const { title, author, genre } = req.query;

    const filter = {};

    if (title) filter.title = new RegExp(title, "i");
    if (author) filter.author = new RegExp(author, "i");

    if (genre) {
      const genreDoc = await Genre.findOne({ name: new RegExp(genre, "i") });
      if (genreDoc) {
        filter.genre = genreDoc._id;
      } else {
        req.flash("error", "No Match Found");
        res.redirect("/allbooks");
      }
    }

    const totalBooks = await Book.countDocuments(filter);

    const booksRaw = await Book.find(filter)
      .populate("genre")
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    const books = booksRaw.map((book) => book.toObject());

    const totalPages = Math.ceil(totalBooks / perPage);

    res.render("pages/admin/allbooks", {
      books,
      layout: "admin",
      active: "allbooks",
      page: {
        title: "All Books",
        info: "Total Books in Library",
      },
      pagination: {
        current: page,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
        prevPage: page - 1,
        nextPage: page + 1,
      },
      filters: { title, author, genre }, // pass to retain values in inputs
    });
  } catch (err) {
    console.error("Book Load Error:", err);
    req.flash("error", "Failed to load books");
    res.redirect("/admindashboard");
  }
};

export const getEditBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId).populate("genre");
    const genresRaw = await Genre.find().sort({ name: 1 });
    const genres = genresRaw.map((genre) => genre.toObject());

    if (!book) {
      req.flash("error", "Book not found");
      return res.redirect("/allbooks");
    }

    res.render("pages/admin/editbook", {
      book: book.toObject(),
      genres,
      layout: "admin",
      active: "allbooks",
      page: {
        title: "Edit Book",
        info: "Update book details",
      },
    });
  } catch (err) {
    req.flash("error", "Failed to load book for editing");
    res.redirect("/allbooks");
  }
};

export const getRequestedBooks = async (req, res) => {
  const requestsDoc = await Request.find({ status: "Requested" }).populate(
    "book user"
  );
  const requests = requestsDoc.map((doc) => doc.toObject());

  res.render("pages/admin/requestedbooks", {
    requests,
    layout: "admin",
    active: "requestedbooks",
    page: {
      title: "Requested Books",
      info: "Approved and Reject Requests",
    },
  });
};

export const approveRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await Request.findById(requestId).populate("user");

    if (!request) {
      req.flash("error", "Request not found");
      return res.redirect("requestedbooks");
    }

    // Update request
    request.status = "Borrowed";
    request.borrowDate = new Date();
    request.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
    await request.save();

    req.flash(
      "success",
      "Request approved and book added to user's borrowed list"
    );
    res.redirect("/requestedbooks");
  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong during approval");
    res.redirect("/requestedbooks");
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await Request.findByIdAndDelete(requestId);

    if (!request) {
      req.flash("error", "Request not found");
      return res.redirect("requestedbooks");
    }
    req.flash("success", "Request rejected and deleted from the system");
    res.redirect("/requestedbooks");
  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong during approval");
    res.redirect("/requestedbooks");
  }
};

export const getAdminProfile = (req, res) => {
  req.flash("success", "Welcome admin");
  const success = req.flash("success");
  res.render("pages/admin/adminprofile", {
    active: "profile",
    layout: "admin",
    page: {
      title: "Profile",
      info: "Admin Profile",
    },
    success: success.length ? success[0] : null,
  });
};

export const addGenre = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    req.flash("error", "Genre Required");
    res.redirect("/admindashboard");
  }

  try {
    const existGenre = Genre.findOne({ name });
    if (existGenre) {
      req.flash("error", "Genre Already Exist");
      res.redirect("/admindashboard");
    }
    const genre = new Genre({ name });
    await genre.save();
    req.flash("success", "Genre added Successfully");
    res.redirect("/admindashboard");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/admindashboard");
  }
};

export const postAddBooks = async (req, res) => {
  try {
    const { title, author, genre, publicationDate } = req.body;

    if (!req.file) {
      throw new Error("Cover image not uploaded.");
    }
    const coverimage = req.file.filename; // filename saved by multer

    const newBook = new Book({
      title,
      author,
      genre,
      publicationDate,
      coverimage,
    });

    await newBook.save();
    req.flash("success", "Book Added Successfully");
    res.redirect("/allbooks");
  } catch (err) {
    req.flash("error", "Error While adding the book", err.message);
    res.redirect("/addbooks");
  }
};

export const postEditBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const { title, author, genre, publicationDate } = req.body;

    const updatedData = {
      title,
      author,
      genre,
      publicationDate,
    };

    if (req.file) {
      updatedData.coverimage = req.file.filename;
    }

    await Book.findByIdAndUpdate(bookId, updatedData);

    req.flash("success", "Book updated successfully");
    res.redirect("/allbooks");
  } catch (err) {
    req.flash("error", "Error updating book");
    res.redirect("/allbooks");
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    //delete all requests by this user
    await Request.deleteMany({ user: userId });
    //delete all reviews by this user
    await Review.deleteMany({ user: userId });

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/members");
    }
    req.flash("success", "User Deleted Successfully");
    res.redirect("/members");
  } catch (error) {
    req.flash("error", "Error while deleting user");
    res.redirect("/members");
    console.error("Error deleting user:", error);
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const [
      totalbookRequests,
      membersCount,
      totalbooks,
      totalCategories,
      totalReviews,
    ] = await Promise.all([
      Request.countDocuments({ status: "Requested" }),
      User.countDocuments({ role: "user" }),
      Book.countDocuments(),
      Genre.countDocuments(),
      Review.countDocuments(),
    ]);

    res.json({
      totalbookRequests,
      membersCount,
      totalbooks,
      totalCategories,
      totalReviews,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Server error" });
  }
};
