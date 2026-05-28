import React from 'react';

const SellerDashboard: React.FC = () => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Trang chủ Người Bán (Seller Dashboard)</h1>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-600">
          Chào mừng bạn đến với kênh người bán. Tại đây hiển thị thống kê đơn hàng, doanh thu, quản lý sản phẩm...
        </p>
      </div>
    </>
  );
};

export default SellerDashboard;
