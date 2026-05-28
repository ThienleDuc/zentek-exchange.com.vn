import React, { useState } from 'react';
import { Search, Send, Image, Smile, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';

const BuyerChatPage: React.FC = () => {
  const [activeChat, setActiveChat] = useState<number>(1);
  const [message, setMessage] = useState('');

  // Dummy data
  const conversations = [
    { id: 1, name: 'Shop Giày Thể Thao Nam', avatar: 'https://i.pravatar.cc/150?u=1', lastMessage: 'Cảm ơn bạn đã đặt hàng!', time: '10:45', unread: 2 },
    { id: 2, name: 'Thời Trang Nữ Zenda', avatar: 'https://i.pravatar.cc/150?u=2', lastMessage: 'Sản phẩm này còn size M không shop?', time: 'Hôm qua', unread: 0 },
    { id: 3, name: 'Phụ kiện điện thoại Vui', avatar: 'https://i.pravatar.cc/150?u=3', lastMessage: 'Dạ shop đã gửi hàng rồi ạ.', time: 'T2', unread: 0 },
  ];

  return (
    <>
      {/* Left Sidebar: Conversations List */}
      <div className="w-[300px] border-r border-gray-200 flex flex-col bg-white shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Tin nhắn</h2>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-transparent focus:border-primary focus:bg-white focus:outline-none rounded-lg text-sm transition-colors"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map(chat => (
            <div 
              key={chat.id} 
              onClick={() => setActiveChat(chat.id)}
              className={`flex items-start gap-3 p-4 cursor-pointer transition-colors border-b border-gray-50 ${activeChat === chat.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
            >
              <div className="relative">
                <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                {chat.unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {chat.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className={`font-semibold text-sm truncate ${activeChat === chat.id ? 'text-primary' : 'text-gray-800'}`}>{chat.name}</h3>
                  <span className="text-xs text-gray-400 ml-2 shrink-0">{chat.time}</span>
                </div>
                <p className={`text-sm truncate ${chat.unread > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                  {chat.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Chat Header */}
        <div className="h-16 px-6 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img src={conversations.find(c => c.id === activeChat)?.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h3 className="font-semibold text-gray-800">{conversations.find(c => c.id === activeChat)?.name}</h3>
              <span className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Đang hoạt động
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <button className="hover:text-primary transition-colors"><Phone size={20} /></button>
            <button className="hover:text-primary transition-colors"><Video size={20} /></button>
            <div className="w-px h-6 bg-gray-200"></div>
            <button className="hover:text-primary transition-colors"><MoreVertical size={20} /></button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          <div className="flex justify-center">
            <span className="text-xs text-gray-400 bg-gray-200 px-3 py-1 rounded-full">Hôm nay</span>
          </div>
          
          <div className="flex items-end gap-2">
            <img src={conversations.find(c => c.id === activeChat)?.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
            <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm max-w-[70%] border border-gray-100">
              <p className="text-gray-800 text-sm">Chào bạn, sản phẩm này hiện đang có sẵn hàng tại shop nhé!</p>
              <span className="text-[10px] text-gray-400 block mt-1">10:44</span>
            </div>
          </div>

          <div className="flex items-end gap-2 flex-row-reverse">
            <div className="bg-primary text-white px-4 py-2.5 rounded-2xl rounded-br-sm shadow-sm max-w-[70%]">
              <p className="text-sm">Mình muốn đặt 1 đôi size 42, giao đến Hà Nội mất bao lâu ạ?</p>
              <span className="text-[10px] text-primary-100 block mt-1 text-right">10:45</span>
            </div>
          </div>
          
          <div className="flex items-end gap-2">
            <img src={conversations.find(c => c.id === activeChat)?.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
            <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm max-w-[70%] border border-gray-100">
              <p className="text-gray-800 text-sm">Dạ, giao đến Hà Nội tầm 2-3 ngày là tới ạ. Cảm ơn bạn đã đặt hàng!</p>
              <span className="text-[10px] text-gray-400 block mt-1">10:45</span>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-primary transition-colors"><Paperclip size={20} /></button>
            <button className="text-gray-400 hover:text-primary transition-colors"><Image size={20} /></button>
            <button className="text-gray-400 hover:text-primary transition-colors"><Smile size={20} /></button>
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập tin nhắn..." 
                className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-transparent focus:border-primary focus:bg-white focus:outline-none rounded-full text-sm transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && message.trim()) {
                    setMessage('');
                  }
                }}
              />
              <button 
                className={`absolute right-2 top-1.5 p-1.5 rounded-full transition-colors ${message.trim() ? 'bg-primary text-white hover:bg-primary-hover' : 'text-gray-400'}`}
                disabled={!message.trim()}
                onClick={() => setMessage('')}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BuyerChatPage;
