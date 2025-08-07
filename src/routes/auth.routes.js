import express from "express";
import { dataChecking } from "../middleware/datachecker.js";
import { User } from "../model/user.model.js";
import secret from "../config/config.js";
import bcrypt from "bcryptjs";
import { createToken, verifyToken } from "../config/jwtConfig.js";

const authRouter = express.Router();

authRouter.get("/signin", (req, res) => {
  res.render("sign-in", {});
});

authRouter.get("/signup", (req, res) => {
  res.render("sign-up", {});
});

authRouter.post("/signup", dataChecking, async (req, res) => {
  const { fname, lname, email, password } = req.body;
  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    req.flash("error", "User already exist. Please try again");
    res.redirect("/signup");
  }
  try {
    const user = await User.create({
      name: {
        firstname: fname,
        lastname: lname,
      },
      email: email,
      password: password,
    });

    req.flash("success", "Registration Successfull");
    res.redirect("/signin");
  } catch (error) {
    console.log(error);
    req.flash("error", "Registration Failed");
    res.redirect("/signup");
  }
});

authRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  // console.log(req.body);
  // Check if the user already exists
  try {
    const user = await User.findOne({
      email: email,
    });
    if (!user) {
      req.flash("error", "User not found. Please Signup");
      res.redirect("/signup");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("error", "Invalid Password. Please ry again");
      res.redirect("/signin");
    }
    const payload = {
      userId: user._id,
      role: user.role,
    };
    const token = await createToken(payload);
    res.cookie("userToken", token, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: false,
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, // Helps prevent CSRF attacks
    });

    if (!token) {
      req.flash("error", "Unauthorized. Please login.");
      return res.redirect("/signin");
    }

    if (user.role === "admin") {
      req.flash("success", "Admin Signed in Successfully");
      return res.redirect("/admindashboard");
    }

    req.flash("success", "Login Successful");
    res.redirect("/home");
  } catch (error) {
    console.log("error during signin", error);
    req.flash("error", "Signin failed. Please try again");
    res.redirect("/signin");
  }
});

export const createAdmin = async () => {
  const fname = secret.Admin_Firstname;
  const lname = secret.Admin_Lastname;
  const email = secret.Admin_Email;
  const password = secret.Admin_Password;
  try {
    const admin = await User.create({
      name: {
        firstname: fname,
        lastname: lname,
      },
      email: email,
      password: password,
      role: "admin",
    });
    console.log("Admin created Successfully");
  } catch (error) {
    console.log("Admin Creation Error");
    console.error(error);
  }
};

export default authRouter;
