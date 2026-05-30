import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import type { ProductDetailType } from '../../../pages/admin/ProductDetail';
import { Document, Page, pdfjs } from 'react-pdf';
import { decodeBase64ToPDFData } from '../../../utils/pdf.utils';
import { SERVER_URL } from '../../../services/api';

// Cấu hình worker cho pdf.js (bắt buộc đối với react-pdf)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface ProductDescriptionProps {
  product: ProductDetailType;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({ product }) => {
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const [pdfWidth, setPdfWidth] = useState<number>(600);
  const [showReadMoreButton, setShowReadMoreButton] = useState(false);

  useEffect(() => {
    if (!contentWrapperRef.current) return;
    const observer = new ResizeObserver(() => {
      if (contentWrapperRef.current) {
        // Chỉ tính toán lại khi đang ở trạng thái thu gọn
        if (!isDescExpanded) {
          // Dùng clientHeight thay vì fix cứng 300px, cộng thêm 2px sai số
          if (contentWrapperRef.current.scrollHeight > contentWrapperRef.current.clientHeight + 2) {
            setShowReadMoreButton(true);
          } else {
            setShowReadMoreButton(false);
          }
        }
      }
    });
    observer.observe(contentWrapperRef.current);
    return () => observer.disconnect();
  }, [product.FileMoTa, numPages, isDescExpanded]);


  useEffect(() => {
    if (containerRef.current) {
      // Tính toán chiều rộng khả dụng của container (trừ padding)
      setPdfWidth(containerRef.current.clientWidth - 48); 
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setPdfWidth(containerRef.current.clientWidth - 48);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [product.FileMoTa]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  let pdfFileSource = '';
  let decodeError = false;

  if (product.FileMoTa) {
    if (product.FileMoTa.toLowerCase().endsWith('.pdf')) {
      pdfFileSource = `${SERVER_URL}/uploads/products/${product.FileMoTa}`;
    } else if (product.FileMoTa.startsWith('data:application/pdf') || product.FileMoTa.startsWith('JVBER')) {
      try {
        pdfFileSource = decodeBase64ToPDFData(product.FileMoTa);
        if (!pdfFileSource || pdfFileSource.length < 50) {
          decodeError = true;
        }
      } catch (error) {
        decodeError = true;
      }
    }
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-border-default p-6 flex flex-col ${!isDescExpanded ? 'flex-1 min-h-[250px]' : 'h-fit'}`} ref={containerRef}>
      <h2 className="text-lg font-bold text-text-main mb-4 flex-none">Mô tả sản phẩm</h2>
      
      <div ref={contentWrapperRef} className={`relative overflow-hidden transition-all duration-300 ${!isDescExpanded ? 'flex-1 min-h-0' : 'max-h-[10000px] pb-4'}`}>
        {product.FileMoTa ? (
          decodeError ? (
            <div className="p-4 bg-danger/10 text-danger rounded-lg text-center w-full">
              Không thể mã hóa file
            </div>
          ) : (product.FileMoTa.toLowerCase().endsWith('.pdf') || product.FileMoTa.startsWith('data:application/pdf') || product.FileMoTa.startsWith('JVBER')) ? (
            <div className="w-full flex flex-col items-center bg-surface-muted/30 py-4 rounded-lg">
              <Document
                file={pdfFileSource}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex flex-col items-center justify-center py-10 text-text-muted">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span>Đang tải file PDF...</span>
                  </div>
                }
                error={
                  <div className="p-4 bg-danger/10 text-danger rounded-lg text-center w-full">
                    Không thể mã hóa file
                  </div>
                }
              >
                {numPages && Array.from(new Array(numPages), (_, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={pdfWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="mb-4 shadow-sm bg-white"
                  />
                ))}
              </Document>
            </div>
          ) : (
            <div className="text-text-main text-sm whitespace-pre-wrap leading-relaxed">
              {product.FileMoTa}
            </div>
          )
        ) : (
          <div className="text-center text-text-muted py-10 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-border-default/50 flex items-center justify-center">
              <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p>Sản phẩm này chưa có file mô tả</p>
          </div>
        )}

        {/* Gradient Overlay khi thu gọn */}
        {!isDescExpanded && product.FileMoTa && showReadMoreButton && (
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
        )}
      </div>

      {product.FileMoTa && showReadMoreButton && (
        <div className="flex justify-center mt-2">
          <button 
            onClick={() => setIsDescExpanded(!isDescExpanded)}
            className="text-primary hover:text-primary-hover font-semibold text-sm flex items-center gap-1 transition-colors px-6 py-2 rounded-full border border-primary/30 hover:bg-primary/5"
          >
            {isDescExpanded ? (
              <>Thu gọn <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>Xem thêm <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductDescription;
