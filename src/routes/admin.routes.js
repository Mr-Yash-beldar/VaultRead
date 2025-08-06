import express from "express";
import {
  getAdminDashboard,
  getAddBooks,
  getMembers,
  getAllBooks,
  getRequestedBooks,
  getAdminProfile,
  addGenre,
  postAddBooks,
  getEditBook,
  postEditBook,
  approveRequest,
  rejectRequest,
  deleteUser,
  getAdminStats,
} from "../controllers/admin.controller.js";
import { authAdmin } from "../middleware/auth.js";
import { uploadCoverImage } from "../middleware/fileUploadMiddleware.js";

const adminRouter = express.Router();

adminRouter.get("/admindashboard", authAdmin, getAdminDashboard);

adminRouter.get("/addbooks", uploadCoverImage, authAdmin, getAddBooks);

adminRouter.get("/members", authAdmin, getMembers);

adminRouter.get("/allbooks", authAdmin, getAllBooks);

adminRouter.get("/editbook/:id", authAdmin, getEditBook);

adminRouter.get("/requestedbooks", authAdmin, getRequestedBooks);

adminRouter.post("/approve/:id", authAdmin, approveRequest);

adminRouter.post("/reject/:id", authAdmin, rejectRequest);

adminRouter.get("/adminprofile", authAdmin, getAdminProfile);

adminRouter.post("/addgenre", authAdmin, addGenre);

adminRouter.post("/addbooks", authAdmin, uploadCoverImage, postAddBooks);

adminRouter.post("/editbook/:id", authAdmin, uploadCoverImage, postEditBook);

adminRouter.post("/deleteuser/:id", authAdmin, deleteUser);

adminRouter.get("/getadminstats", authAdmin, getAdminStats);

export default adminRouter;
