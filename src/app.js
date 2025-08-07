import express from "express";
import session from "express-session";
import flash from "connect-flash";
import path from "path";
import exphbs from "express-handlebars";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import { globalError, globalFlash, notFound } from "./middleware/global.js";
import secret from "./config/config.js";
import { verifyToken } from "./config/jwtConfig.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { Book } from "./model/book.model.js";

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

  const booksDoc = await Book.find()
    .sort({ createdAt: -1 }) // Sort by most recent first
    .limit(8);
  const books = booksDoc.map((book) => book.toObject());
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
