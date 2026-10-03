const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

const processImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const filename = crypto.randomBytes(16).toString('hex') + '.webp';
    const filepath = path.join(uploadsDir, filename);

    await sharp(req.file.buffer)
      .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filepath);

    req.file.filename = filename;
    req.file.path = `/uploads/${filename}`;
    next();
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
};

module.exports = { upload, processImage };
