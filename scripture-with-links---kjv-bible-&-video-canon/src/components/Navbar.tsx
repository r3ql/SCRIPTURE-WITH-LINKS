import React from 'react';
import type { UserProfile, AuthMode } from '../types/index.ts';
import { PWAInstallButton } from './PWAInstallButton.tsx';
import {
  BookOpen,
  Film,
  Network,
  MessageSquare,
  PlusCircle,
  Layers,
  BarChart3,
  Users,
  Compass,
  Upload,
  Crown,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

export type NavTab = 'bible' | 'map' | 'topics' | 'archive' | 'density' | 'analytics' | 'fellowship' | 'pilgrims';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenPostModal: () => void;
  onOpenUploadModal: () => void;
  onOpenSpaceAdminModal: () => void;
  onOpenAuthModal: () => void;
  onToggleWhatsApp: () => void;
  isWhatsAppOpen: boolean;
  totalLinksCount: number;
  userProfile: UserProfile;
  authMode: AuthMode;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenPostModal,
  onOpenUploadModal,
  onOpenSpaceAdminModal,
  onOpenAuthModal,
  onToggleWhatsApp,
  isWhatsAppOpen,
  totalLinksCount,
  userProfile,
  authMode,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 lg:gap-4 h-16">
          {/* Zone 1: Single text element wordmark "SCRIPTURE WITH LINKS" */}
          <button
            onClick={() => setActiveTab('bible')}
            className="flex items-center gap-1.5 text-left group cursor-pointer focus:outline-none shrink-0"
            aria-label="Scripture With Links Home"
          >
            <span className="font-display-sacred text-sm sm:text-base lg:text-lg font-bold tracking-wider text-stone-900 group-hover:text-amber-900 transition-colors whitespace-nowrap shrink-0">
              SCRIPTURE <span className="text-amber-800">WITH LINKS</span>
            </span>
            <span className="hidden xl:inline-block text-[10px] font-mono text-stone-600 border border-stone-300 px-1.5 py-0.5 rounded">
              KJV
            </span>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs lg:text-[13px] font-medium text-stone-600 py-2">
            <button
              onClick={() => setActiveTab('bible')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'bible' ? 'text-amber-900 font-bold bg-amber-50 shadow-2xs' : 'hover:bg-stone-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-800" />
              <span>KJV Bible</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'map' ? 'text-amber-900 font-bold bg-amber-50 shadow-2xs' : 'hover:bg-stone-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-800" />
              <span>Pilgrim&apos;s Map</span>
            </button>

            <button
              onClick={() => setActiveTab('topics')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'topics' ? 'text-amber-900 font-bold bg-amber-50 shadow-2xs' : 'hover:bg-stone-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-800" />
              <span>Topics</span>
            </button>

            <button
              onClick={() => setActiveTab('archive')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'archive' ? 'text-amber-900 font-bold bg-amber-50 shadow-2xs' : 'hover:bg-stone-100'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-amber-800" />
              <span>Videos</span>
              <span className="text-[11px] font-mono text-stone-500 tabular-nums">({totalLinksCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('density')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'density' ? 'text-amber-900 font-bold bg-amber-50 shadow-2xs' : 'hover:bg-stone-100'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-amber-800" />
              <span>Density Map</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'analytics' ? 'text-amber-900 font-bold bg-amber-50 shadow-2xs' : 'hover:bg-stone-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-800" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('pilgrims')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'pilgrims' ? 'text-amber-900 font-bold bg-amber-50 shadow-2xs' : 'hover:bg-stone-100'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-800" />
              <span>Fellow Pilgrims</span>
            </button>
          </nav>

          {/* Zone 3: Actions + Mode Pill + Uploads + Space Admin + WhatsApp + PWA */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Account / Mode Switcher Pill */}
            <button
              onClick={onOpenAuthModal}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border transition cursor-pointer shrink-0 ${
                authMode === 'admin'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                  : authMode === 'member'
                  ? 'bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100'
                  : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
              }`}
              title="Switch identity mode or configure local space"
            >
              {authMode === 'admin' ? (
                <>
                  <Crown className="w-3 h-3 text-emerald-700" />
                  <span className="hidden sm:inline">Admin</span>
                </>
              ) : authMode === 'member' ? (
                <>
                  <Users className="w-3 h-3 text-blue-700" />
                  <span className="hidden sm:inline">Member</span>
                </>
              ) : (
                <>
                  <Compass className="w-3 h-3 text-stone-500" />
                  <span className="hidden sm:inline">Guest</span>
                </>
              )}
            </button>

            {/* Sovereign Space Management Button (Invite friends, admin space) */}
            <button
              onClick={onOpenSpaceAdminModal}
              className="hidden sm:flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer"
              title="Manage Space & Invite Fellow Bereans"
            >
              <Crown className="w-3.5 h-3.5 text-emerald-700" />
              <span>Space</span>
            </button>

            {/* Upload & Repository Manager Button */}
            <button
              onClick={onOpenUploadModal}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition cursor-pointer"
              title="Upload Videos, Chats, or Backup Sanctuary"
            >
              <Upload className="w-3.5 h-3.5 text-stone-700" />
              <span className="hidden md:inline">Uploads</span>
            </button>

            {/* WhatsApp Quick Toggle */}
            <button
              onClick={onToggleWhatsApp}
              className={`p-2 rounded-lg border transition-all cursor-pointer relative ${
                isWhatsAppOpen
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
              title="Open WhatsApp Fellowship Chat"
              aria-label="Toggle WhatsApp Fellowship Chat"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Primary Action: Link Video */}
            <button
              onClick={onOpenPostModal}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white bg-amber-900 hover:bg-amber-800 active:bg-amber-950 rounded-lg shadow-xs transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Link Video</span>
              <span className="sm:hidden">Link</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation strip */}
        <div className="lg:hidden flex items-center justify-between py-2 border-t border-stone-200 text-xs font-medium text-stone-600 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('bible')}
            className={`py-1 px-2 rounded shrink-0 cursor-pointer ${activeTab === 'bible' ? 'text-amber-900 font-bold bg-amber-50' : ''}`}
          >
            Bible
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`py-1 px-2 rounded shrink-0 cursor-pointer ${activeTab === 'map' ? 'text-amber-900 font-bold bg-amber-50' : ''}`}
          >
            Map
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`py-1 px-2 rounded shrink-0 cursor-pointer ${activeTab === 'topics' ? 'text-amber-900 font-bold bg-amber-50' : ''}`}
          >
            Topics
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`py-1 px-2 rounded shrink-0 cursor-pointer ${activeTab === 'archive' ? 'text-amber-900 font-bold bg-amber-50' : ''}`}
          >
            Videos ({totalLinksCount})
          </button>
          <button
            onClick={() => setActiveTab('density')}
            className={`py-1 px-2 rounded shrink-0 cursor-pointer ${activeTab === 'density' ? 'text-amber-900 font-bold bg-amber-50' : ''}`}
          >
            Density
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-1 px-2 rounded shrink-0 cursor-pointer ${activeTab === 'analytics' ? 'text-amber-900 font-bold bg-amber-50' : ''}`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('pilgrims')}
            className={`py-1 px-2 rounded shrink-0 cursor-pointer ${activeTab === 'pilgrims' ? 'text-amber-900 font-bold bg-amber-50' : ''}`}
          >
            Pilgrims
          </button>
        </div>
      </div>
    </header>
  );
};
