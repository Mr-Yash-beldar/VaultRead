import dotenv from "dotenv";
dotenv.config();

const _config = {
  PORT: process.env.PORT || 3000,
  DB_URL: process.env.DB_URL,
  sessionSecret: process.env.sessionSecret,
  NODE_ENV: process.env.NODE_ENV || "development",
  Admin_Firstname: process.env.FirstName,
  Admin_Lastname: process.env.LastName,
  Admin_Email: process.env.Email,
  Admin_Password: process.env.Password,
  jwt_secret: process.env.JWT_SECRET,
};

const config = Object.freeze(_config);

export default config;
