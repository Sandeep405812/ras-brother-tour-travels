const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// Single file upload
router.post('/single', protect, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    let fileUrl = '';
    if (req.file.buffer) {
      // Serverless memory buffer -> Data URI
      const mime = req.file.mimetype || 'image/jpeg';
      fileUrl = `data:${mime};base64,${req.file.buffer.toString('base64')}`;
    } else {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename || req.file.originalname,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Multi-car image upload
router.post(
  '/car-images',
  protect,
  upload.fields([
    { name: 'main', maxCount: 1 },
    { name: 'front', maxCount: 1 },
    { name: 'rear', maxCount: 1 },
    { name: 'side', maxCount: 1 },
    { name: 'interior', maxCount: 1 },
    { name: 'dashboard', maxCount: 1 },
    { name: 'gallery', maxCount: 8 },
  ]),
  (req, res) => {
    try {
      const files = req.files || {};
      const urls = {};

      const resolveUrl = (f) => {
        if (!f) return '';
        if (f.buffer) {
          const mime = f.mimetype || 'image/jpeg';
          return `data:${mime};base64,${f.buffer.toString('base64')}`;
        }
        return `/uploads/${f.filename}`;
      };

      ['main', 'front', 'rear', 'side', 'interior', 'dashboard'].forEach((field) => {
        if (files[field] && files[field][0]) {
          urls[field] = resolveUrl(files[field][0]);
        }
      });

      if (files.gallery) {
        urls.gallery = files.gallery.map(resolveUrl);
      }

      res.json({
        success: true,
        images: urls,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
