import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Sparkles, Image as ImageIcon, X, Loader2, Plus } from 'lucide-react';
import api, { SERVER_URL } from '../../services/api';
import { uploadImage } from '../../services/upload.service';
import productSellerService from '../../services/productSeller.service';
import { getProductImageUrl } from '../../utils/image.utils';
import { encodeFile } from '../../utils/file.utils';
import { type Product } from '../../pages/admin/ProductManagement';

interface CategoryTree {
  MaDanhMuc: string;
  TenDanhMuc: string;
  children?: CategoryTree[];
}

interface UploadedImage {
  tempId: string;
  file?: File;
  url: string;
  isMain: boolean;
  uploading: boolean;
  name: string; // The classification name mapped directly to this image
}

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: () => void;
  title?: string;
}

const docSoBangChu = (so: number): string => {
  if (so === 0) return 'không đồng';
  
  const unitNames = ['', ' nghìn', ' triệu', ' tỷ', ' nghìn tỷ', ' triệu tỷ'];
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

  const readGroup = (group: number, showZero: boolean): string => {
    let result = '';
    const h = Math.floor(group / 100);
    const t = Math.floor((group % 100) / 10);
    const u = group % 10;

    if (h > 0 || showZero) {
      result += digits[h] + ' trăm ';
    }

    if (t > 0) {
      if (t === 1) result += 'mười ';
      else result += digits[t] + ' mươi ';
    } else if (h > 0 && u > 0) {
      result += 'lẻ ';
    }

    if (u > 0) {
      if (u === 1 && t > 1) {
        result += 'mốt';
      } else if (u === 5 && t > 0) {
        result += 'lăm';
      } else {
        result += digits[u];
      }
    }
    return result.trim();
  };

  let numStr = Math.floor(so).toString();
  let groups: number[] = [];
  while (numStr.length > 0) {
    groups.push(parseInt(numStr.slice(-3)));
    numStr = numStr.slice(0, -3);
  }

  let text = '';

  for (let i = groups.length - 1; i >= 0; i--) {
    const groupVal = groups[i];
    if (groupVal > 0) {
      const showZero = i < groups.length - 1; // Show hundreds zero if not the first group
      const groupText = readGroup(groupVal, showZero);
      text += groupText + unitNames[i] + ' ';
    }
  }

  return text.trim() + ' đồng';
};

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
  title,
}) => {
  const isEditMode = !!product;

  // Categories state
  const [categoriesTree, setCategoriesTree] = useState<CategoryTree[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // Form details
  const [tieuDe, setTieuDe] = useState('');
  const [danhMucId, setDanhMucId] = useState('');
  const [gia, setGia] = useState<number | ''>('');
  const [tinhTrang, setTinhTrang] = useState('Mới');
  const [soLuong, setSoLuong] = useState(1);
  
  // Encrypted description file
  const [fileMoTa, setFileMoTa] = useState<string | null>(null);
  const [encodingFile, setEncodingFile] = useState(false);

  // Unified image and variation block list state
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  // Submit button loader
  const [submitting, setSubmitting] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showError = (msg: string) => {
    setError(msg);
    document.getElementById('product-edit-modal-body')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to get Category Name by ID
  const getSelectedCatName = () => {
    if (!danhMucId) return '-- Chọn danh mục --';
    
    const findName = (cats: CategoryTree[], id: string): string => {
      for (let c of cats) {
        if (c.MaDanhMuc === id) return c.TenDanhMuc;
        if (c.children) {
          const found = findName(c.children, id);
          if (found) return found;
        }
      }
      return '';
    };

    return findName(categoriesTree, danhMucId) || '-- Chọn danh mục --';
  };

  // Fetch Categories
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    const fetchCats = async () => {
      try {
        setLoadingCats(true);
        const res = await api.get('/categories?format=tree');
        if (res.data.success) {
          setCategoriesTree(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCats();
  }, [isOpen]);

  // Set form states if edit mode & fetch full details (images, variations)
  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    if (product) {
      // Basic initialization
      setTieuDe(product.TieuDe);
      setDanhMucId(product.DanhMucId || '');
      setGia(product.Gia);
      setTinhTrang(product.TinhTrang);
      setSoLuong(product.SoLuong);
      setFileMoTa(product.FileMoTa || null);

      // Fetch full details for images and variations
      const fetchFullDetail = async () => {
        try {
          const res = await productSellerService.getProductDetail(product.MaSanPham);
          if (res.success && res.data) {
            const fullProd = res.data;
            setTieuDe(fullProd.TieuDe);
            setDanhMucId(fullProd.DanhMucId || '');
            setGia(fullProd.Gia);
            setTinhTrang(fullProd.TinhTrang);
            setSoLuong(fullProd.SoLuong);
            setFileMoTa(fullProd.FileMoTa || null);
            
            // Map backend images and variations back to the blocks array
            if (fullProd.images) {
              const mappedBlocks = fullProd.images.map((img: any) => {
                const matchingVar = fullProd.variations?.find((v: any) => v.HinhAnhId === img.MaHinhAnh);
                return {
                  tempId: img.MaHinhAnh,
                  url: img.DuongDanAnh,
                  name: matchingVar ? matchingVar.TenPhanLoai : '',
                  isMain: img.LaAnhChinh === 1 || img.LaAnhChinh === true,
                  uploading: false
                };
              });
              setUploadedImages(mappedBlocks);
            }
          }
        } catch (err) {
          console.error('Error fetching full product details:', err);
          showError('Không thể tải chi tiết hình ảnh và phân loại của sản phẩm.');
        }
      };
      fetchFullDetail();
    } else {
      // Reset form for add mode
      setTieuDe('');
      setDanhMucId('');
      setGia('');
      setTinhTrang('Mới');
      setSoLuong(1);
      setFileMoTa(null);
      // Start with exactly 1 empty block by default
      setUploadedImages([
        {
          tempId: Math.random().toString(36).substring(2, 9),
          url: '',
          name: '',
          isMain: true,
          uploading: false
        }
      ]);
    }
  }, [isOpen, product]);

  // Handle image upload inside a block
  const handleBlockImageChange = async (e: React.ChangeEvent<HTMLInputElement>, tempId: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      setUploadedImages(prev =>
        prev.map(item =>
          item.tempId === tempId
            ? { ...item, file, url: '', uploading: true }
            : item
        )
      );

      try {
        const res = await uploadImage(file);
        if (res.success && res.url) {
          setUploadedImages(prev =>
            prev.map(item =>
              item.tempId === tempId
                ? { ...item, url: res.url!, uploading: false }
                : item
            )
          );
        } else {
          setUploadedImages(prev =>
            prev.map(item =>
              item.tempId === tempId
                ? { ...item, uploading: false }
                : item
            )
          );
          showError(`Upload ảnh thất bại: ${res.message}`);
        }
      } catch (error) {
        setUploadedImages(prev =>
          prev.map(item =>
            item.tempId === tempId
              ? { ...item, uploading: false }
              : item
          )
        );
        console.error(error);
      }
    }
  };

  // Handle classification name change inside a block
  const handleBlockNameChange = (name: string, tempId: string) => {
    setUploadedImages(prev =>
      prev.map(item =>
        item.tempId === tempId
          ? { ...item, name }
          : item
      )
    );
  };

  // Add a new empty block (image + classification pair)
  const handleAddNewBlock = () => {
    const newBlock: UploadedImage = {
      tempId: Math.random().toString(36).substring(2, 9),
      url: '',
      isMain: uploadedImages.length === 0,
      uploading: false,
      name: ''
    };
    setUploadedImages(prev => [...prev, newBlock]);
  };

  // Remove a block from the list
  const removeBlock = (tempId: string) => {
    setUploadedImages(prev => {
      const filtered = prev.filter(img => img.tempId !== tempId);
      // If we removed the main image block, set a new main block if available
      const wasMain = prev.find(img => img.tempId === tempId)?.isMain;
      if (wasMain && filtered.length > 0) {
        filtered[0].isMain = true;
      }
      return filtered;
    });
  };

  // Set image block as main
  const setAsMainImage = (tempId: string) => {
    setUploadedImages(prev =>
      prev.map(img => ({
        ...img,
        isMain: img.tempId === tempId
      }))
    );
  };

  // Description file change handler
  const handleDescFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setEncodingFile(true);
        const base64 = await encodeFile(file);
        setFileMoTa(base64);
      } catch (err) {
        showError('Lỗi mã hóa file mô tả');
      } finally {
        setEncodingFile(false);
      }
    }
  };

  const handlePreviewDescFile = () => {
    if (!fileMoTa) return;
    
    // Check if it's already a full URL or a relative path of a saved file
    if (fileMoTa.toLowerCase().endsWith('.pdf') || fileMoTa.toLowerCase().endsWith('.txt') || fileMoTa.toLowerCase().endsWith('.doc') || fileMoTa.toLowerCase().endsWith('.docx')) {
      const url = fileMoTa.startsWith('http') ? fileMoTa : `${SERVER_URL}/uploads/products/${fileMoTa}`;
      window.open(url, '_blank');
      return;
    }
    
    // If it's a base64 data URL
    if (fileMoTa.startsWith('data:')) {
      try {
        const parts = fileMoTa.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        const blob = new Blob([uInt8Array], { type: contentType });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } catch (err) {
        // Fallback: try opening the data URL directly
        window.open(fileMoTa, '_blank');
      }
      return;
    }

    // If it's just raw text, we can show it in a text window
    const blob = new Blob([fileMoTa], { type: 'text/plain;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  };

  // Handle Form Submit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!danhMucId) {
      showError('Vui lòng chọn danh mục cho sản phẩm!');
      return;
    }

    if (gia === '' || gia <= 0) {
      showError('Vui lòng nhập giá bán hợp lệ!');
      return;
    }

    // Validations for blocks
    if (uploadedImages.length === 0) {
      showError('Vui lòng thêm ít nhất 1 hình ảnh sản phẩm kèm phân loại!');
      return;
    }

    const hasIncompleteBlock = uploadedImages.some(img => !img.url || !img.name.trim());
    if (hasIncompleteBlock) {
      showError('Vui lòng tải lên đầy đủ hình ảnh và nhập tên phân loại cho tất cả các khối!');
      return;
    }

    const hasMain = uploadedImages.some(img => img.isMain);
    if (!hasMain) {
      showError('Vui lòng chọn 1 hình ảnh làm ảnh chính!');
      return;
    }

    if (uploadedImages.some(img => img.uploading)) {
      showError('Hình ảnh đang trong quá trình tải lên. Vui lòng đợi!');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        TieuDe: tieuDe,
        DanhMucId: danhMucId,
        Gia: Number(gia),
        TinhTrang: tinhTrang,
        SoLuong: Number(soLuong),
        FileMoTa: fileMoTa,
        images: uploadedImages.map(img => ({
          url: img.url,
          isMain: img.isMain,
          tempId: img.tempId
        })),
        variations: uploadedImages.map(img => ({
          name: img.name.trim(),
          imageTempId: img.tempId
        }))
      };

      if (isEditMode && product) {
        // Edit mode
        const res = await productSellerService.updateProduct(product.MaSanPham, payload as any);
        if (res.success) {
          onSuccess();
        }
      } else {
        // Add mode
        const res = await productSellerService.createProduct(payload);
        if (res.success) {
          onSuccess();
        }
      }
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lưu sản phẩm.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border-default rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 text-text-main">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border-default bg-surface-muted">
          <h3 className="text-xl font-bold flex items-center gap-2 text-text-main">
            <Sparkles size={20} className="text-primary" />
            <span>{title || (isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới')}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-main transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div id="product-edit-modal-body" className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-start justify-between text-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-start gap-2.5">
                <span className="font-bold shrink-0 mt-0.5">Lỗi:</span>
                <span className="leading-relaxed">{error}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setError(null)} 
                className="text-danger/70 hover:text-danger p-0.5 rounded-md hover:bg-danger/10 transition shrink-0 ml-3"
              >
                <X size={16} />
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Column 1: Image & Variation Block List */}
            <div className="space-y-6">
              <div className="p-5 border border-border-default rounded-2xl bg-surface-muted h-full flex flex-col">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary">
                  <ImageIcon size={18} />
                  <span>1. Hình ảnh & Phân loại sản phẩm</span>
                </h4>
                <p className="text-[11px] text-text-muted mb-4">
                  Mỗi khối bao gồm 1 ảnh sản phẩm và 1 tên phân loại. Nhấn nút + bên dưới để thêm khối mới.
                </p>

                {/* Unified Image & Variation List */}
                <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1 flex-1 mb-4">
                  {uploadedImages.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-border-default rounded-xl text-text-muted text-xs bg-surface/50">
                      Không có khối phân loại nào. Hãy nhấn nút thêm bên dưới.
                    </div>
                  ) : (
                    uploadedImages.map((img) => (
                      <div key={img.tempId} className="flex flex-col sm:flex-row gap-4 p-3 border border-border-default rounded-xl bg-surface relative group">
                        
                        {/* Image Upload Area for this block */}
                        <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-border-default bg-surface-muted flex items-center justify-center self-start">
                          {img.url ? (
                            <img
                              src={getProductImageUrl(img.url)}
                              alt="product"
                              className="w-full h-full object-cover"
                            />
                          ) : img.uploading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-surface-muted">
                              <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            </div>
                          ) : (
                            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-surface-hover transition">
                              <Upload size={18} className="text-text-muted mb-0.5" />
                              <span className="text-[9px] text-text-muted">Tải ảnh</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleBlockImageChange(e, img.tempId)}
                                className="hidden"
                              />
                            </label>
                          )}
                          
                          {/* Main Image Toggle */}
                          {img.url && (
                            <button
                              type="button"
                              onClick={() => setAsMainImage(img.tempId)}
                              className={`absolute bottom-0 inset-x-0 py-0.5 text-center text-[9px] font-bold transition uppercase tracking-wider ${
                                img.isMain 
                                  ? 'bg-primary text-white font-extrabold' 
                                  : 'bg-black/60 text-white hover:bg-black/80'
                              }`}
                            >
                              {img.isMain ? 'Ảnh chính' : 'Chọn chính'}
                            </button>
                          )}
                        </div>

                        {/* Text Input for classification */}
                        <div className="flex-1 flex flex-col justify-center space-y-1.5">
                          <label className="block text-[10px] font-medium text-text-body">Phân loại sản phẩm *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ví dụ: Màu Đỏ, 128GB, v.v..."
                            value={img.name}
                            onChange={(e) => handleBlockNameChange(e.target.value, img.tempId)}
                            className="w-full bg-surface border border-border-default focus:border-primary rounded-lg px-2.5 py-1.5 text-xs text-text-main outline-none transition focus:ring-1 focus:ring-primary"
                          />
                        </div>

                        {/* Trash button to delete this block */}
                        <div className="absolute top-2 right-2 sm:relative sm:top-auto sm:right-auto sm:flex sm:items-center">
                          <button
                            type="button"
                            onClick={() => removeBlock(img.tempId)}
                            className="p-1.5 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger transition"
                            title="Xóa khối phân loại"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add button outside the blocks list: blue, semi-transparent, rounded-lg */}
                <button
                  type="button"
                  onClick={handleAddNewBlock}
                  className="py-3 flex items-center justify-center gap-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-all font-semibold text-xs shadow-sm"
                  title="Thêm khối ảnh và phân loại mới"
                >
                  <Plus size={16} className="stroke-[2.5]" />
                  <span>Thêm phân loại mới</span>
                </button>
              </div>
            </div>

            {/* Column 2: Product Basic Fields */}
            <div className="space-y-6">
              <div className="p-5 border border-border-default rounded-2xl bg-surface-muted space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                  <Sparkles size={18} />
                  <span>2. Thông tin sản phẩm</span>
                </h4>

                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-text-body mb-1">Tiêu đề sản phẩm *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tiều đề sản phẩm..."
                    value={tieuDe}
                    onChange={e => setTieuDe(e.target.value)}
                    className="w-full bg-surface border border-border-default focus:border-primary rounded-xl px-4 py-2.5 text-sm text-text-main outline-none transition focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Category */}
                <div className="relative">
                  <label className="block text-xs font-medium text-text-body mb-1">Danh mục *</label>
                  <button
                    type="button"
                    onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                    disabled={loadingCats}
                    className="w-full bg-surface border border-border-default hover:border-primary rounded-xl px-4 py-2.5 text-sm text-text-main outline-none text-left flex justify-between items-center transition focus:ring-1 focus:ring-primary disabled:opacity-50"
                  >
                    <span className="truncate">{getSelectedCatName()}</span>
                    <svg className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isCatDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isCatDropdownOpen && (
                    <>
                      {/* Invisible backdrop to close the dropdown when clicking outside */}
                      <div className="fixed inset-0 z-10" onClick={() => setIsCatDropdownOpen(false)} />
                      
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-border-default rounded-xl shadow-xl z-20 max-h-[200px] overflow-y-auto py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                        {categoriesTree.length === 0 ? (
                          <div className="px-4 py-2 text-xs text-text-muted italic">Không có danh mục</div>
                        ) : (
                          categoriesTree.map(parent => (
                            <div key={parent.MaDanhMuc}>
                              {/* Parent Category Option */}
                              <button
                                type="button"
                                onClick={() => {
                                  setDanhMucId(parent.MaDanhMuc);
                                  setIsCatDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wide border-b border-border-default/30 transition hover:bg-primary/5 flex items-center justify-between ${
                                  danhMucId === parent.MaDanhMuc ? 'text-primary bg-primary/5' : 'text-text-main'
                                }`}
                              >
                                <span>{parent.TenDanhMuc}</span>
                                <span className="text-[10px] text-text-muted font-normal lowercase italic">(Tất cả)</span>
                              </button>

                              {/* Child Categories */}
                              {parent.children && parent.children.map(child => (
                                <button
                                  type="button"
                                  key={child.MaDanhMuc}
                                  onClick={() => {
                                    setDanhMucId(child.MaDanhMuc);
                                    setIsCatDropdownOpen(false);
                                  }}
                                  className={`w-full text-left pl-8 pr-4 py-2 text-xs font-medium transition hover:bg-primary/5 ${
                                    danhMucId === child.MaDanhMuc ? 'text-primary font-bold bg-primary/5' : 'text-text-body'
                                  }`}
                                >
                                  {child.TenDanhMuc}
                                </button>
                              ))}
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Price and Condition */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-body mb-1">Giá bán (VND) *</label>
                    <input
                      type="number"
                      required
                      min="1000"
                      placeholder="Ví dụ: 15000000"
                      value={gia}
                      onChange={e => setGia(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-surface border border-border-default focus:border-primary rounded-xl px-4 py-2.5 text-sm text-text-main outline-none transition focus:ring-1 focus:ring-primary"
                    />
                    {gia !== '' && gia > 0 && (
                      <div className="mt-1.5 px-3 py-2 bg-primary/5 border border-primary/10 rounded-xl space-y-0.5 text-left">
                        <div className="text-xs font-bold text-primary">
                          {gia.toLocaleString('vi-VN')} đ
                        </div>
                        <div className="text-[10px] text-text-muted italic capitalize leading-relaxed">
                          ({docSoBangChu(gia)})
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-body mb-1">Tình trạng *</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-1.5 cursor-pointer text-sm text-text-body">
                        <input
                          type="radio"
                          name="tinhTrangModal"
                          checked={tinhTrang === 'Mới'}
                          onChange={() => setTinhTrang('Mới')}
                          className="text-primary focus:ring-0"
                        />
                        <span>Mới</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-sm text-text-body">
                        <input
                          type="radio"
                          name="tinhTrangModal"
                          checked={tinhTrang === 'Cũ'}
                          onChange={() => setTinhTrang('Cũ')}
                          className="text-primary focus:ring-0"
                        />
                        <span>Cũ</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Quantity and Description File Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-medium text-text-body mb-1">Số lượng hàng *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={soLuong}
                      onChange={e => setSoLuong(Number(e.target.value))}
                      className="w-full bg-surface border border-border-default focus:border-primary rounded-xl px-4 py-2.5 text-sm text-text-main outline-none transition focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* File description encoding */}
                  <div>
                    <label className="block text-xs font-medium text-text-body mb-1">Tài liệu mô tả chi tiết</label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <label className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl cursor-pointer transition text-xs font-medium shrink-0">
                        <Upload size={14} />
                        <span>Chọn file</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleDescFileChange}
                          className="hidden"
                        />
                      </label>
                      {encodingFile && <span className="text-xs text-primary animate-pulse font-medium">Mã hóa...</span>}
                      {fileMoTa && !encodingFile && (
                        <button
                          type="button"
                          onClick={handlePreviewDescFile}
                          className="px-2.5 py-2 text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl transition font-medium shrink-0"
                        >
                          Xem trước
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border-default bg-surface-muted">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-surface border border-border-default hover:bg-surface-muted text-text-body rounded-xl transition font-medium text-sm"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSaveProduct}
            disabled={submitting || encodingFile}
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl transition font-semibold text-sm shadow-md disabled:opacity-50"
          >
            {submitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductEditModal;
