const express = require('express');
const router = express.Router();
const uploadController = require('../../controllers/upload/upload.controller');
const { uploadDocumentMiddleware, uploadImageMiddleware } = require('../../utils/file.utils');

// Upload file document (cần gửi dữ liệu dạng multipart/form-data với field 'file')
router.post('/document', (req, res, next) => {
  const upload = uploadDocumentMiddleware.single('file');
  
  upload(req, res, function (err) {
    if (err) {
      // Bắt lỗi multer (ví dụ: sai định dạng, vượt quá dung lượng)
      return res.status(400).json({ success: false, message: err.message });
    }
    // Nếu OK, chạy tiếp vào controller
    next();
  });
}, uploadController.uploadDocument);

// Xóa file document
router.delete('/document', uploadController.deleteDocument);

// Upload hình ảnh (Avatar, Logo)
router.post('/image', (req, res, next) => {
  const upload = uploadImageMiddleware.single('file');
  upload(req, res, function (err) {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, uploadController.uploadImage);

// Xóa hình ảnh
router.delete('/image', uploadController.deleteDocument);

module.exports = router;
