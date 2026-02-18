import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

export const uploadFields = {
  /** Single field by any name */
  single: (fieldName) => upload.single(fieldName),

  /** Just a thumbnail */
  thumbnail: () => upload.fields([{ name: "thumbnail", maxCount: 1 }]),

  /** Thumbnail + up to `max` inclusion images */
  packageFields: (max = 20) =>
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      ...Array.from({ length: max }, (_, i) => ({
        name: `inclusions[${i}][image]`,
        maxCount: 1,
      })),
    ]),

  /** Any arbitrary set of fields */
  custom: (fields) => upload.fields(fields),
};

export default upload;