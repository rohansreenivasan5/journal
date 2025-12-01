import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds max for transcription

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 25MB - OpenAI limit)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Audio file too large. Maximum size is 25MB.' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['audio/webm', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mp4'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(webm|mp3|wav|m4a|mp4)$/i)) {
      return NextResponse.json(
        { error: 'Invalid audio format. Supported: webm, mp3, wav, m4a, mp4' },
        { status: 400 }
      );
    }

    // Get OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Ensure file has proper type and name
    // Create a new File object with explicit type if needed
    let fileToSend = file;
    if (!file.type || !file.name.match(/\.(webm|mp3|wav|m4a|mp4|flac|mpeg|mpga|oga|ogg)$/i)) {
      // Reconstruct file with proper type and extension
      const blob = await file.arrayBuffer();
      const extension = file.name.match(/\.(\w+)$/)?.[1] || 'webm';
      const mimeType = file.type || `audio/${extension === 'webm' ? 'webm' : extension === 'mp3' ? 'mpeg' : extension}`;
      fileToSend = new File([blob], `audio.${extension}`, { type: mimeType });
    }

    // Prepare form data for OpenAI
    const openAIFormData = new FormData();
    openAIFormData.append('file', fileToSend, fileToSend.name);
    openAIFormData.append('model', 'whisper-1');
    openAIFormData.append('language', 'en'); // Optional: specify language for better accuracy

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: openAIFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('OpenAI API error:', errorData);
      
      return NextResponse.json(
        { 
          error: errorData.error?.message || `OpenAI API error: ${response.status}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      text: data.text || '',
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to transcribe audio' 
      },
      { status: 500 }
    );
  }
}

