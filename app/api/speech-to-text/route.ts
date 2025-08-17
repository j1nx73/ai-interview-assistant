import { NextRequest, NextResponse } from 'next/server';

// Lazy load the speech service to prevent build-time initialization issues
let speechService: any = null;

async function getSpeechService() {
  try {
    // Check if required environment variables are set before even importing the service
    // Using the exact variable names from the user's .env file
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID || !process.env.GOOGLE_CLOUD_PRIVATE_KEY || !process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
      console.warn('Google Cloud credentials not configured. Speech features will be disabled.');
      console.warn('Required variables: GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_PRIVATE_KEY, GOOGLE_CLOUD_CLIENT_EMAIL');
      console.warn('Current values:');
      console.warn('- GOOGLE_CLOUD_PROJECT_ID:', process.env.GOOGLE_CLOUD_PROJECT_ID ? '✅ Set' : '❌ Missing');
      console.warn('- GOOGLE_CLOUD_PRIVATE_KEY:', process.env.GOOGLE_CLOUD_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
      console.warn('- GOOGLE_CLOUD_CLIENT_EMAIL:', process.env.GOOGLE_CLOUD_CLIENT_EMAIL ? '✅ Set' : '❌ Missing');
      return null;
    }

    const { GoogleCloudSpeechService } = await import('@/lib/google-cloud-speech');
    speechService = new GoogleCloudSpeechService();
    return speechService;
  } catch (error) {
    console.error('Failed to load Google Cloud Speech service:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get speech service lazily
    const speechService = await getSpeechService();
    
    // Check if service is available
    if (!speechService) {
      return NextResponse.json(
        { 
          error: 'Speech service not available',
          message: 'Google Cloud Speech service is not configured. Please set GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_PRIVATE_KEY, and GOOGLE_CLOUD_CLIENT_EMAIL environment variables.',
          code: 'SERVICE_NOT_AVAILABLE'
        },
        { status: 503 }
      );
    }
    
    // Wait for speech service to be ready
    try {
      await speechService.waitForReady();
    } catch (error) {
      console.error('Speech service initialization failed:', error);
      return NextResponse.json(
        { 
          error: 'Speech service initialization failed',
          message: 'Google Cloud Speech service failed to initialize. Please check your environment variables and ensure the Speech-to-Text API is enabled.',
          code: 'SERVICE_INIT_FAILED'
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'en-US';
    const encoding = formData.get('encoding') as string || 'MP3';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/webm'];
    if (!allowedTypes.includes(audioFile.type)) {
      console.warn(`⚠️ File type ${audioFile.type} not in allowed list, but attempting to process anyway`);
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { 
          error: 'File too large',
          maxSize: '10MB',
          receivedSize: `${(audioFile.size / 1024 / 1024).toFixed(2)}MB`
        },
        { status: 400 }
      );
    }
    
    // Validate file has content
    if (audioFile.size === 0) {
      return NextResponse.json(
        { error: 'Audio file is empty' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('📊 Audio file details:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
      bufferSize: buffer.length,
      firstBytes: buffer.slice(0, 20).toString('hex'),
      lastBytes: buffer.slice(-20).toString('hex')
    });
    
    // Check if buffer has content
    if (buffer.length === 0) {
      return NextResponse.json(
        { error: 'Audio file buffer is empty' },
        { status: 400 }
      );
    }
    
    // Check for common audio file signatures
    const fileSignature = buffer.slice(0, 4).toString('hex').toUpperCase();
    console.log('🔍 File signature (first 4 bytes):', fileSignature);
    
    const expectedSignatures = {
      'MP3': ['49443300', '49443304', '49443303', 'FFFB', 'FFFA', 'FFFE'], // ID3v1, ID3v2.4, ID3v2.3, MPEG
      'WAV': ['52494646'], // RIFF
      'M4A': ['66747970'], // ftyp
      'OGG': ['4F676753']  // OggS
    };
    
    let detectedFormat = 'Unknown';
    for (const [format, signatures] of Object.entries(expectedSignatures)) {
      if (signatures.some(sig => fileSignature.startsWith(sig))) {
        detectedFormat = format;
        break;
      }
    }
    
    console.log('🔍 Detected format:', detectedFormat);
    
    if (detectedFormat === 'Unknown') {
      console.warn('⚠️ Unknown file format, attempting to process anyway');
    }
    
    // Pass the detected format to the speech service
    const audioFormat = detectedFormat !== 'Unknown' ? detectedFormat : 'MP3';

    console.log('🎤 Processing audio file:', {
      name: audioFile.name,
      type: audioFile.type,
      size: `${(audioFile.size / 1024 / 1024).toFixed(2)}MB`,
      language,
      userEncoding: encoding,
      detectedFormat: audioFormat
    });

    // Perform speech recognition
    const recognitionResult = await speechService.transcribeAudio(buffer, {
      languageCode: language,
      encoding: audioFormat as any, // Use detected format instead of user selection
      enableAutomaticPunctuation: true,
      enableWordTimeOffsets: true,
      enableWordConfidence: true,
      useEnhanced: true,
    });

    // Analyze speech patterns
    const analysisResult = await speechService.analyzeSpeech(recognitionResult);

    console.log('✅ Speech processing completed successfully');

    return NextResponse.json({
      success: true,
      data: {
        recognition: recognitionResult,
        analysis: analysisResult,
      },
      metadata: {
        processingTime: new Date().toISOString(),
        fileInfo: {
          name: audioFile.name,
          size: audioFile.size,
          type: audioFile.type,
        },
      },
    });

  } catch (error) {
    console.error('❌ Speech-to-text API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Speech-to-text conversion failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get speech service lazily
    const speechService = await getSpeechService();
    
    // Check if service is available
    if (!speechService) {
      return NextResponse.json({
        service: 'Google Cloud Speech-to-Text',
        status: { 
          ready: false, 
          message: 'Service not configured. Please set Google Cloud environment variables.' 
        },
        error: 'SERVICE_NOT_AVAILABLE',
        message: 'Google Cloud Speech service is not configured. Please set GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_PRIVATE_KEY, and GOOGLE_CLOUD_CLIENT_EMAIL environment variables.',
        features: [
          'High-quality speech recognition',
          'Multiple language support',
          'Automatic punctuation',
          'Word-level timing',
          'Confidence scoring',
          'Speech pattern analysis',
          'Speaking rate calculation',
          'Pause analysis',
        ],
        limits: {
          maxFileSize: '10MB',
          supportedFormats: ['MP3', 'WAV', 'M4A', 'OGG'],
          maxAudioLength: '60 minutes',
        },
        setup: {
          required: [
            'GOOGLE_CLOUD_PROJECT_ID',
            'GOOGLE_CLOUD_PRIVATE_KEY', 
            'GOOGLE_CLOUD_CLIENT_EMAIL'
          ],
          instructions: 'Set these environment variables in your Vercel dashboard to enable speech features.'
        }
      });
    }
    
    // Check if service is ready
    let status;
    try {
      await speechService.waitForReady();
      status = { ready: true, message: 'Google Cloud Speech service is ready' };
    } catch (error) {
      status = { 
        ready: false, 
        message: error instanceof Error ? error.message : 'Service initialization failed' 
      };
    }
    
    // Test the service with a simple operation
    let testResult = null;
    let connectivityTest = null;
    
    try {
      testResult = await speechService.getSupportedLanguages();
      connectivityTest = await speechService.testConnection();
    } catch (error) {
      console.error('❌ Service test failed:', error);
      testResult = { error: error instanceof Error ? error.message : 'Unknown error' };
      connectivityTest = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
    
    const languages = testResult;

    return NextResponse.json({
      service: 'Google Cloud Speech-to-Text',
      status,
      connectivityTest,
      supportedLanguages: languages,
      features: [
        'High-quality speech recognition',
        'Multiple language support',
        'Automatic punctuation',
        'Word-level timing',
        'Confidence scoring',
        'Speech pattern analysis',
        'Speaking rate calculation',
        'Pause analysis',
      ],
      limits: {
        maxFileSize: '10MB',
        supportedFormats: ['MP3', 'WAV', 'M4A', 'OGG'],
        maxAudioLength: '60 minutes',
      },
    });
  } catch (error) {
    console.error('❌ Status check error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get service status',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
