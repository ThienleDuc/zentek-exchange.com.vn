1. /dang-ky-nguoi-ban, /search, /buyer/thanh-toan, /seller/cua-hang

- Chọn theo thứ tự Tình / Thành --> Quận / Huyện --> Xã / Phường

2. Hiển thị sản phẩm từ repo lưu trữ, tạo <file>.utils.ts để kiểm tra nếu lấy từ database là link thì ưu tiên hiển thị link, ngược lại thì lấy đường dẫn + tên file

3. Luôn có định pagination của sản phẩm nằm ở dưới cùng nếu như vẫn không đủ sản phẩm hiển thị trên 1 trang

4. Fix lỗi lọc sản phẩm theo danh mục 2 cấp ở trang search (phần components/CategoryNav)
   Lỗi khi tìm kiếm sản phẩm: RequestError: Incorrect syntax near ')'.
   [0] at handleError (D:\225TMDT\TMDT-Website\backend\node_modules\mssql\lib\tedious\request.js:411:15)
   [0] at Connection.emit (node:events:509:20)
   [0] at Connection.emit (D:\225TMDT\TMDT-Website\backend\node_modules\tedious\lib\connection.js:1013:18)
   [0] at RequestTokenHandler.onErrorMessage (D:\225TMDT\TMDT-Website\backend\node_modules\tedious\lib\token\handler.js:285:21)
   [0] at Readable.<anonymous> (D:\225TMDT\TMDT-Website\backend\node_modules\tedious\lib\token\token-stream-parser.js:19:33)
   [0] at Readable.emit (node:events:509:20)
   [0] at addChunk (node:internal/streams/readable:564:12)
   [0] at readableAddChunkPushObjectMode (node:internal/streams/readable:541:3)
   [0] at Readable.push (node:internal/streams/readable:396:5)
   [0] at nextAsync (node:internal/streams/from:194:22) {
   [0] code: 'EREQUEST',
   [0] originalError: Error: Incorrect syntax near ')'.
   [0] at handleError (D:\225TMDT\TMDT-Website\backend\node_modules\mssql\lib\tedious\request.js:409:19)
   [0] at Connection.emit (node:events:509:20)
   [0] at Connection.emit (D:\225TMDT\TMDT-Website\backend\node_modules\tedious\lib\connection.js:1013:18)  
   [0] at RequestTokenHandler.onErrorMessage (D:\225TMDT\TMDT-Website\backend\node_modules\tedious\lib\token\handler.js:285:21)
   [0] at Readable.<anonymous> (D:\225TMDT\TMDT-Website\backend\node_modules\tedious\lib\token\token-stream-parser.js:19:33)
   [0] at Readable.emit (node:events:509:20)
   [0] at addChunk (node:internal/streams/readable:564:12)
   [0] at readableAddChunkPushObjectMode (node:internal/streams/readable:541:3)
   [0] at Readable.push (node:internal/streams/readable:396:5)
   [0] at nextAsync (node:internal/streams/from:194:22) {
   [0] info: ErrorMessageToken {
   [0] name: 'ERROR',
   [0] handlerName: 'onErrorMessage',
   [0] number: 102,
   [0] state: 1,
   [0] class: 15,
   [0] message: "Incorrect syntax near ')'.",
   [0] serverName: 'LeDucThien',
   [0] procName: '',
   [0] lineNumber: 14
   [0] }
   [0] },

5. /search phần Filter

- thêm khoảng cách giữa radiio và số sao đánh giá
- Khoảng giá thêm mô tả số tiền ở phía dưới. ví dụ 10000 thì phần mô tả là 1.000.000 đ

6. trang chat tin nhắn (admin, seller, buyer)

- không thể xóa hoặc thu hổi tin nhắn của người khác
- đối với seller, buyer không xóa được tin nhắn
- đối với admin có thể xóa tin nhắn
- click vào tên người gửi hoặc avatar người gửi thì hiển thị modal danh thiếp, click nhắn tin thì sẽ tạo cuộc trò chuyện giữa 2 cá nhân nếu chưa có cuộc trò chuyện nào được tạo trước đó, ngược lại thì chuyển đến cuộc trò chuyện đã được tạo trước đó
- ở danh sách cuộc trò chuyện, click vào dấu 3 chấm nằm ngang, thêm lựa chọn mới vào danh sách `Tìm danh thiếp` mở ra 1 component tìm kiếm theo số điện thoại, email, nếu tìm thấy thì sẽ hiển thị danh sách các cuộc trò chuyện với người dùng đó, nếu người dùng có cửa hàng thì hiển thị trong danh sách là cửa hàng, có nút liên hệ để tạo cuộ tò chuyện hoặc chuyển tới cuộc trò chuyện đã có

7. Profile người mua

- làm đẹp css cho trang người mua, thêm banner hay dòng chữ gì đó cho nổi bật
- load thông tin người dùng từ serviecs lên trang /buyer/dashboard

8. pagination dùng trong seller/san-pham

- pagination này dùng chung, css lại cho pagination theo style hiện đại

9. /seller/cua-hang, trang hồ sơ cửa hàng

- css lại giao diện của trang đồng bộ với các trang seller còn lại, phong cách hiện đại, thêm 1 số banner hoặc ghi chú gì đấy làm đẹp trang, sắp xếp lại cách bố trí

10. thêm bage số lượng cho tin nhắn chưa đọc, số lượng cho sản phẩm có trong giỏ hàng

- số lượng sản phẩm có trong giỏ hàng thì hiển thị ở header giỏ hàng đối với người mua cụ thể
- số lượng cho tin nhắn chưa đọc thì ở trên svg tin nhắn dùng cho cả admin, seller, buyer

11. Quản lý người dùng, Quản lý cửa hàng.

- sắp xếp lại bố trí biểu đồ cho không bị xấu, nếu có quá nhiều biểu đồ thì có thể gom lại các cột, các hàng theo cách hợp lí nhất

12. thêm service cho trang thống kê của admin

- thống kê theo danh mục sản phẩm cấp 1
