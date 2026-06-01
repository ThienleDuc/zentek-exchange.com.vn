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

const mediaUploadDir = path.join(__dirname, '../../public/uploads/media');
if (!fs.existsSync(mediaUploadDir)) {
  fs.mkdirSync(mediaUploadDir, { recursive: true });
}

const hiddenMediaUploadDir = path.join(__dirname, '../../public/uploads/hidden_media');
if (!fs.existsSync(hiddenMediaUploadDir)) {
  fs.mkdirSync(hiddenMediaUploadDir, { recursive: true });
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

// Cấu hình lưu trữ cho Media (Hình ảnh, Video)
const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, mediaUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uuid = crypto.randomUUID();
    const base64urlName = Buffer.from(uuid).toString('base64url');
    cb(null, `${base64urlName}${ext}`);
  }
});

// Bộ lọc định dạng file Media
const mediaFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file hình ảnh hoặc video!'), false);
  }
};

// Cấu hình Multer cho Media
const uploadMediaMiddleware = multer({
  storage: mediaStorage,
  fileFilter: mediaFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // Giới hạn 100MB cho video (khoảng 1 phút video 720p 60fps)
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
    } else if (fileUrl.includes('/uploads/media/')) {
      absolutePath = path.join(mediaUploadDir, fileName);
    } else if (fileUrl.includes('/uploads/hidden_media/')) {
      absolutePath = path.join(hiddenMediaUploadDir, fileName);
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

/**
 * Hàm ẩn file vật lý (move sang thư mục hidden_media)
 * @param {string} fileUrl - Đường dẫn file cũ (vd: /uploads/media/xxx.mp4)
 * @returns {string|null} - Đường dẫn mới của file hoặc null nếu lỗi
 */
const hideFile = (fileUrl) => {
  if (!fileUrl) return null;
  
  try {
    const fileName = path.basename(fileUrl);
    let oldAbsolutePath = '';
    
    if (fileUrl.includes('/uploads/media/')) {
      oldAbsolutePath = path.join(mediaUploadDir, fileName);
    } else {
      // Chỉ hỗ trợ ẩn file từ thư mục media
      return null;
    }
    
    const newAbsolutePath = path.join(hiddenMediaUploadDir, fileName);
    
    if (fs.existsSync(oldAbsolutePath)) {
      fs.renameSync(oldAbsolutePath, newAbsolutePath);
      console.log(`👁️ Đã ẩn file: ${fileName}`);
      return `/uploads/hidden_media/${fileName}`;
    }
    return null;
  } catch (error) {
    console.error(`❌ Lỗi khi ẩn file ${fileUrl}:`, error.message);
    return null;
  }
};

module.exports = {
  uploadDocumentMiddleware,
  uploadImageMiddleware,
  uploadMediaMiddleware,
  deleteFile,
  hideFile
};
