import multer from 'multer';

/**
 * Multer configuration with in-memory storage.
 * Files are stored in memory as Buffer objects,
 * suitable for streaming to cloud storage (e.g., Cloudinary).
 */
const storage = multer.memoryStorage();

/**
 * File filter: accept only images.
 */
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
});

/**
 * Upload a single image file, field name 'image'.
 */
export const uploadSingle = upload.single('image');

/**
 * Upload multiple image files, field name 'images', max 5.
 */
export const uploadMultiple = upload.array('images', 5);

export default upload;
