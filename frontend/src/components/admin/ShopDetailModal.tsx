import React, { useState } from 'react';
import { X, CheckCircle, FileText, Lock, Unlock, Store, Phone, User, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { type Shop } from '../../pages/admin/ShopManagement';
import { type AlertType } from '../common/Alert';

interface ShopDetailModalProps {
  isOpen: boolean;
  shop: Shop | null;
  onClose: () => void;
  onUpdate: () => void;
  showAlert: (type: AlertType, title: string, message: React.ReactNode, onConfirm?: () => void) => void;
}

const ShopDetailModal: React.FC<ShopDetailModalProps> = ({ isOpen, shop, onClose, onUpdate, showAlert }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  if (!isOpen || !shop) return null;

  const handleApprove = async () => {
    showAlert('confirm', 'Phê duyệt cửa hàng', `Bạn có chắc chắn muốn phê duyệt cửa hàng ${shop.TenCuaHang}?`, async () => {
      try {
        const response = await api.put(`/shops/${shop.MaCuaHang}/approval`, { isApproved: true, reason: '' });
        if (response.data.success) {
          showAlert('success', 'Thành công', 'Đã phê duyệt cửa hàng.');
          onUpdate();
          onClose();
        }
      } catch (err: any) {
        showAlert('error', 'Lỗi', err.response?.data?.message || 'Có lỗi xảy ra.');
      }
    });
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showAlert('warning', 'Cảnh báo', 'Vui lòng nhập lý do từ chối.');
      return;
    }
    try {
      const response = await api.put(`/shops/${shop.MaCuaHang}/approval`, { isApproved: false, reason: rejectReason });
      if (response.data.success) {
        showAlert('success', 'Thành công', 'Đã từ chối cửa hàng.');
        setIsRejecting(false);
        setRejectReason('');
        onUpdate();
        onClose();
      }
    } catch (err: any) {
      showAlert('error', 'Lỗi', err.response?.data?.message || 'Có lỗi xảy ra.');
    }
  };

  const handleToggleStatus = async () => {
    const actionName = shop.TrangThai ? 'Khóa' : 'Mở khóa';
    showAlert('confirm', `Xác nhận ${actionName.toLowerCase()}`, `Bạn có chắc chắn muốn ${actionName.toLowerCase()} cửa hàng ${shop.TenCuaHang}?`, async () => {
      try {
        const response = await api.put(`/shops/${shop.MaCuaHang}/status`);
        if (response.data.success) {
          showAlert('success', 'Thành công', `Đã ${actionName.toLowerCase()} cửa hàng thành công.`);
          onUpdate();
          onClose();
        }
      } catch (err: any) {
        showAlert('error', 'Lỗi', err.response?.data?.message || 'Có lỗi xảy ra.');
      }
    });
  };

  const getShopType = (type: number) => {
    if (type === 1) return 'Cá nhân';
    if (type === 2) return 'Hộ kinh doanh';
    if (type === 3) return 'Doanh nghiệp';
    return 'Khác';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border-default rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-border-default bg-surface-muted/30">
          <h3 className="text-xl font-semibold text-text-main flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            Chi tiết cửa hàng
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Header Info */}
          <div className="flex gap-4 items-start mb-6 pb-6 border-b border-border-default">
            <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold shrink-0 overflow-hidden">
              {shop.Logo ? <img src={shop.Logo} alt="Logo" className="w-full h-full object-cover" /> : shop.TenCuaHang.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text-main">{shop.TenCuaHang}</h2>
              <p className="text-text-muted mt-1">{shop.MoTa || 'Chưa có mô tả'}</p>
              
              <div className="flex gap-2 mt-3">
                {!shop.DaXacThucPhapLy ? (
                  <span className="px-3 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full text-xs font-medium">Chờ duyệt pháp lý</span>
                ) : (
                  <>
                    <span className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-xs font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Đã xác thực
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${shop.TrangThai ? 'bg-primary/10 text-primary border-primary/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                      {shop.TrangThai ? 'Đang hoạt động' : 'Bị khóa'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Owner Info */}
            <div className="bg-surface-muted p-4 rounded-xl border border-border-default">
              <h4 className="text-sm font-semibold text-text-main mb-3 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4" /> Chủ sở hữu
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Họ tên:</span>
                  <span className="font-medium text-text-main">{shop.TenNguoiBan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Username:</span>
                  <span className="font-medium text-text-main">{shop.TenDangNhap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Email:</span>
                  <span className="font-medium text-text-main">{shop.Email}</span>
                </div>
              </div>
            </div>

            {/* Shop Legal Info */}
            <div className="bg-surface-muted p-4 rounded-xl border border-border-default">
              <h4 className="text-sm font-semibold text-text-main mb-3 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" /> Thông tin pháp lý
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Loại hình:</span>
                  <span className="font-medium text-text-main">{getShopType(shop.LoaiHinhCuaHang)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Mã số thuế:</span>
                  <span className="font-mono text-text-main bg-black/20 px-2 py-0.5 rounded">{shop.MaSoThue}</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-border-default/50">
                  <span className="text-text-muted">Giấy phép:</span>
                  <a 
                    href={shop.PdfGiayPhep?.startsWith('http') || shop.PdfGiayPhep?.startsWith('blob:') ? shop.PdfGiayPhep : `http://localhost:5000${shop.PdfGiayPhep}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-primary hover:underline text-xs font-medium flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" /> Xem tài liệu
                  </a>
                </div>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="md:col-span-2 bg-surface-muted p-4 rounded-xl border border-border-default">
              <h4 className="text-sm font-semibold text-text-main mb-3 uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4" /> Liên hệ & Địa chỉ
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-text-muted w-24 shrink-0">Điện thoại:</span>
                  <span className="font-medium text-text-main">{shop.SoDienThoai}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-text-muted w-24 shrink-0">Địa chỉ:</span>
                  <span className="font-medium text-text-main">
                    {shop.DiaChi}, {shop.PhuongXa}, {shop.QuanHuyen}, {shop.TinhThanh}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Rejection UI */}
          {!shop.DaXacThucPhapLy && isRejecting && (
            <div className="mt-6 p-4 border border-warning/30 bg-warning/5 rounded-xl">
              <label className="block text-sm font-medium text-warning mb-2 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Lý do từ chối:
              </label>
              <textarea 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-sm text-text-main focus:border-warning focus:outline-none mb-3"
                rows={3}
                placeholder="Nhập lý do chi tiết..."
              />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setIsRejecting(false)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border-default hover:bg-surface text-text-muted"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleReject}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-danger hover:bg-red-600 text-white"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-border-default bg-surface-muted/30 flex justify-between items-center">
          <span className="text-xs text-text-muted">
            Ngày tạo: {new Date(shop.NgayTao).toLocaleString('vi-VN')}
          </span>
          <div className="flex gap-3">
            {!shop.DaXacThucPhapLy ? (
              <>
                <button
                  onClick={() => setIsRejecting(true)}
                  disabled={isRejecting}
                  className="px-4 py-2 rounded-lg font-medium text-sm text-danger border border-danger/30 hover:bg-danger/10 transition-colors"
                >
                  Từ chối
                </button>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-secondary hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Phê duyệt
                </button>
              </>
            ) : (
              <button
                onClick={handleToggleStatus}
                className={`px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ${
                  shop.TrangThai ? 'bg-danger hover:bg-red-600' : 'bg-primary hover:bg-primary-hover'
                }`}
              >
                {shop.TrangThai ? (
                  <><Lock className="w-4 h-4" /> Khóa cửa hàng</>
                ) : (
                  <><Unlock className="w-4 h-4" /> Mở khóa cửa hàng</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDetailModal;
