import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { formatDate } from "../util/dateFormater.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: {
        firstname: { type: String, required: true },
        lastname: { type: String, required: true },
      },
      required: true,
    },
    email: { type: String, required: true, unique: true },
    location: {
      type: {
        city: String,
        state: String,
        country: String,
      },
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    avatar: {
      type: String,
      default: function () {
        const initials =
          `${this.name.firstname[0]}${this.name.lastname[0]}`.toUpperCase();
        return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff`;
      },
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

userSchema.path("createdAt").get(function (val) {
  return formatDate(val);
});

// 🔐 Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

export const User = mongoose.model("User", userSchema);
