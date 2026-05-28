const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Trang Thống kê Admin</h1>
      <p className="text-gray-600 mb-8">
        (Nội dung trang thống kê sẽ được cập nhật sau)
      </p>
      
      {/* Khối block dùng để test scroll, người dùng yêu cầu xem sidebar có bị kéo xuống không */}
      <div className="bg-gray-100 rounded border border-gray-300 p-4 text-center text-gray-500" style={{ height: '150vh' }}>
        ↓ Kéo xuống để test cuộn nội dung ↓
      </div>
    </div>
  );
};

export default AdminDashboard;
