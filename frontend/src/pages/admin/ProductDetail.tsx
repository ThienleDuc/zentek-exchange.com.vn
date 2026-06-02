import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { productAdminService } from '../../services/productAdmin.service';
import { productService } from '../../services/product.service';
import productSellerService from '../../services/productSeller.service';
import { cartService } from '../../services/cart.service';
import { orderService } from '../../services/order.service';
import { storage } from '../../utils/storage.utils';
import { isAdmin, isSeller, isBuyer } from '../../utils/role.utils';
import { PATHS } from '../../utils/path.utils';
import Alert, { type AlertType } from '../../components/common/Alert';
import ProductImageGallery from '../../components/admin/ProductImageGallery';
import ProductInfo from '../../components/admin/product-detail/ProductInfo';
import ProductDescription from '../../components/admin/product-detail/ProductDescription';
import ProductShopInfo from '../../components/admin/product-detail/ProductShopInfo';
import ProductReviews from '../../components/admin/product-detail/ProductReviews';

export interface ProductDetailType {
  MaSanPham: string;
  TieuDe: string;
  FileMoTa: string;
  Gia: number;
  SoLuong: number;
  SoLuongDaBan: number;
  NgayDang: string;
  NgaySua: string;
  TrangThaiDuyet: string;
  NgayDuyet: string;
  TinhTrang: string;
  LuotXem: number;
  DiemDanhGia: number;
  SoLuongGioHangThucTe: number;
  TenCuaHang: string;
  Logo: string;
  CuaHangDiaChi: string;
  LoaiHinhCuaHang: number;
  TenDanhMuc: string;
  TenDanhMucCha?: string | null;
  images: any[];
  variations: any[];
  reviews: any[];
  DaHetHang?: boolean | number;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const leftColRef = useRef<HTMLDivElement>(null);
  const [leftHeight, setLeftHeight] = useState<number | 'auto'>('auto');
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const isAdminView = location.pathname.startsWith('/admin');
  const isSellerView = location.pathname.startsWith('/seller');
  const currentUser = storage.getUser();

  let role: 'admin' | 'seller' | 'buyer' = 'buyer';
  if (currentUser) {
    if (isAdminView && isAdmin(currentUser)) role = 'admin';
    else if (isSellerView && isSeller(currentUser)) role = 'seller';
  }

  useEffect(() => {
    if (!leftColRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      if (window.innerWidth < 1024) {
        setLeftHeight('auto');
        return;
      }
      for (let entry of entries) {
        setLeftHeight(entry.target.getBoundingClientRect().height);
      }
    });

    resizeObserver.observe(leftColRef.current);
    
    // Also re-evaluate on window resize
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setLeftHeight('auto');
      } else if (leftColRef.current) {
        setLeftHeight(leftColRef.current.getBoundingClientRect().height);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [product, loading]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Chỉ áp dụng trên màn hình lớn
      if (window.innerWidth < 1024) return;
      
      const rightDiv = document.getElementById('right-info-container');
      const gridContainer = document.getElementById('product-grid-container');
      if (!rightDiv || !gridContainer) return;

      const gridRect = gridContainer.getBoundingClientRect();
      
      // Xác định khi nào grid đang hiển thị trọn vẹn ở phần trên cùng của màn hình
      // sticky top-24 tương đương 96px, lấy khoảng an toàn từ 0 đến 120px
      const isInFocus = gridRect.top >= 0 && gridRect.top <= 120;
      if (!isInFocus) return;

      const isAtTop = rightDiv.scrollTop === 0;
      const isAtBottom = Math.abs(rightDiv.scrollHeight - rightDiv.clientHeight - rightDiv.scrollTop) <= 2;

      const scrollingDown = e.deltaY > 0;
      const scrollingUp = e.deltaY < 0;

      // Nếu cuộn xuống và chưa đến đáy của thẻ div
      if (scrollingDown && !isAtBottom) {
        rightDiv.scrollTop += e.deltaY;
        e.preventDefault(); // Ngăn trang cuộn
      } 
      // Nếu cuộn lên và chưa đến đỉnh của thẻ div
      else if (scrollingUp && !isAtTop) {
        rightDiv.scrollTop += e.deltaY;
        e.preventDefault(); // Ngăn trang cuộn
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);
  
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; type: AlertType; title: string; message: string; onConfirm?: () => void }>({ 
    isOpen: false, type: 'info', title: '', message: '' 
  });

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = isSellerView
        ? await productSellerService.getProductDetail(id as string)
        : isAdminView 
          ? await productAdminService.getProductDetail(id as string)
          : await productService.getProductDetail(id as string);
      if (data.success) {
        setProduct(data.data);
        if (data.data.images?.length > 0) {
          setActiveImageUrl(data.data.images[0].DuongDanAnh);
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id, isAdminView, isSellerView]);

