const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Đảm bảo thư mục tồn tại
const uploadDir = path.join(__dirname, '../../public/uploads/files');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const imageUploadDir = path.join(__dirname, '../../public/uploads/images');
if (!fs.existsSync(imageUploadDir)) {
  fs.mkdirSync(imageUploadDir, { recursive: true });
}

// Cấu hình lưu trữ
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Lấy phần mở rộng của file
    const ext = path.extname(file.originalname);
    
    // Tạo UUID và mã hóa sang base64url để làm tên file ngắn gọn và an toàn
    const uuid = crypto.randomUUID();
    const base64urlName = Buffer.from(uuid).toString('base64url');
    
    cb(null, `${base64urlName}${ext}`);
  }
});

// Bộ lọc định dạng file
const fileFilter = (req, file, cb) => {
  // Chỉ chấp nhận PDF và DOC/DOCX
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file định dạng .pdf, .doc, hoặc .docx!'), false);
  }
};

// Cấu hình Multer cho Document
const uploadDocumentMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // Giới hạn 2MB
  }
});

// Cấu hình lưu trữ cho Hình ảnh (Avatar, Logo)
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imageUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uuid = crypto.randomUUID();
    const base64urlName = Buffer.from(uuid).toString('base64url');
    cb(null, `${base64urlName}${ext}`);
  }
});

// Bộ lọc định dạng file Hình ảnh
const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file hình ảnh định dạng .jpg, .png, .webp hoặc .gif!'), false);
  }
};

// Cấu hình Multer cho Hình ảnh
const uploadImageMiddleware = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB cho ảnh
  }
});

/**
 * Hàm xóa file vật lý
 * @param {string} fileUrl - Đường dẫn file (vd: /uploads/files/xxx.pdf)
 */
const deleteFile = (fileUrl) => {
  if (!fileUrl) return;
  
  try {
    // Chuyển URL thành đường dẫn tuyệt đối trên server
    // Giả sử url có dạng: /uploads/files/ten_file.pdf
    const fileName = path.basename(fileUrl);
    
    let absolutePath = '';
    // Kiểm tra url xem thuộc thư mục nào
    if (fileUrl.includes('/uploads/images/')) {
      absolutePath = path.join(imageUploadDir, fileName);
    } else {
      absolutePath = path.join(uploadDir, fileName);
    }
    
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log(`🗑️ Đã xóa file: ${fileName}`);
    }
  } catch (error) {
    console.error(`❌ Lỗi khi xóa file ${fileUrl}:`, error.message);
  }
};

module.exports = {
  uploadDocumentMiddleware,
  uploadImageMiddleware,
  deleteFile
};
