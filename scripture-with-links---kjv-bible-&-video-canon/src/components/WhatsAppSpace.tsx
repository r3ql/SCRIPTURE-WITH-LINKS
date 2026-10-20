import React, { useState, useRef, useEffect } from 'react';
import type { WhatsAppRoom, WhatsAppMessage, BibleVerse, VideoLink } from '../types/index.ts';
import {
  MessageSquare,
  X,
  Minus,
  Send,
  Smile,
  Paperclip,
  Mic,
  CheckCheck,
  Search,
  Phone,
  Video,
  MoreVertical,
  Pin,
  BookOpen,
  Youtube,
  Clock,
  Sparkles
} from 'lucide-react';

interface WhatsAppSpaceProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: WhatsAppRoom[];
  activeRoomId: string;
  onSelectRoom: (roomId: string) => void;
  messages: Record<string, WhatsAppMessage[]>;
  onSendMessage: (
    roomId: string,
    text: string,
    quoteVerse?: { reference: string; text: string },
    quoteVideo?: { title: string; youtubeId: string; timestampFormatted?: string }
  ) => void;
  onJumpToBibleVerse?: (bookId: string, chapter: number) => void;
  onOpenVideoById?: (videoId: string) => void;
  onOpenSpaceAdmin?: () => void;
  spaceName?: string;
  hostName?: string;
  isHostAdmin?: boolean;
}

