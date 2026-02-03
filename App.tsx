
import React, { useState, useCallback } from 'react';
import { AppStatus, NoteInsight, VoiceNote } from './types';
import { processVoiceNote } from './services/geminiService';
import Header from './components/Header';
import VoiceRecorder from './components/VoiceRecorder';
import SummaryDashboard from './components/SummaryDashboard';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [currentNote, setCurrentNote] = useState<VoiceNote | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRecordStart = useCallback(() => {
    setStatus(AppStatus.RECORDING);
    setError(null);
  }, []);

  const handleRecordError = useCallback((message: string) => {
    setError(message);
    setStatus(AppStatus.ERROR);
  }, []);

  const handleRecordStop = async (audioBlob: Blob) => {
    setStatus(AppStatus.PROCESSING);
    try {
      const insight = await processVoiceNote(audioBlob);
      setCurrentNote({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        audioBlob,
        insight,
      });
      setStatus(AppStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during processing.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setStatus(AppStatus.IDLE);
    setCurrentNote(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <section className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mb-4">
            Voice Notes, <span className="text-indigo-600">Supercharged</span>.
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            Record a meeting or a quick thought. Our AI extracts action items and decisions so you don't have to.
          </p>
        </section>

        {(status === AppStatus.IDLE || status === AppStatus.RECORDING || status === AppStatus.PROCESSING) && (
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
            <VoiceRecorder 
              status={status}
              onRecordStart={handleRecordStart}
              onRecordStop={handleRecordStop}
              onError={handleRecordError}
            />
          </div>
        )}

        {status === AppStatus.ERROR && (
          <div className="bg-white border border-slate-200 p-8 rounded-3xl text-center max-w-md mx-auto shadow-xl animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Access Required</h3>
            <p className="text-slate-600 mb-8 text-sm leading-relaxed">{error}</p>
            
            {error?.toLowerCase().includes('denied') && (
              <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">How to Fix:</p>
                <ol className="text-xs text-slate-500 space-y-2 list-decimal list-inside">
                  <li>Locate the <span className="font-semibold">lock icon</span> 🔒 in the address bar</li>
                  <li>Find <span className="font-semibold">Microphone</span> in the list</li>
                  <li>Toggle the switch to <span className="font-semibold text-emerald-600">On/Allow</span></li>
                  <li>Reload this page and try again</li>
                </ol>
              </div>
            )}

            <button 
              onClick={handleReset}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Restart & Try Again
            </button>
          </div>
        )}

        {status === AppStatus.COMPLETED && currentNote?.insight && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Results</h3>
              <button 
                onClick={handleReset}
                className="text-sm font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                New Note
              </button>
            </div>
            
            <SummaryDashboard insight={currentNote.insight} />
          </div>
        )}

        {/* Strategy and Architecture Documentation Section */}
        <section className="mt-24 border-t border-slate-200 pt-16">
          <h3 className="text-2xl font-bold text-slate-800 mb-8">Architectural Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-700">Pipeline Design</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                We use a <strong>unified multimodal pipeline</strong>. Instead of separate Speech-to-Text (STT) and LLM steps, we feed audio directly to Gemini 3 Flash. This preserves emotional context and prosody while significantly reducing latency.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-700">Security & Privacy</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Audio is processed as ephemeral Base64 strings. For a production startup, we'd recommend adding <strong>AES-256 encryption</strong> for the persistent storage of transcripts and using <strong>Signed URLs</strong> for audio blob uploads to S3/GCS.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-700">Startup Roadmap</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                To scale this to a product, implement <strong>Speaker Diarization</strong> (identifying who said what), <strong>Calendar Integration</strong> (automatic note attachment to invites), and <strong>Slack/Notion webhooks</strong> for action items.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-700">Prompt Engineering</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                The prompt enforces <strong>Structured JSON output</strong>. This ensures the frontend can reliably parse bullet points and action items without fragile regex logic or string splitting.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-slate-200 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">© 2025 VocalMind AI. Built for high-performance productivity.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
