1. /dang-ky-nguoi-ban, /search, /buyer/thanh-toan, /seller/cua-hang (rồi)

- Chọn theo thứ tự Tình / Thành --> Quận / Huyện --> Xã / Phường

2. Hiển thị ảnh sản phẩm từ repo lưu trữ, tạo <file>.utils.ts để kiểm tra nếu lấy từ database là link thì ưu tiên hiển thị link, ngược lại thì lấy đường dẫn + tên file (rồi)

- admin/products, seller/san-pham, buyer/don-mua, seller/san-pham/[:id], trang chủ, /search, /stores, san-pham/[:id] (cùng trang với trang chi tiết sản phẩm của seller), buyer/thanh-toan, buyer/gio-hang

3. Luôn có định pagination của sản phẩm cố định nằm ở dưới cùng nếu như vẫn không đủ sản phẩm hiển thị trên 1 trang (rồi)

4. /search phần Filter (rồi)

- thêm khoảng cách giữa radiio và số sao đánh giá, cách 1 ít tương tự /stores.
- Khoảng giá thêm mô tả số tiền ở phía dưới. ví dụ 10000 thì phần mô tả là 1.000.000 đ, thêm gợi ý giá ví dụ 100000 thì có bảng gợi ý cách mỗi 5000000 1 mức giá. bảng gợi ý dạng danh sách có viền dưới và có highlight giống ô input khi focus.

5. Fix lỗi lọc sản phẩm theo danh mục 2 cấp ở trang search (phần components/CategoryNav) (rồi)
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

6. Profile người mua (rồi)

- làm đẹp css cho trang người mua, thêm banner hay dòng chữ gì đó cho nổi bật
- load thông tin người dùng từ serviecs lên trang /buyer/dashboard

6. css cho BuyerLayout màu nền tương tự header, footer thay cho màu hồng (rồi)

7. trang chat tin nhắn (admin, seller, buyer) (rồi)

- không thể xóa hoặc thu hổi tin nhắn của người khác
- đối với seller, buyer không xóa được tin nhắn
- đối với admin có thể xóa tin nhắn
- click vào tên người gửi hoặc avatar người gửi thì hiển thị modal danh thiếp, click nhắn tin thì sẽ tạo cuộc trò chuyện giữa 2 cá nhân nếu chưa có cuộc trò chuyện nào được tạo trước đó, ngược lại thì chuyển đến cuộc trò chuyện đã được tạo trước đó
- ở danh sách cuộc trò chuyện, click vào dấu 3 chấm nằm ngang, thêm lựa chọn mới vào danh sách `Tìm danh thiếp` mở ra 1 component tìm kiếm theo số điện thoại, email, nếu tìm thấy thì sẽ hiển thị danh sách các cuộc trò chuyện với người dùng đó, nếu người dùng có cửa hàng thì hiển thị trong danh sách là cửa hàng, có nút liên hệ để tạo cuộc trò chuyện hoặc chuyển tới cuộc trò chuyện đã có
- Read BE, FE. tạo service từ BE và Call vào FE để hoàn thiện chức năng
- thêm services tải load thông tin lên modal danh thiếp, tìm kiếm tất cả người dùng, cửa hàng

8. pagination dùng trong seller/san-pham (rồi)

- pagination này dùng chung, css lại cho pagination theo style hiện đại

9. /seller/cua-hang, trang hồ sơ cửa hàng (rồi)

- css lại giao diện của trang đồng bộ với các trang seller còn lại, phong cách hiện đại, thêm 1 số banner hoặc ghi chú gì đấy làm đẹp trang, sắp xếp lại cách bố trí

10. thêm bage số lượng cho tin nhắn chưa đọc, số lượng cho sản phẩm có trong giỏ hàng

- số lượng sản phẩm có trong giỏ hàng thì hiển thị ở header giỏ hàng đối với người mua cụ thể
- số lượng cho tin nhắn chưa đọc thì ở trên svg tin nhắn dùng cho cả admin, seller, buyer

11. Quản lý người dùng, Quản lý cửa hàng.

- sắp xếp lại bố trí biểu đồ cho không bị xấu, nếu có quá nhiều biểu đồ thì có thể gom lại các cột, các hàng theo cách hợp lí nhất
- chia làm 2 cột trái chứa biểu đồ, cột phải chứa bảng danh sách limit 5 hàng trên 1 page

12. thêm service cho trang thống kê của admin

- thống kê theo danh mục sản phẩm cấp 1

13. sửa route cho seller, cùng 1 trang với buyer nhưng route khác nhau

- /buyer/don-mua, /buyer/doi-mat-khau

14. fix lỗi hiển thị ảnh cá nhân lên header, sidebar (cả admin, seller, buyer)

15. fix lỗi hiển thị ảnh avatar lên `AdminSidebar`,`SellerSidebar` `ChatSidebar`, `UserDetailModal`,`ShopDetailModal`, `ReviewModal`, `BuyerSidebar`, `Header`, `SellerProfile`
