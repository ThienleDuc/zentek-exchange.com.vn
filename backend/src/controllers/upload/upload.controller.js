const { deleteFile } = require('../../utils/file.utils');

class UploadController {
  /**
   * Upload tài liệu (VD: Giấy phép kinh doanh)
   */
  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn file hợp lệ để tải lên.' });
      }

      // Multer đã lưu file thành công, lấy tên file
      const fileUrl = `/uploads/files/${req.file.filename}`;
      
      return res.status(200).json({
        success: true,
        message: 'Tải file lên thành công.',
        url: fileUrl
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message || 'Lỗi hệ thống khi tải file.' });
    }
  }

  /**
   * Upload hình ảnh (Avatar, Logo)
   */
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn hình ảnh hợp lệ để tải lên.' });
      }

      const fileUrl = `/uploads/images/${req.file.filename}`;
      
      return res.status(200).json({
        success: true,
        message: 'Tải hình ảnh lên thành công.',
        url: fileUrl
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message || 'Lỗi hệ thống khi tải hình ảnh.' });
    }
  }

  /**
   * Xóa tài liệu đã upload
   */
  async deleteDocument(req, res) {
    try {
      const { fileUrl } = req.body;
      
      if (!fileUrl) {
        return res.status(400).json({ success: false, message: 'Thiếu đường dẫn file cần xóa.' });
      }

      deleteFile(fileUrl);

      return res.status(200).json({
        success: true,
        message: 'Xóa file thành công.'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message || 'Lỗi hệ thống khi xóa file.' });
    }
  }

  /**
   * Upload media (Hình ảnh, Video đánh giá)
   */
  async uploadMedia(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn file media hợp lệ để tải lên.' });
      }

      const fileUrl = `/uploads/media/${req.file.filename}`;
      
      return res.status(200).json({
        success: true,
        message: 'Tải media thành công.',
        url: fileUrl
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message || 'Lỗi hệ thống khi tải media.' });
    }
  }
}

module.exports = new UploadController();