export const WhatsAppSpace: React.FC<WhatsAppSpaceProps> = ({
  isOpen,
  onClose,
  rooms,
  activeRoomId,
  onSelectRoom,
  messages,
  onSendMessage,
  onJumpToBibleVerse,
  onOpenVideoById,
  onOpenSpaceAdmin,
  spaceName,
  hostName,
  isHostAdmin,
}) => {
  const [inputText, setInputText] = useState('');
  const [searchChat, setSearchChat] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [callNotice, setCallNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleFellowshipAudio = () => {
    setCallNotice('Scripture Fellowship Audio Room is active for all Berean members in this phone sanctuary.');
    setTimeout(() => setCallNotice(null), 3500);
  };

  const handleFellowshipVideo = () => {
    setCallNotice('Scripture Video Study Room is ready for connected Berean disciples.');
    setTimeout(() => setCallNotice(null), 3500);
  };

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];
  const activeRoomMessages = messages[activeRoom?.id] || [];

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeRoomMessages, activeRoomId, isOpen, isMinimized]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRoom) return;
    onSendMessage(activeRoom.id, inputText.trim());
    setInputText('');
    setShowAttachMenu(false);
  };

  const handleSimulateVoiceNote = () => {
    if (!activeRoom) return;
    onSendMessage(
      activeRoom.id,
      '🎙️ Voice Note (0:18): "Amen brother! Verse 16 connects directly with the tabernacle sacrifice."',
    );
  };

  const filteredRooms = rooms.filter((r) =>
    r.title.toLowerCase().includes(searchChat.toLowerCase()) ||
    r.subtitle.toLowerCase().includes(searchChat.toLowerCase())
  );

  return (
    <div
      className={`fixed z-50 transition-all duration-300 shadow-2xl overflow-hidden flex flex-col ${
        isMinimized
          ? 'bottom-4 right-4 w-72 h-14 rounded-2xl border border-emerald-700 bg-[#075E54] text-white'
          : 'bottom-0 right-0 sm:bottom-4 sm:right-4 w-full sm:w-[480px] md:w-[680px] h-[92vh] sm:h-[620px] sm:rounded-2xl border border-stone-300 bg-white'
      }`}
    >
      {/* WhatsApp Master Top Header Bar */}
      <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-emerald-600 border border-emerald-400 flex items-center justify-center font-bold text-sm overflow-hidden">
              {activeRoom?.avatar ? (
                <img src={activeRoom.avatar} alt={activeRoom.title} className="w-full h-full object-cover" />
              ) : (
                <span>SW</span>
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-300 rounded-full border-2 border-[#075E54]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm truncate max-w-[200px] sm:max-w-[280px]">
                {activeRoom?.title || 'Scripture Fellowship Space'}
              </span>
              <span className="text-[10px] bg-emerald-800 text-emerald-200 px-1 rounded">
                WA
              </span>
            </div>
            <p className="text-[11px] text-emerald-200 truncate">
              {isMinimized ? 'Tap to expand chat' : 'Active Theological Fellowship · Online'}
            </p>
          </div>
        </div>

        {/* WhatsApp Header Icons */}
        <div className="flex items-center gap-2">
          {!isMinimized && (
            <>
              <button
                onClick={handleFellowshipAudio}
                className="p-1.5 hover:bg-emerald-600/60 rounded-full transition-colors cursor-pointer"
                title="Fellowship Call"
              >
                <Phone className="w-4 h-4 text-emerald-100" />
              </button>
              <button
                onClick={handleFellowshipVideo}
                className="p-1.5 hover:bg-emerald-600/60 rounded-full transition-colors cursor-pointer"
                title="Video Conference"
              >
                <Video className="w-4 h-4 text-emerald-100" />
              </button>
              {onOpenSpaceAdmin && (
                <button
                  onClick={onOpenSpaceAdmin}
                  className="px-2 py-1 bg-emerald-800 hover:bg-emerald-700 text-amber-200 text-[11px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer border border-emerald-600/40"
                  title="Invite friends or manage space"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span className="hidden sm:inline">Space Invite</span>
                </button>
              )}
            </>
          )}

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-emerald-600/60 rounded-full transition-colors cursor-pointer"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            <Minus className="w-4 h-4 text-emerald-100" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-emerald-600/60 rounded-full transition-colors cursor-pointer"
            title="Close WhatsApp Space"
          >
            <X className="w-4 h-4 text-emerald-100" />
          </button>
        </div>
      </div>

      {callNotice && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-950 text-xs px-4 py-2 flex items-center justify-between animate-fadeIn shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{callNotice}</span>
          </div>
          <button
            onClick={() => setCallNotice(null)}
            className="text-amber-800 hover:text-amber-950 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Body (Split pane: Rooms List + Active Chat) */}
      {!isMinimized && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Pane: WhatsApp Chat Rooms List (hidden on small mobile unless toggling) */}
          <div className="hidden sm:flex flex-col w-52 md:w-64 border-r border-stone-200 bg-[#F0F2F5] shrink-0">
            {/* Search chats */}
            <div className="p-2 border-b border-stone-200 bg-white">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchChat}
                  onChange={(e) => setSearchChat(e.target.value)}
                  className="w-full text-xs pl-8 pr-2 py-1.5 bg-[#F0F2F5] border-0 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Room Items */}
            <div className="flex-1 overflow-y-auto">
              {filteredRooms.map((room) => {
                const isActive = room.id === activeRoom?.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => onSelectRoom(room.id)}
                    className={`w-full text-left p-3 flex items-start gap-2.5 border-b border-stone-100 hover:bg-stone-200/60 transition-colors cursor-pointer ${
                      isActive ? 'bg-[#E9EDEF]' : 'bg-white'
                    }`}
                  >
                    <div className="relative shrink-0 mt-0.5">
                      <img
                        src={room.avatar}
                        alt={room.title}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      {room.isPinned && (
                        <div className="absolute -bottom-1 -right-1 bg-stone-100 rounded-full p-0.5 border border-stone-300">
                          <Pin className="w-2.5 h-2.5 text-stone-500 fill-current" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-900 truncate">
                          {room.title}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {room.lastMessageTime || '10:42'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {room.lastMessage || room.subtitle}
                      </p>
                    </div>

                    {room.unreadCount > 0 && (
                      <span className="shrink-0 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1">
                        {room.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Pane: WhatsApp Conversation Canvas */}
          <div className="flex-1 flex flex-col bg-[#EFEAE2] relative">
            {/* WhatsApp authentic subtle background overlay */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(#128C7E 1px, transparent 1px)`,
                backgroundSize: '16px 16px',
              }}
            />

            {/* Room Info Pill Bar */}
            <div className="relative z-10 px-4 py-2 bg-white/80 backdrop-blur-xs border-b border-stone-200/60 flex items-center justify-between text-xs text-stone-600">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-stone-900">{activeRoom?.title}</span>
                {activeRoom?.targetReference && (
                  <span className="text-[11px] font-mono bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-medium">
                    {activeRoom.targetReference}
                  </span>
                )}
              </div>

              {/* Mobile room switcher quick select */}
              <div className="sm:hidden">
                <select
                  value={activeRoom?.id}
                  onChange={(e) => onSelectRoom(e.target.value)}
                  className="text-xs bg-stone-100 rounded px-2 py-1 font-medium"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-10">
              {/* Daily Security / Fellowship Notice */}
              <div className="text-center my-2">
                <span className="inline-block bg-[#FDF4C5]/80 text-[#54656F] text-[11px] px-3 py-1 rounded-lg shadow-2xs font-sans max-w-xs text-center border border-amber-200/50">
                  🔒 Messages in this theological study space are open for mutual edification and scripture cross-linking.
                </span>
              </div>

              {activeRoomMessages.map((msg) => {
                const isMe = msg.isMe;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-lg px-3 py-2 shadow-2xs text-xs relative ${
                        isMe
                          ? 'bg-[#E1FFC7] text-stone-900 rounded-tr-none'
                          : 'bg-white text-stone-900 rounded-tl-none border border-stone-200/60'
                      }`}
                    >
                      {/* Sender name for group chat if not me */}
                      {!isMe && (
                        <div className="text-[11px] font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
                          <span>{msg.senderName}</span>
                        </div>
                      )}

                      {/* Quoted Bible Verse if attached */}
                      {msg.quoteVerse && (
                        <div className="mb-2 p-2 bg-stone-50 border-l-4 border-amber-700 rounded text-[11px] text-stone-800 font-serif-reading italic">
                          <div className="font-sans font-bold text-amber-900 not-italic text-[10px] mb-0.5">
                            {msg.quoteVerse.reference} (KJV)
                          </div>
                          "{msg.quoteVerse.text}"
                        </div>
                      )}

                      {/* Quoted YouTube Video if attached */}
                      {msg.quoteVideo && (
                        <div className="mb-2 p-2 bg-stone-50 border-l-4 border-red-600 rounded text-[11px] text-stone-800">
                          <div className="font-bold text-red-700 text-[10px] flex items-center gap-1 mb-0.5">
                            <Youtube className="w-3 h-3 text-red-600" />
                            <span>Linked Exegesis Video</span>
                            {msg.quoteVideo.timestampFormatted && (
                              <span className="font-mono text-stone-600">
                                @{msg.quoteVideo.timestampFormatted}
                              </span>
                            )}
                          </div>
                          <div className="font-medium text-stone-900 truncate">
                            {msg.quoteVideo.title}
                          </div>
                        </div>
                      )}

                      {/* Message Content */}
                      <p className="whitespace-pre-wrap leading-relaxed text-stone-800 text-[13px] font-sans">
                        {msg.text}
                      </p>

                      {/* Timestamp & Read Receipt */}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-stone-400 font-mono">
                        <span>{msg.timestamp}</span>
                        {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Attachment Dropup Menu */}
            {showAttachMenu && (
              <div className="absolute bottom-16 left-4 z-20 bg-white border border-stone-200 rounded-xl shadow-xl p-2 w-56 space-y-1 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => {
                    setInputText(
                      (prev) => prev + ` [Quoting ${activeRoom?.targetReference || 'Scripture Reference'}] `
                    );
                    setShowAttachMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-100 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-800" />
                  <span>Insert Bible Verse Citation</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputText(
                      (prev) => prev + ` [Video Timestamp Insight @03:15] `
                    );
                    setShowAttachMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-100 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <Youtube className="w-3.5 h-3.5 text-red-600" />
                  <span>Attach Video Timestamp</span>
                </button>
              </div>
            )}

            {/* Bottom Input Area */}
            <form
              onSubmit={handleSend}
              className="p-2 sm:p-3 bg-[#F0F2F5] border-t border-stone-200 flex items-center gap-2 relative z-10"
            >
              <button
                type="button"
                onClick={() => setInputText((prev) => prev + ' 📖 ')}
                className="p-2 text-stone-600 hover:text-stone-900 rounded-full transition-colors cursor-pointer"
                title="Add Scripture Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  showAttachMenu ? 'bg-stone-300 text-stone-900' : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Attach scripture quote or video timestamp"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                type="text"
                placeholder="Type fellowship reflection or exegesis..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 text-sm px-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 placeholder:text-stone-400"
              />

              {inputText.trim() ? (
                <button
                  type="submit"
                  className="p-2.5 bg-[#00A884] hover:bg-[#008f6f] text-white rounded-full transition-colors cursor-pointer shadow-xs"
                  title="Send message"
                >
                  <Send className="w-4 h-4 fill-current ml-0.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSimulateVoiceNote}
                  className="p-2 text-stone-600 hover:text-emerald-700 rounded-full transition-colors cursor-pointer"
                  title="Record voice note"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
