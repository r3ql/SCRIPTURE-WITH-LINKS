import React, { useState } from 'react';
import type { SanctuarySpace, SpaceMember, UserProfile, VideoLink } from '../types/index.ts';
import { generateSpaceInviteToken } from '../utils/sanctuaryStorage.ts';
import {
  X,
  Crown,
  Users,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  UserPlus,
  MessageSquare,
  Sparkles,
  Lock,
  Globe,
  Trash2,
  UserCheck
} from 'lucide-react';

interface SpaceAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: SanctuarySpace;
  userProfile: UserProfile;
  videoLinks?: VideoLink[];
  onUpdateSpace: (updated: SanctuarySpace) => void;
  onAddMember: (member: SpaceMember) => void;
  onRemoveMember: (memberId: string) => void;
  onOpenWhatsApp: () => void;
}

export const SpaceAdminModal: React.FC<SpaceAdminModalProps> = ({
  isOpen,
  onClose,
  space,
  userProfile,
  videoLinks = [],
  onUpdateSpace,
  onAddMember,
  onRemoveMember,
  onOpenWhatsApp,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedSync, setCopiedSync] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'contributor' | 'berean'>('contributor');
  const [spaceNameInput, setSpaceNameInput] = useState(space.name);
  const [isEditingSpace, setIsEditingSpace] = useState(false);

  if (!isOpen) return null;

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?spaceCode=${space.code}&host=${encodeURIComponent(userProfile.name)}`
    : `https://scripture-with-links.app/?spaceCode=${space.code}`;

  const syncToken = generateSpaceInviteToken(space, userProfile, videoLinks);
  const syncInviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?inviteToken=${syncToken}`
    : `https://scripture-with-links.app/?inviteToken=${syncToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopySyncLink = () => {
    navigator.clipboard.writeText(syncInviteUrl);
    setCopiedSync(true);
    setTimeout(() => setCopiedSync(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const shareText = `🕊️ You are invited to join my personal study space on "SCRIPTURE WITH LINKS"!\n\nRoom: ${space.name}\nHost: ${userProfile.name}\nPasscode: ${space.code}\n\nJoin link: ${syncInviteUrl}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newMem: SpaceMember = {
      id: `mem-${Date.now()}`,
      name: newMemberName.trim(),
      handle: `@${newMemberName.trim().toLowerCase().replace(/\s+/g, '_')}`,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=100&h=100&fit=crop&crop=faces`,
      role: newMemberRole,
      joinedAt: 'Just now',
      status: 'active',
      canUploadLinks: newMemberRole === 'contributor',
      canUploadChats: true,
    };

    onAddMember(newMem);
    setNewMemberName('');
    setShowAddMember(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#075E54] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700/80 border border-emerald-400 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-display-sacred text-lg font-bold tracking-wide">
                Sanctuary Sovereign &amp; Space Administration
              </h2>
              <p className="text-xs text-emerald-100 font-sans">
                You are the Administrator and Sovereign Owner of this local phone installation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Sovereign Status Badge */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Instance Owner: {userProfile.name}</span>
                <span className="bg-emerald-200 text-emerald-900 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                  ADMINISTRATOR
                </span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed font-sans">
                You have downloaded and initialized this instance. Anyone you invite joins as a registered participant in your personal sanctuary, letting you curate the video links, theology taxonomy, and study rooms.
              </p>
            </div>
          </div>

          {/* Space Name & Customization */}
          <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 uppercase font-mono">Sanctuary Space Name</span>
              {!isEditingSpace ? (
                <button
                  type="button"
                  onClick={() => setIsEditingSpace(true)}
                  className="text-xs text-emerald-800 hover:underline font-semibold cursor-pointer"
                >
                  Rename Space
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (spaceNameInput.trim()) {
                        onUpdateSpace({ ...space, name: spaceNameInput.trim() });
                      }
                      setIsEditingSpace(false);
                    }}
                    className="text-xs text-emerald-800 font-bold hover:underline cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSpaceNameInput(space.name);
                      setIsEditingSpace(false);
                    }}
                    className="text-xs text-stone-500 hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {!isEditingSpace ? (
              <p className="font-semibold text-sm text-stone-900">{space.name}</p>
            ) : (
              <input
                type="text"
                value={spaceNameInput}
                onChange={(e) => setSpaceNameInput(e.target.value)}
                className="w-full text-xs px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            )}
          </div>

          {/* Invitation Link Generator */}
          <div className="space-y-4">
            {/* Primary: Full Developed Version Instant Sync Link */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 uppercase font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Developed Version Peer Link (Includes Curated Canon)</span>
                </span>
                <span className="text-[10px] font-mono bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                  {videoLinks.length} links synced
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 font-sans">
                Sends a link that automatically opens your exact developed space, your curated video canon, and fellowship rooms on their phone!
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={syncInviteUrl}
                  className="flex-1 text-[11px] px-3 py-2 bg-white border border-emerald-200 rounded-lg font-mono text-stone-600 truncate select-all"
                />
                <button
                  type="button"
                  onClick={handleCopySyncLink}
                  className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-xs"
                >
                  {copiedSync ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSync ? 'Copied' : 'Copy Sync Link'}</span>
                </button>
              </div>
            </div>

            {/* Secondary: Standard Space Passcode & Link */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide font-mono flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Space Code &amp; Quick Link</span>
                </h3>
                <span className="text-[11px] font-mono text-stone-500">
                  Passcode: <strong className="text-stone-900 font-mono">{space.code}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="flex-1 text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg font-mono text-stone-600 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Direct WhatsApp Share Action */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex-1 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Send WhatsApp Invitation to Fellowship</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenWhatsApp();
                  onClose();
                }}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Open WhatsApp Space
              </button>
            </div>
          </div>

          {/* Members Roster */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide font-mono flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Space Members &amp; Fellowship Roster ({space.members.length})</span>
              </h3>

              <button
                type="button"
                onClick={() => setShowAddMember(!showAddMember)}
                className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Participant</span>
              </button>
            </div>

            {/* Add member form inline */}
            {showAddMember && (
              <form onSubmit={handleCreateMember} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-3 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Member Name / Pseudonym
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Deacon Silas, Mary of Bethany"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      required
                      className="w-full text-xs px-3 py-1.5 bg-white border border-stone-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Space Role
                    </label>
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value as any)}
                      className="w-full text-xs px-3 py-1.5 bg-white border border-stone-200 rounded-lg"
                    >
                      <option value="contributor">Contributor (Can upload links &amp; start rooms)</option>
                      <option value="berean">Berean Reader (Can read &amp; comment)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMember(false)}
                    className="px-3 py-1 text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Add to Space
                  </button>
                </div>
              </form>
            )}

            {/* Member list */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {space.members.map((mem) => {
                const isHost = mem.role === 'admin';
                return (
                  <div
                    key={mem.id}
                    className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={mem.avatar}
                        alt={mem.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900 truncate">
                            {mem.name}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                              isHost
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {mem.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          {mem.handle} · Joined {mem.joinedAt}
                        </p>
                      </div>
                    </div>

                    {!isHost && (
                      <button
                        type="button"
                        onClick={() => onRemoveMember(mem.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 transition cursor-pointer"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