  const handleAction = async (actionStatus: string, confirmMessage: string) => {
    setAlertConfig({
      isOpen: true,
      type: 'confirm',
      title: 'Xác nhận',
      message: confirmMessage,
      onConfirm: async () => {
        try {
          let data;
          let qty = 10;
          if (role === 'seller') {
            if (actionStatus === 'Hết hàng') {
              data = await productSellerService.setOutOfStock(id as string);
            } else {
              const qtyStr = prompt("Nhập số lượng hàng mới:", "10");
              if (qtyStr === null) return;
              qty = parseInt(qtyStr, 10);
              if (isNaN(qty) || qty <= 0) {
                setAlertConfig({ isOpen: true, type: 'error', title: 'Lỗi', message: 'Số lượng không hợp lệ!' });
                return;
              }
              data = await productSellerService.setInStock(id as string, qty);
            }
          } else {
            data = await productAdminService.updateProductStatus(id as string, actionStatus);
          }
          if (data.success) {
            setProduct(prev => prev ? { 
              ...prev, 
              TrangThaiDuyet: role === 'seller' ? prev.TrangThaiDuyet : actionStatus,
              SoLuong: role === 'seller' ? (actionStatus === 'Hết hàng' ? 0 : qty) : prev.SoLuong,
              DaHetHang: role === 'seller' ? (actionStatus === 'Hết hàng' ? 1 : 0) : prev.DaHetHang
            } : null);
            setAlertConfig({ isOpen: true, type: 'success', title: 'Thành công', message: 'Cập nhật trạng thái thành công' });
          }
        } catch (err: any) {
          setAlertConfig({ isOpen: true, type: 'error', title: 'Lỗi', message: err.response?.data?.message || 'Cập nhật thất bại' });
        }
      }
    });
  };

  const handleAddToCart = (qty: number) => {
    if (!currentUser) {
      setAlertConfig({
        isOpen: true,
        type: 'confirm',
        title: 'Yêu cầu đăng nhập',
        message: 'Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Đi đến trang đăng nhập?',
        onConfirm: () => {
          navigate('/dang-nhap', { state: { from: location } });
        }
      });
      return;
    }
    
    if (!product) return;

    if (product.variations && product.variations.length > 0 && !selectedVariantId) {
      setAlertConfig({
        isOpen: true,
        type: 'error',
        title: 'Yêu cầu phân loại',
        message: 'Vui lòng chọn phân loại sản phẩm trước khi thêm vào giỏ hàng.'
      });
      return;
    }

    cartService.addToCart(product.MaSanPham, qty, selectedVariantId || undefined)
      .then(() => {
        setAlertConfig({
          isOpen: true,
          type: 'success',
          title: 'Thành công',
          message: 'Đã thêm sản phẩm vào giỏ hàng'
        });
      })
      .catch((err: any) => {
        setAlertConfig({
          isOpen: true,
          type: 'error',
          title: 'Lỗi',
          message: err.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng.'
        });
      });
  };

  const handleBuyNow = (qty: number) => {
    if (!currentUser) {
      setAlertConfig({
        isOpen: true,
        type: 'confirm',
        title: 'Yêu cầu đăng nhập',
        message: 'Bạn cần đăng nhập để mua hàng. Đi đến trang đăng nhập?',
        onConfirm: () => {
          navigate('/dang-nhap', { state: { from: location } });
        }
      });
      return;
    }
    
    if (!product) return;

    if (product.variations && product.variations.length > 0 && !selectedVariantId) {
      setAlertConfig({
        isOpen: true,
        type: 'error',
        title: 'Yêu cầu phân loại',
        message: 'Vui lòng chọn phân loại sản phẩm trước khi mua hàng.'
      });
      return;
    }

    orderService.createTempOrderFromBuyNow(product.MaSanPham, qty, selectedVariantId || undefined)
      .then((res: any) => {
        if (res.success && res.data?.tempOrderId) {
          navigate(`${PATHS.Buyer.CHECKOUT}?tempOrderId=${res.data.tempOrderId}`);
        }
      })
      .catch((err: any) => {
        setAlertConfig({
          isOpen: true,
          type: 'error',
          title: 'Lỗi',
          message: err.response?.data?.message || 'Không thể tiến hành đặt hàng.'
        });
      });
  };

