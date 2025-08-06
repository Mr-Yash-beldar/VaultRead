export const dataChecking = (req, res, next) => {
  const { fname, lname, email, password } = req.body;

  // Check if all fields are filled
  if (!fname || !lname || !email || !password) {
    req.flash("error", "All fields are required.");
    return res.redirect("/signup");
  }

  // Check if email is valid
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.flash("error", "Invalid email format.");
    return res.redirect("/signup");
  }

  // Check if password is strong enough
  if (password.length < 6) {
    req.flash("error", "Password must be at least 6 characters long.");
    return res.redirect("/signup");
  }

  next();
};
