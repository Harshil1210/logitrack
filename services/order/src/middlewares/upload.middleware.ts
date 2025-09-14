import multer from "multer";
import multerS3 from "multer-s3";
import { s3Client } from "../lib/s3";
import path from "path";

export const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: "logistic-products-eu-north-1",
    // acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);

      const safeBaseName = baseName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "");

      const timestamp = Date.now();
      const filename = `products/${safeBaseName}-${timestamp}${ext}`;

      cb(null, filename);
    },
  }),
});
