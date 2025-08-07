import express from "express";
import session from "express-session";
import flash from "connect-flash";
import path from "path";
import exphbs from "express-handlebars";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import {
  globalError,
  globalFlash,
  notFound,
} from "./middleware/global.js";
import secret from "./config/config.js";
import { verifyToken } from "./config/jwtConfig.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import {Book} from "./model/book.model.js";

const app = express();

//Database connection
connectDB();
const currentDirectory = path.resolve();

//form data parsing
app.use(express.urlencoded({ extended: true }));
//json data parsing
app.use(express.json());
//cookie parsing
app.use(cookieParser());

//static files setup
app.use("/static", express.static(path.join(currentDirectory, "/src/public")));
app.use(
  "/uploads",
  express.static(path.join(currentDirectory, "/src/uploads"))
);

app.engine(
  "hbs",
  exphbs.engine({
    extname: "hbs",
    defaultLayout: false,
    layoutsDir: path.join(currentDirectory, "/src/views/layouts"),
    partialsDir: path.join(currentDirectory, "/src/views/partials"),
    helpers: {
      equal: (a, b) => a === b,
      gt: (a, b) => a > b,
      lt: (a, b) => a < b,
      increment: (value) => parseInt(value) + 1,
      decrement: (value) => parseInt(value) - 1,
      paginationArray: (current, total) => {
        let start = Math.max(current - 2, 1);
        let end = Math.min(start + 4, total);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
      },
      starArray: (rating) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;

        return [
          ...Array(fullStars).fill("fa-star"),
          ...Array(halfStar).fill("fa-star-half-alt"),
          ...Array(emptyStars).fill("fa-star-o"),
        ];
      },
    },
  })
);

//template engine setup
app.set("view engine", "hbs");
app.set("views", path.join(currentDirectory, "/src/views"));

//logging middleware
// app.use(reqLogger);

//session for storing respose messages to use accross requests
app.use(
  session({
    secret: secret.sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);
//for flash messages just like error or success
app.use(flash());

app.use(globalFlash);

//routes
app.get("/", async (req, res) => {
  const token = req.cookies.userToken;
  //if user is logged in, redirect to user dashboard
  if (token) {
    //validate the token is of user or admin with verifyToken middleware
    const User = await verifyToken(token);
    if (User && User.role === "user") {
      return res.redirect("/home");
    }
    if (User && User.role === "admin") {
      return res.redirect("/admindashboard");
    }
  }

  // const books = [
  //   {
  //     title: "The Silent Patient",
  //     author: "Alex Michaelides",
  //     price: 499,
  //     badge: "New",
  //     badgeColor: "green",
  //     image: "https://m.media-amazon.com/images/I/81eB+7+CkUL.jpg",
  //   },
  //   {
  //     title: "Atomic Habits",
  //     author: "James Clear",
  //     price: 599,
  //     image: "https://m.media-amazon.com/images/I/71UwSHSZRnS.jpg",
  //   },
  //   {
  //     title: "It Ends with Us",
  //     author: "Colleen Hoover",
  //     price: 499,
  //     badge: "Hot",
  //     badgeColor: "red",
  //     image: "https://m.media-amazon.com/images/I/71g2ednj0JL.jpg",
  //   },
  //   {
  //     title: "Rich Dad Poor Dad",
  //     author: "Robert T. Kiyosaki",
  //     price: 599,
  //     image: "https://m.media-amazon.com/images/I/81vpsIs58WL.jpg",
  //   },
  //   {
  //     title: "Think and Grow Rich",
  //     author: "Napoleon Hill",
  //     price: 399,
  //     image: "https://m.media-amazon.com/images/I/71jLBXtWJWL.jpg",
  //   },
  //   {
  //     title: "The Alchemist",
  //     author: "Paulo Coelho",
  //     price: 499,
  //     image: "https://m.media-amazon.com/images/I/81bsw6fnUiL.jpg",
  //   },
  //   {
  //     title: "Ikigai",
  //     author: "Francesc Miralles",
  //     price: 399,
  //     badge: "Bestseller",
  //     badgeColor: "yellow",
  //     image: "https://m.media-amazon.com/images/I/71kxa1-0zfL.jpg",
  //   },
  //   {
  //     title: "The Power of Now",
  //     author: "Eckhart Tolle",
  //     price: 549,
  //     image: "https://m.media-amazon.com/images/I/81-QB7nDh4L.jpg",
  //   },
  // ];
  const booksDoc = await Book.find()
      .sort({ createdAt: -1 }) // Sort by most recent first
      .limit(8);
  const books = booksDoc.map(book => book.toObject());
  res.render("index", {
    books,
  });
});

app.get("/login", (req, res) => {
  res.redirect("/signin");
});

app.get("/logout", (req, res) => {
  //cookies should be cleared here
  res.clearCookie("userToken");

  req.flash("success", "You have been logged out successfully.");
  res.redirect("/signin");
});

//authentication routes
app.use(authRoutes);

//user routes
app.use(userRoutes);

//admin routes
app.use(adminRoutes);

app.use(notFound);
app.use(globalError);

export default app;
