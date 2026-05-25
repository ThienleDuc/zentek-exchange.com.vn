const bcrypt = require('bcrypt');
const readline = require('readline');

// Tạo giao diện đọc dữ liệu từ Terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=============================================');
console.log('    CÔNG CỤ TẠO MÃ BCRYPT CHO MẬT KHẨU     ');
console.log('=============================================');

rl.question('👉 Nhập mật khẩu (text) cần mã hóa: ', async (plainText) => {
  if (!plainText || plainText.trim() === '') {
    console.log('❌ Lỗi: Bạn chưa nhập mật khẩu!');
    rl.close();
    return;
  }

  try {
    // Số saltRounds chuẩn (thường là 10, đủ an toàn và nhanh)
    const saltRounds = 10; 
    
    // Bắt đầu mã hóa
    const hash = await bcrypt.hash(plainText, saltRounds);
    
    console.log('\n✅ TẠO MÃ THÀNH CÔNG:');
    console.log('---------------------------------------------');
    console.log('Mật khẩu gốc : ', plainText);
    console.log('Mã Bcrypt    : ', hash);
    console.log('---------------------------------------------\n');
    console.log('💡 Hãy copy dòng "Mã Bcrypt" ở trên và dán vào câu lệnh SQL INSERT của bạn.');
  } catch (error) {
    console.error('❌ Đã xảy ra lỗi trong quá trình mã hóa:', error);
  } finally {
    rl.close();
  }
});
