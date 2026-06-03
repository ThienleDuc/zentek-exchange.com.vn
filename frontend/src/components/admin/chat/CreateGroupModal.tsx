import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Users } from 'lucide-react';
import { userAdminService, type User } from '../../../services/userAdmin.service';
import { chatAdminService } from '../../../services/chatAdmin.service';
import { getUserAvatarUrl } from '../../../utils/image.utils';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setGroupName('');
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUsers([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await userAdminService.getUsers(1, 10, searchQuery);
        // Lọc ra những user chưa được chọn
        const filtered = response.data.filter(
          (u: User) => !selectedUsers.some(selected => selected.id === u.id)
        );
        setSearchResults(filtered);
      } catch (error) {
        console.error('Lỗi tìm kiếm người dùng:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(fetchUsers, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedUsers]);

  const handleSelectUser = (user: User) => {
    setSelectedUsers(prev => [...prev, user]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;

    setIsCreating(true);
    try {
      await chatAdminService.createGroup(groupName, selectedUsers.map(u => u.id));
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Lỗi tạo nhóm:', error);
      alert('Có lỗi xảy ra khi tạo nhóm!');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Tạo nhóm mới
          </h3>
          <button onClick={onClose} className="p-2 text-text-muted hover:bg-surface rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Tên nhóm */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-main">Tên nhóm</label>
            <input
              type="text"
              placeholder="Nhập tên nhóm..."
              className="w-full bg-surface border border-border-default rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {/* Tìm kiếm */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-main">Thêm thành viên</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Tìm theo tên, email, sđt..."
                className="w-full bg-surface border border-border-default rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Kết quả tìm kiếm */}
            {searchQuery.trim() && (
              <div className="mt-2 bg-surface border border-border-default rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-text-muted">Đang tìm kiếm...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-text-muted">Không tìm thấy ai</div>
                ) : (
                  searchResults.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 border-b border-border-default/50 hover:bg-background cursor-pointer" onClick={() => handleSelectUser(user)}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {user.avatar ? <img src={getUserAvatarUrl(user.avatar)} alt="a" className="w-full h-full rounded-full object-cover"/> : user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-main">{user.fullName}</p>
                          <p className="text-xs text-text-muted">{user.phone || user.email}</p>
                        </div>
                      </div>
                      <button className="text-primary hover:bg-primary/10 p-1.5 rounded-full"><Plus className="w-4 h-4" /></button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Thành viên đã chọn */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-text-main">Đã chọn ({selectedUsers.length})</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-xs font-medium">
                    {user.fullName}
                    <button onClick={() => handleRemoveUser(user.id)} className="hover:text-danger hover:bg-danger/10 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-default bg-surface flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-main hover:bg-background border border-border-default rounded-xl transition-colors">
            Hủy
          </button>
          <button 
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || isCreating}
            className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? 'Đang tạo...' : 'Tạo nhóm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
