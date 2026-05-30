/**
 * Chuyển đổi file PDF thành chuỗi Base64 để lưu vào database
 * Sử dụng khi người dùng chọn file PDF tải lên
 */
export const encodePDFToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Kết quả trả về sẽ có định dạng: data:application/pdf;base64,...
      resolve(reader.result as string);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Xử lý mã Base64 từ Database để thư viện react-pdf có thể hiển thị
 * Sử dụng khi mở file ra xem
 */
export const decodeBase64ToPDFData = (pdfCode: string): string => {
  // Nếu đã có sẵn tiền tố thì dùng luôn
  if (pdfCode.startsWith('data:application/pdf;base64,')) {
    return pdfCode;
  }
  // Nếu database chỉ lưu mã base64 thuần túy thì tự động thêm tiền tố vào
  return `data:application/pdf;base64,${pdfCode}`;
};
