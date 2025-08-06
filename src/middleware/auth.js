import { verifyToken } from "../config/jwtConfig.js"; // Import verifyToken
import { User } from "../model/user.model.js";

const authUser = async (req, res, next) => {
  try {
    const token = req.cookies.userToken; // ✅ Get token from cookie
    if (!token) {
      req.flash("error", "You are not Logged In");
      return res.redirect("/signin"); // Redirect if no token
    }

    const decoded = await verifyToken(token); // ✅ Verify token
    if (!decoded) {
      req.flash("error", "Invalid token. Please login again.");
      return res.redirect("/signin");
    }
    //check user exists in database with id
    if (decoded.userId) {
      const user = await User.findById(decoded.userId);
      if (!user) {
        req.flash("error", "User not found. Please login again.");
        return res.redirect("/signin");
      }
    }

    // Attach user data to req object
    if (!(decoded.role == "user")) {
      req.flash("error", "Access Denied");
      return res.redirect("/admindashboard");
    }
    req.user = decoded;
    next(); // ✅ Continue to next middleware or route
  } catch (error) {
    console.error("Auth error:", error.message);
    req.flash("error", "Session expired or invalid. Please sign in again.");
    res.redirect("/signin");
  }
};

const authAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.userToken; // ✅ Get token from cookie
    if (!token) {
      req.flash("error", "You are not Logged In");
      return res.redirect("/signin"); // Redirect if no token
    }

    const decoded = await verifyToken(token); // ✅ Verify token
    if (!decoded) {
      req.flash("error", "Invalid token. Please login again.");
      return res.redirect("/signin");
    }
    if (!(decoded.role == "admin")) {
      req.flash("error", "Access Denied");
      return res.redirect("/home");
    }

    // Attach user data to req object
    req.user = decoded;
    next(); // ✅ Continue to next middleware or route
  } catch (error) {
    console.error("Auth error:", error.message);
    req.flash("error", "Session expired or invalid. Please sign in again.");
    res.redirect("/signin");
  }
};

export { authUser, authAdmin };
