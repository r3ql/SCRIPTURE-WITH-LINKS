import React from 'react';
import type { AnonymousTrailPeer, UserBibleProgress } from '../types/index.ts';
import {
  Users,
  Compass,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Flame,
  Check
} from 'lucide-react';

interface TrailCompanionsProps {
  peers: AnonymousTrailPeer[];
  userProgress: UserBibleProgress;
  onConnectPeer: (peer: AnonymousTrailPeer) => void;
  onJumpToBibleVerse: (bookId: string, chapter: number) => void;
}

export const TrailCompanions: React.FC<TrailCompanionsProps> = ({
  peers,
  userProgress,
  onConnectPeer,
  onJumpToBibleVerse,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="pb-6 mb-8 border-b border-stone-200">
        <span className="text-xs font-mono uppercase tracking-widest text-amber-900 font-semibold">
          Anonymous Canonical Fellowship Matchmaker
        </span>
        <h1 className="text-3xl font-serif-reading font-semibold text-stone-900 mt-1">
          Berean Trail Companions
        </h1>
        <p className="text-sm text-stone-600 mt-1 max-w-2xl font-sans">
          Connect anonymously with believers studying similar scriptures and video expositions. Form private WhatsApp study rooms to explore difficult verses and encourage one another without compromising privacy.
        </p>

        {/* Privacy Notice Banner */}
        <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>
            <strong>100% Anonymous &amp; Secure:</strong> Identifiers are randomized pseudonyms (e.g. Berean Traveler #418). No personal emails, phone numbers, or external profiles are exchanged.
          </span>
        </div>
      </div>

      {/* Grid of Matched Anonymous Pilgrims */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {peers.map((peer) => {
          return (
            <div
              key={peer.id}
              className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Peer Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={peer.avatar}
                      alt={peer.pseudonym}
                      className="w-12 h-12 rounded-full object-cover border border-stone-200"
                    />
                    <div>
                      <h3 className="font-semibold text-stone-900 text-sm">
                        {peer.pseudonym}
                      </h3>
                      <span className="text-xs text-stone-500 font-mono">
                        Active in {peer.currentFocusBook} {peer.currentFocusChapter}
                      </span>
                    </div>
                  </div>

                  {/* Overlap Badge */}
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-amber-900 tabular-nums">
                      {peer.overlapPercentage}%
                    </span>
                    <span className="block text-[10px] text-stone-400 uppercase font-mono">
                      Trail Match
                    </span>
                  </div>
                </div>

                {/* Trail Description */}
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-100 mb-4 text-xs text-stone-700 leading-relaxed font-serif-reading text-[13px]">
                  "{peer.matchedTrailDescription}"
                </div>

                {/* Active Topics */}
                <div className="space-y-2 mb-4">
                  <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block">
                    Shared Topical Focus:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {peer.activeTopics.map((topic) => (
                      <span
                        key={topic}
                        className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recent Studies */}
                <div className="space-y-1 text-xs text-stone-600 mb-4">
                  <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block">
                    Recent Scriptural Crossings:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {peer.recentStudies.map((ref) => (
                      <span
                        key={ref}
                        className="font-mono text-xs bg-amber-50 text-amber-900 border border-amber-200/60 px-2 py-0.5 rounded font-medium"
                      >
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onJumpToBibleVerse(peer.currentFocusBook, peer.currentFocusChapter)}
                  className="text-xs text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>View Chapter</span>
                </button>

                <button
                  onClick={() => onConnectPeer(peer)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    peer.isChatInitiated
                      ? 'bg-stone-100 text-stone-700 border border-stone-300'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{peer.isChatInitiated ? 'Open Study Room' : 'Connect in WhatsApp'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
