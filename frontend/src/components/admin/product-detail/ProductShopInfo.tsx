import React from 'react';
import { Store } from 'lucide-react';
import type { ProductDetailType } from '../../../pages/admin/ProductDetail';

interface ProductShopInfoProps {
  product: ProductDetailType;
}

const ProductShopInfo: React.FC<ProductShopInfoProps> = ({ product }) => {
  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border-default p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        {product.Logo ? (
          <img src={product.Logo} alt={product.TenCuaHang} className="w-20 h-20 rounded-full object-cover border border-border-default shadow-sm" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">{product.TenCuaHang.charAt(0)}</div>
        )}
        <div>
          <h3 className="font-bold text-lg text-text-main flex items-center gap-2">
            {product.TenCuaHang} 
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
              {product.LoaiHinhCuaHang === 1 ? 'Cá nhân' : product.LoaiHinhCuaHang === 2 ? 'Hộ kinh doanh' : 'Doanh nghiệp'}
            </span>
          </h3>
          <div className="text-sm text-text-muted mt-1 flex items-center gap-1">
            <Store className="w-4 h-4" /> {product.CuaHangDiaChi}
          </div>
        </div>
      </div>
      <div className="flex gap-4 text-sm">
         <div className="text-center px-4 border-r border-border-default">
           <div className="text-primary font-bold text-lg">{product.SoLuongGioHangThucTe}</div>
           <div className="text-text-muted">Trong giỏ</div>
         </div>
         <div className="text-center px-4">
           <div className="text-primary font-bold text-lg">{product.LuotXem}</div>
           <div className="text-text-muted">Lượt xem</div>
         </div>
      </div>
    </div>
  );
};

export default ProductShopInfo;
