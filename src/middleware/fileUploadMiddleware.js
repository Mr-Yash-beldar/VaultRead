import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join("src", "uploads"); // Define your upload directory
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + "VaultRead_Malik";
    const fileName = uniqueSuffix + "-" + file.originalname;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

export const uploadCoverImage = (req, res, next) => {
  upload.single("coverimage")(req, res, (err) => {
    if (err) {
      return next(err);
    }
    next();
  });
};

export const uploadProfile = (req, res, next) => {
  upload.single("avatar")(req, res, (err) => {
    if (err) {
      const error = createError(400, "File upload failed");
      return next(error);
    }
    next();
  });
};
