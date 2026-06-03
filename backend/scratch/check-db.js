const { poolPromise } = require('../src/config/db');

async function check() {
  try {
    const pool = await poolPromise;
    console.log('--- NguoiDung Avatar ---');
    const users = await pool.request().query('SELECT TOP 5 MaNguoiDung, HoTen, AnhDaiDien FROM NguoiDung WHERE AnhDaiDien IS NOT NULL');
    console.log(users.recordset);

    console.log('--- CuaHang Logo ---');
    const shops = await pool.request().query('SELECT TOP 5 MaCuaHang, TenCuaHang, Logo FROM CuaHang WHERE Logo IS NOT NULL');
    console.log(shops.recordset);

    console.log('--- Local AnhSanPham ---');
    const products = await pool.request().query("SELECT TOP 5 MaHinhAnh, DuongDanAnh FROM AnhSanPham WHERE DuongDanAnh NOT LIKE '%picsum.photos%'");
    console.log(products.recordset);

    console.log('--- Local PhanHoiMedia ---');
    const media = await pool.request().query("SELECT TOP 5 MaPhanHoi, DuongDanMedia FROM PhanHoiMedia WHERE DuongDanMedia NOT LIKE '%http%'");
    console.log(media.recordset);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

check();
