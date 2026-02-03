
import React, { useState } from 'react';
import { NoteInsight } from '../types';
import { speakSummary } from '../services/geminiService';

interface Props {
  insight: NoteInsight;
}

const SummaryDashboard: React.FC<Props> = ({ insight }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = async () => {
    try {
      setIsPlaying(true);
      const audioBuffer = await speakSummary(insight.summary);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => setIsPlaying(false);
      source.start(0);
    } catch (error) {
      console.error("Speech failed", error);
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Summary */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Smart Summary
            </h2>
            <button 
              onClick={handleSpeak}
              disabled={isPlaying}
              className={`p-2 rounded-full transition-colors ${isPlaying ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              title="Read aloud"
            >
              <svg className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>
          <p className="text-slate-600 leading-relaxed italic">"{insight.summary}"</p>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Action Items
          </h2>
          <ul className="space-y-3">
            {insight.actionItems.length > 0 ? insight.actionItems.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-slate-600 items-start">
                <div className="mt-1 w-4 h-4 rounded-full border border-emerald-400 shrink-0"></div>
                {item}
              </li>
            )) : <li className="text-slate-400 italic text-sm">No action items detected</li>}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Decisions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Key Decisions
          </h2>
          <ul className="space-y-3">
            {insight.keyDecisions.length > 0 ? insight.keyDecisions.map((decision, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-slate-600 items-start">
                <span className="font-bold text-amber-500">•</span>
                {decision}
              </li>
            )) : <li className="text-slate-400 italic text-sm">No decisions logged</li>}
          </ul>
        </div>

        {/* Full Transcript */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            Transcript
          </h2>
          <div className="max-h-[150px] overflow-y-auto text-sm text-slate-500 leading-relaxed pr-2">
            {insight.transcript}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryDashboard;
