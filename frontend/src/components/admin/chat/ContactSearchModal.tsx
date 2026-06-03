import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Loader2, User, Store, MessageCircle } from 'lucide-react';
import { userService } from '../../../services/user.service';
import { chatService } from '../../../services/chat.service';
import { getUserAvatarUrl, getStoreLogoUrl } from '../../../utils/image.utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onContactCreated?: (conversationId: string) => void;
}

type SearchTab = 'people' | 'stores';

const ContactSearchModal = ({ isOpen, onClose, onContactCreated }: Props) => {
  const [tab, setTab] = useState<SearchTab>('people');
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // true after debounce completes
  const [contactingId, setContactingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const doSearch = useCallback(async (query: string, searchTab: SearchTab) => {
    if (!query.trim()) { setResults([]); setHasSearched(false); return; }
    const currentReqId = ++requestIdRef.current;
    setLoading(true);
    try {
      const res = searchTab === 'people'
        ? await userService.searchContacts(query.trim())
        : await userService.searchStores(query.trim());
      if (currentReqId === requestIdRef.current) {
        setResults(res || []);
        setHasSearched(true);
      }
    } catch (err) {
      console.error(err);
      if (currentReqId === requestIdRef.current) {
        setResults([]);
        setHasSearched(true);
      }
    } finally {
      if (currentReqId === requestIdRef.current) setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQ(value);
    setHasSearched(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(() => doSearch(value, tab), 300);
  };

  const handleTabChange = (newTab: SearchTab) => {
    setTab(newTab); setQ(''); setResults([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const handleContact = async (userId: string) => {
    if (!userId || contactingId) return;
    setContactingId(userId);
    try {
      const res = await chatService.findOrCreatePrivateChat(userId);
      if (res.data?.conversationId) {
        onContactCreated?.(res.data.conversationId);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setContactingId(null);
    }
  };

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  if (!isOpen) return null;

  const Avatar = ({ src, name, isStore }: { src?: string | null; name?: string; isStore?: boolean }) => (
    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border border-border-default overflow-hidden flex items-center justify-center shrink-0">
      {src ? (
        <img src={isStore ? getStoreLogoUrl(src) : getUserAvatarUrl(src)} alt={name || ''} className="w-full h-full object-cover" />
      ) : isStore ? (
        <Store size={18} className="text-primary/50" />
      ) : (
        <span className="text-sm font-bold text-primary/50">{(name || '?').charAt(0).toUpperCase()}</span>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[8vh] px-4" onClick={onClose}>
      <div
        className="w-[560px] bg-surface rounded-xl shadow-xl border border-border-default overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-5 pt-5 pb-3 border-b border-border-default">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Search size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold text-text-main">Tìm danh thiếp</h2>
                <p className="text-xs text-text-muted">Kết nối với người dùng và cửa hàng</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-text-light hover:text-text-body hover:bg-surface-muted rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* TABS */}
          <div className="flex gap-2">
            <button
              onClick={() => handleTabChange('people')}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                tab === 'people' ? 'bg-primary/10 text-primary shadow-sm' : 'text-text-muted hover:text-text-body hover:bg-surface-muted'
              }`}
            >
              <User size={15} /> Người dùng
            </button>
            <button
              onClick={() => handleTabChange('stores')}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                tab === 'stores' ? 'bg-primary/10 text-primary shadow-sm' : 'text-text-muted hover:text-text-body hover:bg-surface-muted'
              }`}
            >
              <Store size={15} /> Cửa hàng
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="px-5 pt-3 pb-2">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={
                tab === 'people'
                  ? 'Tìm theo tên, số điện thoại hoặc email...'
                  : 'Tìm theo tên cửa hàng hoặc số điện thoại...'
              }
              className="w-full bg-surface-muted border border-border-default rounded-lg pl-10 pr-9 py-2.5 text-sm
                         focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-text-light"
            />
            {loading ? (
              <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary animate-spin" />
            ) : q ? (
              <button onClick={() => { setQ(''); setResults([]); setHasSearched(false); inputRef.current?.focus(); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-light hover:text-text-body">
                <X size={16} />
              </button>
            ) : null}
          </div>
          {!q && (
            <p className="mt-2 text-xs text-text-muted text-center">
              {tab === 'people' ? 'Gợi ý: Nhập tên, SĐT (09xxx) hoặc email' : 'Gợi ý: Nhập tên cửa hàng hoặc SĐT'}
            </p>
          )}
        </div>

        {/* RESULTS */}
        <div className="max-h-[360px] overflow-y-auto border-t border-border-default">
          {/* LOADING */}
          {loading && q && (
            <div className="flex items-center justify-center gap-2 py-10 text-text-muted">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">Đang tìm...</span>
            </div>
          )}

          {/* RESULT COUNT */}
          {!loading && results.length > 0 && (
            <div className="px-5 py-2 bg-surface-muted border-b border-border-default">
              <p className="text-xs font-medium text-text-muted">
                {tab === 'people' ? 'Người dùng' : 'Cửa hàng'} · {results.length} kết quả
              </p>
            </div>
          )}

          {/* RESULTS LIST */}
          {!loading && results.map((r, idx) => {
            const isStoreItem = tab === 'stores' || !!r.storeId;
            const displayName = isStoreItem ? r.storeName : r.fullName;
            const displayAvatar = isStoreItem ? r.storeLogo : r.avatar;

            return (
              <div
                key={r.userId || r.storeId || idx}
                className="flex items-center gap-3 px-5 py-3 hover:bg-surface-muted transition-colors border-b border-border-default/50 last:border-b-0 group"
              >
                <Avatar
                  src={displayAvatar}
                  name={displayName}
                  isStore={isStoreItem}
                />
                <div className="flex-1 min-w-0">
                  {isStoreItem ? (
                    <>
                      <div className="text-sm font-semibold text-text-main truncate flex items-center gap-1.5">
                        <Store size={13} className="text-primary shrink-0" />
                        {displayName}
                      </div>
                      <div className="text-xs text-text-muted truncate mt-0.5">
                        {[tab === 'stores' ? r.storePhone : r.phone, tab === 'stores' ? r.storeAddress : null].filter(Boolean).join(' · ') || ''}
                      </div>
                      {r.fullName && <div className="text-[11px] text-text-muted/70 truncate mt-0.5">Chủ shop: {r.fullName}</div>}
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-semibold text-text-main truncate">{displayName}</div>
                      <div className="text-xs text-text-muted truncate mt-0.5">
                        {[r.phone, r.email].filter(Boolean).join(' · ') || ''}
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => handleContact(r.userId)}
                  disabled={!r.userId || contactingId === r.userId}
                  className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-primary to-primary/80 hover:from-primary-hover hover:to-primary disabled:opacity-50 shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all shrink-0 flex items-center gap-1.5 rounded-xl border border-primary/10"
                >
                  {contactingId === r.userId ? <Loader2 size={13} className="animate-spin" /> : <MessageCircle size={13} />}
                  Liên hệ
                </button>
              </div>
            );
          })}

          {/* EMPTY - searched but no results */}
          {!loading && q && results.length === 0 && hasSearched && (
            <div className="py-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-surface-muted border border-border-default flex items-center justify-center mb-3">
                <Search size={22} className="text-text-light" />
              </div>
              <p className="text-sm font-medium text-text-body">Không tìm thấy kết quả</p>
              <p className="text-xs text-text-muted mt-1">Thử thay đổi từ khóa hoặc chuyển tab</p>
            </div>
          )}

          {/* INITIAL - no search yet */}
          {!q && !loading && (
            <div className="py-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-surface-muted border border-border-default flex items-center justify-center mb-3">
                {tab === 'people' ? <User size={22} className="text-text-light" /> : <Store size={22} className="text-text-light" />}
              </div>
              <p className="text-sm text-text-muted">
                {tab === 'people' ? 'Nhập tên, SĐT hoặc email để tìm kiếm' : 'Nhập tên cửa hàng hoặc SĐT để tìm kiếm'}
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {(tab === 'people' ? ['Theo tên', 'Theo SĐT', 'Theo email'] : ['Theo tên cửa hàng', 'Theo SĐT']).map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-surface-muted border border-border-default rounded-full text-[11px] text-text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* TYPING - shows briefly when user types but debounce hasn't fired yet */}
          {!loading && q && results.length === 0 && !hasSearched && (
            <div className="py-8 text-center">
              <p className="text-sm text-text-muted">Đang nhập...</p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-5 py-2.5 border-t border-border-default bg-surface-muted/50">
          <p className="text-[11px] text-text-muted text-center">
            Kết quả tự động cập nhật khi bạn nhập
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactSearchModal;
