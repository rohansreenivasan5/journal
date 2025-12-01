'use client';

import { useState, useRef, useCallback } from 'react';

interface UseVoiceRecorderOptions {
  onTranscription: (text: string) => void;
  segmentDuration?: number; // Duration of each recording segment in milliseconds
}

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  permissionGranted: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  requestPermission: () => Promise<boolean>;
}

export function useVoiceRecorder({
  onTranscription,
  segmentDuration = 5000, // 5 seconds default - creates complete valid audio files
}: UseVoiceRecorderOptions): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingActiveRef = useRef<boolean>(false);
  const mimeTypeRef = useRef<string>('audio/webm');

  const transcribeSegment = useCallback(async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      
      // Ensure blob has minimum size
      if (audioBlob.size < 1024) {
        setIsProcessing(false);
        return;
      }

      // Determine file extension and MIME type
      let fileExtension = 'webm';
      let mimeType = 'audio/webm';
      
      const blobType = audioBlob.type || mimeTypeRef.current;
      if (blobType.includes('webm')) {
        fileExtension = 'webm';
        mimeType = 'audio/webm';
      } else if (blobType.includes('ogg')) {
        fileExtension = 'ogg';
        mimeType = 'audio/ogg';
      } else if (blobType.includes('mp4')) {
        fileExtension = 'm4a';
        mimeType = 'audio/m4a';
      }

      // Ensure the blob has the correct MIME type
      const blobWithType = audioBlob.type ? audioBlob : new Blob([audioBlob], { type: mimeType });

      // Create a File object with explicit MIME type and extension
      const audioFile = new File([blobWithType], `audio.${fileExtension}`, {
        type: mimeType,
        lastModified: Date.now(),
      });
      
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('model', 'whisper-1');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.text && data.text.trim()) {
        onTranscription(data.text.trim() + ' ');
      }
    } catch (err) {
      console.error('Transcription error:', err);
      // Only set error for non-format errors to avoid spam
      const errorMessage = err instanceof Error ? err.message : 'Failed to transcribe audio';
      if (!errorMessage.includes('Invalid file format')) {
        setError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [onTranscription]);

  const recordSegment = useCallback(async () => {
    if (!isRecordingActiveRef.current || !streamRef.current) {
      return;
    }

    try {
      // Check which audio format is supported
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else {
          throw new Error('Audio recording not supported in this browser');
        }
      }

      mimeTypeRef.current = mimeType;

      // Create a new MediaRecorder for this segment
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: mimeType,
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Combine all chunks into a complete audio file
        if (chunks.length > 0) {
          const completeBlob = new Blob(chunks, { type: mimeType });
          // Transcribe the complete segment
          await transcribeSegment(completeBlob);
        }

        // If still recording, start the next segment
        if (isRecordingActiveRef.current) {
          recordingIntervalRef.current = setTimeout(() => {
            recordSegment();
          }, 100); // Small delay before next segment
        }
      };

      // Start recording this segment
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      // Stop after segment duration to get a complete file
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, segmentDuration);

    } catch (err) {
      console.error('Error recording segment:', err);
      setError(err instanceof Error ? err.message : 'Failed to record segment');
      setIsRecording(false);
      isRecordingActiveRef.current = false;
    }
  }, [segmentDuration, transcribeSegment]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);
      setError(null);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        setError('Microphone permission denied. Please allow microphone access and try again.');
      } else {
        setError(`Failed to access microphone: ${errorMessage}`);
      }
      setPermissionGranted(false);
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);

      // Request permission if not already granted
      if (!permissionGranted) {
        const granted = await requestPermission();
        if (!granted) {
          return;
        }
      }

      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      streamRef.current = stream;
      isRecordingActiveRef.current = true;
      setIsRecording(true);

      // Start the first segment
      await recordSegment();

    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setIsRecording(false);
      isRecordingActiveRef.current = false;
    }
  }, [permissionGranted, requestPermission, recordSegment]);

  const stopRecording = useCallback(() => {
    isRecordingActiveRef.current = false;

    // Clear any pending segment recording
    if (recordingIntervalRef.current) {
      clearTimeout(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    // Stop current MediaRecorder if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    mediaRecorderRef.current = null;
    setIsRecording(false);
  }, []);

  return {
    isRecording,
    isProcessing,
    error,
    permissionGranted,
    startRecording,
    stopRecording,
    requestPermission,
  };
}
