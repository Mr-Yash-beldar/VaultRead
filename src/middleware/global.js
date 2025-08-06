import secret from "../config/config.js";

export const globalError = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  let message = "Something went wrong. Please try again later.";

  if (secret.NODE_ENV === "development") {
    // In development, show detailed error
    res.locals.error = err;
    message = err.message || message;
    console.error(err.stack);
  }

  // Handle 404 differently (optional)
  if (statusCode === 404) {
    return res.status(404).render("404", { message });
  }

  // For other errors, show generic error page
  res.status(statusCode).render("error", { message });
};

export const notFound = (req, res, next) => {
  const error = new Error("Page not Found");
  error.statusCode = 404;
  next(error);
};

export const globalFlash = (req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
};

export const reqLogger = (req, res, next) => {
  const method = req.method;
  const url = req.originalUrl;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} request to ${url}`);
  next();
};