  const handleContactSeller = () => {
    if (!currentUser) {
      setAlertConfig({
        isOpen: true,
        type: 'confirm',
        title: 'Yêu cầu đăng nhập',
        message: 'Bạn cần đăng nhập để liên hệ với người bán. Đi đến trang đăng nhập?',
        onConfirm: () => {
          navigate('/dang-nhap', { state: { from: location } });
        }
      });
      return;
    }

    if (!product) return;

    if (isBuyer(currentUser)) {
      navigate(`/buyer/tin-nhan?store=${encodeURIComponent(product.TenCuaHang)}`);
    } else if (isSeller(currentUser)) {
      navigate(`/seller/chat?store=${encodeURIComponent(product.TenCuaHang)}`);
    } else if (isAdmin(currentUser)) {
      navigate(`/admin/messages?store=${encodeURIComponent(product.TenCuaHang)}`);
    }
  };

  const handleBack = () => {
    if (isAdminView) {
      navigate('/admin/products');
    } else if (isSellerView) {
      navigate('/seller/san-pham');
    } else {
      navigate(-1);
    }
  };

  if (loading) return <div className="p-8 text-center text-text-muted">Đang tải dữ liệu...</div>;
  if (!product) return <div className="p-8 text-center text-text-muted">Không tìm thấy sản phẩm</div>;

  return (
    <div className="product-detail-page space-y-4 max-w-[1200px] mx-auto w-full">
      {/* 1. Header (Breadcrumb style) */}
      <div className="flex items-center text-sm text-text-muted hover:text-text-main transition-colors cursor-pointer w-fit" onClick={handleBack}>
        <ArrowLeft className="w-4 h-4 mr-1" /> {(isAdminView || isSellerView) ? 'Quay lại danh sách sản phẩm' : 'Quay lại'}
      </div>

      {/* 2. Main Layout: 2 Cards (Trái: Ảnh, Phải: Thông tin) */}
      <div id="product-grid-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Card Trái: Ảnh sản phẩm */}
        <div ref={leftColRef} className="lg:col-span-6 bg-surface rounded-xl shadow-sm border border-border-default p-4 flex flex-col sticky top-24">
          <ProductImageGallery 
            images={product.images} 
            activeImageUrl={activeImageUrl}
            onSelectImage={setActiveImageUrl}
          />
        </div>

        {/* Cột Phải: Thông tin cơ bản và Mô tả */}
        <div 
          id="right-info-container"
          className="lg:col-span-6 flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar"
          style={{ height: leftHeight === 'auto' ? 'auto' : `${leftHeight}px` }}
        >
          {/* Card Phải: Thông tin cơ bản */}
          <ProductInfo 
            product={product} 
            handleAction={handleAction} 
            onSelectVariantImage={setActiveImageUrl} 
            role={role}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            selectedVariantId={selectedVariantId}
            onSelectVariantId={setSelectedVariantId}
          />
          
          {/* 2.5 Mô tả sản phẩm (Card riêng biệt nằm dưới thông tin cơ bản) */}
          <ProductDescription product={product} />
        </div>
      </div>

      {/* 3. Shop Info Banner */}
      <ProductShopInfo product={product} onContact={handleContactSeller} />

      {/* 4. Bottom Block (Đánh giá) */}
      <ProductReviews 
        product={product} 
        currentUserId={currentUser?.MaNguoiDung} 
        role={role}
        onRefresh={fetchDetail}
      />

      <Alert isOpen={alertConfig.isOpen} type={alertConfig.type} title={alertConfig.title} message={alertConfig.message} onConfirm={alertConfig.onConfirm} onClose={() => setAlertConfig(p => ({...p, isOpen: false}))} />
    </div>
  );
};

export default ProductDetail;
