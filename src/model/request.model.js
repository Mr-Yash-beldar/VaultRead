import mongoose from "mongoose";
import { formatDate } from "../util/dateFormater.js";

const requestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    status: {
      type: String,
      enum: ["Requested", "Borrowed", "Due", "Overdue", "Returned"],
      default: "Requested",
    },
    requestDate: {
      type: Date,
      default: Date.now,
      get: formatDate,
    },
    borrowDate: {
      type: Date,
      get: formatDate,
    },
    dueDate: {
      type: Date,
      get: formatDate,
    },
    returnDate: {
      type: Date,
      get: formatDate,
    },
  },
  {
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

export const Request = mongoose.model("Request", requestSchema);
