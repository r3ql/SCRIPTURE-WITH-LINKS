import React, { useState } from 'react';
import type { AuthMode, UserProfile } from '../types/index.ts';
import {
  X,
  UserCheck,
  ShieldCheck,
  KeyRound,
  Crown,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  Phone,
  Check
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: AuthMode;
  userProfile: UserProfile;
  onSelectMode: (mode: AuthMode, updatedProfile?: Partial<UserProfile>, spaceCodeToJoin?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  userProfile,
  onSelectMode,
}) => {
  const [selectedTab, setSelectedTab] = useState<AuthMode>(currentMode);
  const [adminName, setAdminName] = useState(userProfile.name || 'Sanctuary Sovereign');
  const [adminHandle, setAdminHandle] = useState(userProfile.handle || '@sanctuary_admin');
  const [spaceName, setSpaceName] = useState(userProfile.spaceName || 'My Berean Fellowship Space');
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');

  if (!isOpen) return null;

  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectMode('admin', {
      name: adminName.trim(),
      handle: adminHandle.trim(),
      spaceName: spaceName.trim(),
      role: 'admin',
      isOwner: true,
    });
    onClose();
  };

  const handleJoinSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    onSelectMode('member', {
      name: joinName.trim() || 'Visiting Berean',
      handle: `@${(joinName.trim() || 'berean').toLowerCase().replace(/\s+/g, '_')}`,
      role: 'berean',
      isOwner: false,
    }, joinCode.trim().toUpperCase());
    onClose();
  };

  const handleChooseGuest = () => {
    onSelectMode('guest', {
      name: 'Pilgrim Guest',
      handle: '@guest_berean',
      role: 'guest',
      isOwner: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display-sacred text-lg font-bold tracking-wide">
                Account &amp; Phone Space Mode
              </h2>
              <p className="text-xs text-stone-300 font-sans">
                Choose to explore without signing in, or administer your personal phone sanctuary
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Mode Selection Cards */}
        <div className="grid grid-cols-3 border-b border-stone-200 bg-stone-50 p-3 gap-2">
          <button
            type="button"
            onClick={() => setSelectedTab('guest')}
            className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
              selectedTab === 'guest'
                ? 'border-amber-800 bg-white shadow-xs'
                : 'border-transparent hover:bg-stone-200/60 text-stone-600'
            }`}
          >
            <Compass className="w-4 h-4 mx-auto text-amber-800 mb-1" />
            <div className="font-bold text-xs text-stone-900">Guest Pilgrim</div>
            <div className="text-[10px] text-stone-500">No Sign In Needed</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('admin')}
            className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
              selectedTab === 'admin'
                ? 'border-emerald-700 bg-white shadow-xs'
                : 'border-transparent hover:bg-stone-200/60 text-stone-600'
            }`}
          >
            <Crown className="w-4 h-4 mx-auto text-emerald-700 mb-1" />
            <div className="font-bold text-xs text-stone-900">Administrator</div>
            <div className="text-[10px] text-stone-500">Owner of This Phone</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('member')}
            className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
              selectedTab === 'member'
                ? 'border-blue-700 bg-white shadow-xs'
                : 'border-transparent hover:bg-stone-200/60 text-stone-600'
            }`}
          >
            <Users className="w-4 h-4 mx-auto text-blue-700 mb-1" />
            <div className="font-bold text-xs text-stone-900">Join Space</div>
            <div className="text-[10px] text-stone-500">Via Invite Code</div>
          </button>
        </div>

        {/* Tab Form */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: GUEST PILGRIM */}
          {selectedTab === 'guest' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-800" />
                  <span>Explore Freely with Zero Account Sign-in</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-sans">
                  The entire package is available to you right out of the box with zero subscriptions, zero sign-ups, and zero data harvesting. All your bookmarks, reading progress, and notes stay 100% on this phone.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleChooseGuest}
                  className="w-full py-2.5 bg-amber-900 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Continue Exploring as Guest Pilgrim</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ADMINISTRATOR / SOVEREIGN OWNER */}
          {selectedTab === 'admin' && (
            <form onSubmit={handleSaveAdmin} className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-950">
                  <Crown className="w-4 h-4 text-emerald-700" />
                  <span>Sovereign Instance Administrator</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed font-sans">
                  As the owner and developer of this downloaded instance, you control the video uploads, conversation transcripts, and invite links.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Administrator Display Name
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Handle / Pseudonym
                </label>
                <input
                  type="text"
                  value={adminHandle}
                  onChange={(e) => setAdminHandle(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Sanctuary Space Name
                </label>
                <input
                  type="text"
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Save Administrator Profile &amp; Activate Space</span>
                <Check className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: JOIN AN EXISTING SPACE */}
          {selectedTab === 'member' && (
            <form onSubmit={handleJoinSpace} className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs text-blue-950">
                  <Users className="w-4 h-4 text-blue-700" />
                  <span>Join a Brother or Sister&apos;s Sanctuary Space</span>
                </div>
                <p className="text-xs text-blue-900 leading-relaxed font-sans">
                  Enter the invitation code received from an administrator to link into their theological space and discussions.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Your Name / Pseudonym
                </label>
                <input
                  type="text"
                  placeholder="e.g. Silas of Berea"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Space Invitation Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. BEREAN-7749"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg font-mono uppercase focus:outline-none focus:ring-1 focus:ring-blue-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Connect &amp; Enter Space</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
