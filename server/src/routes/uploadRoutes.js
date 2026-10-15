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
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
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

      ['main', 'front', 'rear', 'side', 'interior', 'dashboard'].forEach((field) => {
        if (files[field] && files[field][0]) {
          urls[field] = `/uploads/${files[field][0].filename}`;
        }
      });

      if (files.gallery) {
        urls.gallery = files.gallery.map((f) => `/uploads/${f.filename}`);
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
