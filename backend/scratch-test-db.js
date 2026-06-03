const { poolPromise } = require('./src/config/db');

async function test() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 5 
        sp.MaSanPham,
        sp.TieuDe,
        (SELECT TOP 1 DuongDanAnh FROM AnhSanPham WHERE SanPhamId = sp.MaSanPham AND LaAnhChinh = 1) AS anh
      FROM SanPham sp
    `);
    console.log('Product images sample:');
    console.log(result.recordset);

    const ordersResult = await pool.request().query(`
      SELECT TOP 5 
        ct.MaChiTietDonHang, 
        sp.TieuDe, 
        (SELECT TOP 1 DuongDanAnh FROM AnhSanPham WHERE SanPhamId = sp.MaSanPham AND LaAnhChinh = 1) AS anh
      FROM ChiTietDonHang ct
      JOIN SanPham sp ON ct.SanPhamId = sp.MaSanPham
    `);
    console.log('Order items images sample:');
    console.log(ordersResult.recordset);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

test();
