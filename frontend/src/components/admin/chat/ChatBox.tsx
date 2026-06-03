import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, MoreVertical, Loader2, Info, MoreHorizontal, Trash2, CheckCheck, MessageCircle } from 'lucide-react';
import dayjs from 'dayjs';
import { type Conversation, type ChatMessage } from '../../../services/chatAdmin.service';
import ShareLinkModal from './ShareLinkModal';
import AddMemberModal from './AddMemberModal';
import ContactCardModal from './ContactCardModal';
import { userService } from '../../../services/user.service';
import { getUserFromStorage, isAdmin, isSeller } from '../../../utils/role.utils';
import { getUserAvatarUrl, getMediaUrl } from '../../../utils/image.utils';

interface ChatBoxProps {
  activeConversation: Conversation | null;
  messages: ChatMessage[];
  onSendMessage: (content: string, files?: File[]) => void;
  onRecallMessage: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onDeleteGroup?: (groupId: string) => void;
  onOpenConversation?: (conversationId: string) => void;
  isLoading: boolean;
}

const ChatBox = ({ activeConversation, messages, onSendMessage, onRecallMessage, onDeleteMessage, onDeleteGroup, onOpenConversation, isLoading }: ChatBoxProps) => {
  const currentUser = getUserFromStorage();
  const [inputValue, setInputValue] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showHiddenMessages, setShowHiddenMessages] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [showMessageMenuId, setShowMessageMenuId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactUser, setContactUser] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenContactCard = async (senderId: string, senderName: string, senderAvatar?: string | null) => {
    try {
      const res = await userService.getUserById(senderId);
      const userData = res.data || {};
      setContactUser({
        userId: userData.userId || senderId,
        fullName: userData.fullName || senderName,
        avatar: userData.avatar || senderAvatar,
        phone: userData.phone || null,
        email: userData.email || null,
        roleName: userData.roleName || null,
        createdAt: userData.createdAt || null,
        storeName: userData.storeName || null,
        storeLogo: userData.storeLogo || null
      });
      setIsContactModalOpen(true);
    } catch (e) {
      setContactUser({ userId: senderId, fullName: senderName, avatar: senderAvatar });
      setIsContactModalOpen(true);
    }
  };

  const handleShareLink = () => {
    setIsShareModalOpen(true);
    setShowHeaderMenu(false);
  };

  const handleAddMember = () => {
    setIsAddMemberModalOpen(true);
    setShowHeaderMenu(false);
  };

  const handleDeleteGroupClick = () => {
    if (!activeConversation || !onDeleteGroup) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhóm "${activeConversation.name}" không? Hành động này không thể hoàn tác.`)) {
      onDeleteGroup(activeConversation.id);
      setShowHeaderMenu(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() || selectedFiles.length > 0) {
      onSendMessage(inputValue, selectedFiles);
      setInputValue('');
      setSelectedFiles([]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles].slice(0, 5)); // Tối đa 5 file
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 bg-background flex flex-col items-center justify-center text-text-muted">
        <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-4 border border-border-default shadow-sm">
          <MessageCircle className="w-10 h-10 text-border-default" />
        </div>
        <p className="text-lg font-medium text-text-main">Chưa chọn cuộc trò chuyện</p>
        <p className="text-sm mt-1">Hãy chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background h-full relative">
      {/* Header */}
      <div className="h-16 border-b border-border-default bg-surface px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-background border border-border-default flex items-center justify-center">
            {activeConversation.avatar ? (
              <img src={getUserAvatarUrl(activeConversation.avatar)} alt={activeConversation.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="font-bold text-text-muted">{activeConversation.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <h2 className="font-bold text-text-main leading-tight">{activeConversation.name}</h2>
            <p className="text-xs text-text-muted">
              {activeConversation.type === 'group' ? 'Nhóm trò chuyện' : 'Hoạt động gần đây'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-text-muted relative">
          <button className="p-2 hover:bg-surface-hover rounded-full transition-colors"><Info size={20} /></button>
          <button 
            className="p-2 hover:bg-surface-hover rounded-full transition-colors"
            onClick={() => setShowHeaderMenu(!showHeaderMenu)}
          >
            <MoreVertical size={20} />
          </button>
          {showHeaderMenu && (
            <div className="absolute top-12 right-0 bg-surface border border-border-default shadow-lg rounded-xl w-56 z-50 overflow-hidden">
              {isAdmin(currentUser) && (
                <button 
                  className="w-full text-left px-4 py-3 text-sm hover:bg-background transition-colors flex items-center justify-between"
                  onClick={() => {
                    setShowHiddenMessages(!showHiddenMessages);
                    setShowHeaderMenu(false);
                  }}
                >
                  <span>Hiển thị tin nhắn đã ẩn</span>
                  <div className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors border ${showHiddenMessages ? 'bg-primary border-primary' : 'bg-surface-hover border-border-default'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${showHiddenMessages ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </button>
              )}
              
              {activeConversation.type === 'group' && (
                <>
                  <div className="border-t border-border-default my-1"></div>
                  {(isAdmin(currentUser) || isSeller(currentUser)) && (
                    <button 
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-background transition-colors text-text-main font-medium"
                      onClick={handleAddMember}
                    >
                      Thêm thành viên
                    </button>
                  )}
                  <button 
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-background transition-colors text-text-main font-medium"
                    onClick={handleShareLink}
                  >
                    Chia sẻ link tham gia
                  </button>
                  {(isAdmin(currentUser) || isSeller(currentUser)) && (
                    <button 
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-background transition-colors text-red-500 font-medium"
                      onClick={handleDeleteGroupClick}
                    >
                      Xóa nhóm
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-full text-text-muted">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-text-muted text-sm">
            Chưa có tin nhắn nào. Bắt đầu trò chuyện!
          </div>
        ) : (
          messages.map((msg, index) => {
            const showTime = index === 0 || dayjs(msg.timestamp).diff(dayjs(messages[index - 1].timestamp), 'minute') > 30;
            const canRecall = msg.isMe && dayjs().diff(dayjs(msg.timestamp), 'hour') < 24 && !msg.isRecalled;
            const canDelete = isAdmin(currentUser); // Chỉ Admin mới được xóa vĩnh viễn

            return (
              <div key={msg.id} className="flex flex-col">
                {showTime && (
                  <div className="flex justify-center mb-4 mt-2">
                    <span className="text-[10px] font-medium bg-surface px-2 py-1 rounded-full text-text-muted shadow-sm">
                      {dayjs(msg.timestamp).format('HH:mm - DD/MM/YYYY')}
                    </span>
                  </div>
                )}
                <div 
                  className={`flex items-end gap-2 max-w-[75%] relative ${msg.isMe ? 'self-end flex-row-reverse' : 'self-start'}`}
                  onMouseEnter={() => setHoveredMessageId(msg.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  {!msg.isMe && (
                    <div className="w-8 h-8 rounded-full bg-surface shrink-0 border border-border-default flex items-center justify-center overflow-hidden">
                      {msg.senderAvatar ? (
                        <img 
                          src={getUserAvatarUrl(msg.senderAvatar)} 
                          alt={msg.senderName} 
                          className="w-full h-full object-cover cursor-pointer" 
                          onClick={() => handleOpenContactCard(msg.senderId, msg.senderName, msg.senderAvatar)}
                        />
                      ) : (
                        <span
                          onClick={() => handleOpenContactCard(msg.senderId, msg.senderName, null)}
                          className="text-xs font-bold text-text-muted cursor-pointer hover:text-primary transition-colors"
                        >
                          {msg.senderName.charAt(0)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message Actions */}
                  {hoveredMessageId === msg.id && (canRecall || canDelete) && (
                    <div className={`absolute top-1/2 -translate-y-1/2 ${msg.isMe ? 'right-full pr-2' : 'left-full pl-2'} z-10`}>
                      <button 
                        className="p-1 text-text-muted hover:text-text-main hover:bg-surface rounded-full transition-colors"
                        onClick={() => setShowMessageMenuId(showMessageMenuId === msg.id ? null : msg.id)}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {showMessageMenuId === msg.id && (
                        <div className={`absolute top-6 bg-surface border border-border-default shadow-lg rounded-lg w-40 overflow-hidden z-50 ${msg.isMe ? 'right-0' : 'left-0'}`}>
                          {canRecall && (
                            <button 
                              className="w-full text-left px-3 py-2 text-sm text-yellow-600 hover:bg-background transition-colors flex items-center gap-2"
                              onClick={() => {
                                onRecallMessage(msg.id);
                                setShowMessageMenuId(null);
                              }}
                            >
                              <Info size={14} /> Thu hồi tin nhắn
                            </button>
                          )}
                          {canDelete && (
                            <button 
                              className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-background transition-colors flex items-center gap-2"
                              onClick={() => {
                                if (confirm('Bạn có chắc chắn muốn xóa hoàn toàn tin nhắn này khỏi hệ thống?')) {
                                  onDeleteMessage(msg.id);
                                }
                                setShowMessageMenuId(null);
                              }}
                            >
                              <Trash2 size={14} /> Xóa hoàn toàn
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                    {!msg.isMe && (
                      <div className="flex items-center gap-1 mb-1 ml-1">
                        <span 
                          className="text-[11px] font-semibold text-text-main cursor-pointer hover:text-primary hover:underline transition-colors"
                          onClick={() => handleOpenContactCard(msg.senderId, msg.senderName, msg.senderAvatar)}
                        >
                          {msg.senderName}
                        </span>
                        {activeConversation.type === 'group' && msg.senderRole && (
                          <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">
                            {msg.senderRole === 'chu_nhom' ? 'Chủ nhóm' : 'Thành viên'}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {msg.isRecalled && !showHiddenMessages ? (
                      <div className={`px-4 py-2.5 rounded-2xl text-sm italic text-gray-500 bg-white border border-gray-300 shadow-sm ${msg.isMe ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                        Tin nhắn đã được thu hồi
                      </div>
                    ) : (
                      <div className={msg.isRecalled && showHiddenMessages ? "opacity-60 grayscale" : ""}>
                        {msg.isRecalled && showHiddenMessages && (
                          <div className={`text-[10px] font-medium text-red-500 italic mb-1 ${msg.isMe ? 'text-right' : 'text-left'}`}>
                            [Đã thu hồi]
                          </div>
                        )}
                        <div className="flex flex-col gap-1">
                          {msg.content && (
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm ${
                                msg.isMe 
                                  ? 'bg-primary text-white rounded-br-sm shadow-md shadow-primary/20' 
                                  : 'bg-surface text-text-main rounded-bl-sm border border-border-default shadow-sm'
                              } ${msg.media && msg.media.length > 0 ? 'mb-2' : ''}`}
                            >
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            </div>
                          )}

                          {msg.media && msg.media.length > 0 && (
                            <div className={`flex flex-wrap gap-2 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                              {msg.media.map((m, i) => {
                                const mediaUrl = getMediaUrl(m.url);
                                
                                return m.type === 'image' ? (
                                  <img key={i} src={mediaUrl} alt="media" className="max-w-[200px] max-h-[200px] rounded-xl object-cover cursor-pointer hover:opacity-90 shadow-sm border border-border-default" />
                                ) : (
                                  <video key={i} src={mediaUrl} controls className="max-w-[200px] max-h-[200px] rounded-xl bg-black shadow-sm border border-border-default" />
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Read status for my messages */}
                    {msg.isMe && !msg.isRecalled && (
                      <div className="flex items-center gap-1 mt-1 mr-1 text-[10px] text-text-muted">
                        <span>{dayjs(msg.timestamp).format('HH:mm')}</span>
                        {msg.isRead && (
                          <span className="flex items-center gap-0.5 text-primary">
                            <CheckCheck size={12} /> Đã xem
                          </span>
                        )}
                      </div>
                    )}
                    {!msg.isMe && (
                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[10px] text-text-muted">{dayjs(msg.timestamp).format('HH:mm')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface border-t border-border-default shrink-0">
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedFiles.map((file, i) => (
              <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden bg-background border border-border-default">
                {file.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-text-muted bg-surface">Video</div>
                )}
                <button 
                  onClick={() => removeFile(i)}
                  className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl-md hover:bg-black/70"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <div className="flex gap-1 mb-1 text-text-muted">
            <input 
              type="file" 
              multiple 
              accept="image/*,video/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-background rounded-full transition-colors"
              title="Đính kèm ảnh/video"
            >
              <ImageIcon size={20} />
            </button>
          </div>
          <div className="flex-1 bg-background rounded-xl border border-border-default focus-within:border-primary focus-within:shadow-sm focus-within:shadow-primary/10 transition-all flex items-end">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              className="w-full bg-transparent p-3 max-h-32 min-h-[44px] text-sm resize-none focus:outline-none scrollbar-hide"
              rows={1}
              style={{
                height: 'auto',
                minHeight: '44px'
              }}
            />
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim() && selectedFiles.length === 0}
              className="p-3 bg-primary text-white rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} className={inputValue.trim() || selectedFiles.length > 0 ? "ml-1" : ""} />
            </button>
          </div>
        </div>
      </div>

      <ShareLinkModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        link={activeConversation ? `${window.location.origin}/join-group/${activeConversation.id}` : ''} 
      />

      {activeConversation?.type === 'group' && (
        <AddMemberModal 
          isOpen={isAddMemberModalOpen} 
          onClose={() => setIsAddMemberModalOpen(false)} 
          groupId={activeConversation.id} 
          onSuccess={() => {
            alert('Đã thêm thành viên thành công!');
          }} 
        />
      )}

      <ContactCardModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        user={contactUser}
        onContactCreated={(convId) => {
          if (onOpenConversation) onOpenConversation(convId);
        }}
      />
    </div>
  );
};


export default ChatBox;
