
export interface NoteInsight {
  transcript: string;
  summary: string;
  actionItems: string[];
  keyDecisions: string[];
}

export enum AppStatus {
  IDLE = 'idle',
  RECORDING = 'recording',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export interface VoiceNote {
  id: string;
  timestamp: number;
  audioBlob: Blob;
  insight?: NoteInsight;
}
