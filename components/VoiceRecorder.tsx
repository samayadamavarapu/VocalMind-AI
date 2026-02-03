
import React, { useState, useRef, useEffect } from 'react';
import { AppStatus } from '../types';

interface Props {
  status: AppStatus;
  onRecordStart: () => void;
  onRecordStop: (blob: Blob) => void;
  onError: (message: string) => void;
}

const VoiceRecorder: React.FC<Props> = ({ status, onRecordStart, onRecordStop, onError }) => {
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (status === AppStatus.RECORDING) {
      timerRef.current = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimer(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  const startRecording = async () => {
    try {
      // Check for browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Recording is not supported in this browser or environment (requires HTTPS).");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordStop(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      onRecordStart();
    } catch (error: any) {
      console.error("Microphone access error:", error);
      let errorMessage = "Could not access microphone.";
      
      // Standardize error names
      const errorName = error.name || "";
      const message = (error.message || "").toLowerCase();

      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError' || message.includes('denied')) {
        errorMessage = "Permission denied. Please click the lock icon in your browser's address bar and set Microphone to 'Allow'.";
      } else if (message.includes('dismissed')) {
        errorMessage = "Permission prompt was dismissed. Please click the record button again and select 'Allow'.";
      } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        errorMessage = "No microphone found. Please connect a recording device and try again.";
      } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
        errorMessage = "Microphone is already in use by another application.";
      } else if (!window.isSecureContext) {
        errorMessage = "Microphone access requires a secure (HTTPS) connection.";
      }
      
      onError(errorMessage);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="relative group">
        <div className={`absolute -inset-4 rounded-full bg-indigo-500/20 blur-xl transition-opacity duration-500 ${status === AppStatus.RECORDING ? 'opacity-100 animate-pulse' : 'opacity-0'}`}></div>
        
        <button
          onClick={status === AppStatus.RECORDING ? stopRecording : startRecording}
          disabled={status === AppStatus.PROCESSING}
          className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 shadow-lg
            ${status === AppStatus.RECORDING ? 'bg-rose-500 hover:bg-rose-600 scale-110' : 'bg-indigo-600 hover:bg-indigo-700'}
            ${status === AppStatus.PROCESSING ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {status === AppStatus.RECORDING ? (
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>

      <div className="text-center">
        <p className="text-3xl font-mono font-bold text-slate-700 mb-2">
          {formatTime(timer)}
        </p>
        <p className="text-slate-500 font-medium">
          {status === AppStatus.RECORDING ? "Click to stop recording" : "Click to start voice note"}
        </p>
      </div>
      
      {status === AppStatus.PROCESSING && (
        <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-full text-indigo-600 text-sm font-semibold animate-pulse">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing your voice note...
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
