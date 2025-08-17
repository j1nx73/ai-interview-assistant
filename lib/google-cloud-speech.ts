import { SpeechClient } from '@google-cloud/speech';

export interface SpeechRecognitionConfig {
  encoding: 'LINEAR16' | 'FLAC' | 'MP3' | 'M4A' | 'OGG_OPUS' | 'SPEEX_WITH_HEADER_BYTE';
  sampleRateHertz: number;
  languageCode: string;
  enableAutomaticPunctuation?: boolean;
  enableWordTimeOffsets?: boolean;
  enableWordConfidence?: boolean;
  model?: string;
  useEnhanced?: boolean;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  words: Array<{
    word: string;
    startTime: number;
    endTime: number;
    confidence: number;
  }>;
  languageCode: string;
  totalTime: number;
}

export interface SpeechAnalysisResult {
  text: string;
  wordCount: number;
  speakingRate: number;
  pauseAnalysis: {
    totalPauses: number;
    averagePauseLength: number;
    longestPause: number;
  };
  confidence: number;
  language: string;
  qualityScore: number;
}

export class GoogleCloudSpeechService {
  private client!: SpeechClient;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Don't initialize automatically to prevent build-time issues
    // Initialization will happen when waitForReady() is called
  }

  private async initializeClient(): Promise<void> {
    try {
      // Check if we have the required environment variables for Vercel deployment
      if (!process.env.GOOGLE_CLOUD_PROJECT_ID || !process.env.GOOGLE_CLOUD_PRIVATE_KEY || !process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
        console.warn('Google Cloud credentials not configured. Speech features will be disabled.');
        console.warn('Set GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_PRIVATE_KEY, and GOOGLE_CLOUD_CLIENT_EMAIL in Vercel environment variables.');
        return;
      }

      // Create credentials object from environment variables (for Vercel deployment)
      const credentials = {
        type: 'service_account',
        project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLOUD_CLIENT_ID || '',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLOUD_CLIENT_EMAIL}`
      };

      this.client = new SpeechClient({
        credentials,
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      });

      // Test the connection
      await this.client.initialize();
      this.isInitialized = true;
      console.log('✅ Google Cloud Speech client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Google Cloud Speech client:', error);
      this.isInitialized = false;
      throw error; // Re-throw to make initialization failures visible
    }
  }

  /**
   * Wait for the service to be ready
   */
  async waitForReady(): Promise<void> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeClient();
    }
    
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
    
    if (!this.isInitialized) {
      throw new Error('Google Cloud Speech service is not available. Please configure Google Cloud credentials in environment variables.');
    }
  }

  /**
   * Check if the service is available
   */
  isServiceAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * Convert audio file to text using Google Cloud Speech-to-Text
   */
  async transcribeAudio(
    audioBuffer: Buffer,
    config: Partial<SpeechRecognitionConfig> = {}
  ): Promise<SpeechRecognitionResult> {
    
    // Check if audio is too long for sync recognition (>1 minute)
    // Google Cloud Speech API sync recognition has a 1-minute limit
    const audioSizeMB = audioBuffer.length / (1024 * 1024);
    const isLongAudio = audioSizeMB > 0.3; // Very conservative estimate: >0.3MB likely means >1min
    
    console.log(`📊 Audio size: ${audioSizeMB.toFixed(2)}MB, using ${isLongAudio ? 'long-running' : 'sync'} recognition`);
    
    if (isLongAudio) {
      console.log('⏱️ Long audio detected, using LongRunningRecognize...');
      return this.transcribeLongAudio(audioBuffer, config);
    }
    
    console.log('⚡ Short audio detected, using sync recognition...');
    return this.transcribeShortAudio(audioBuffer, config);
  }

  /**
   * Transcribe short audio files (<1 minute) using sync recognition
   */
  private async transcribeShortAudio(
    audioBuffer: Buffer,
    config: Partial<SpeechRecognitionConfig> = {}
  ): Promise<SpeechRecognitionResult> {
    // Wait for the service to be ready
    await this.waitForReady();

    try {
      // Default configuration
      const defaultConfig: SpeechRecognitionConfig = {
        encoding: 'MP3',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: true,
        enableWordConfidence: true,
        useEnhanced: true,
        ...config,
      };
      
      // Try different encoding configurations if the first one fails
      // Start with the user-specified encoding, then fall back to others
      const userEncoding = defaultConfig.encoding;
      const encodingConfigs = [
        { encoding: userEncoding, sampleRateHertz: 16000 }, // Try user's choice first
        { encoding: userEncoding, sampleRateHertz: 44100 },
        { encoding: userEncoding, sampleRateHertz: 48000 },
        { encoding: 'MP3', sampleRateHertz: 16000 }, // Fallback to MP3
        { encoding: 'MP3', sampleRateHertz: 44100 },
        { encoding: 'MP3', sampleRateHertz: 48000 },
        { encoding: 'LINEAR16', sampleRateHertz: 16000 },
        { encoding: 'LINEAR16', sampleRateHertz: 44100 },
        { encoding: 'FLAC', sampleRateHertz: 16000 },
        { encoding: 'FLAC', sampleRateHertz: 44100 },
      ];

      // Try different configurations until one works
      let response;
      let lastError;
      
      for (const config of encodingConfigs) {
        try {
          console.log(`🎤 Trying speech recognition with config:`, config);
          
          const request = {
            audio: {
              content: audioBuffer.toString('base64'),
            },
            config: {
              encoding: config.encoding as any,
              sampleRateHertz: config.sampleRateHertz,
              languageCode: defaultConfig.languageCode,
              enableAutomaticPunctuation: defaultConfig.enableAutomaticPunctuation,
              enableWordTimeOffsets: defaultConfig.enableWordTimeOffsets,
              enableWordConfidence: defaultConfig.enableWordConfidence,
              useEnhanced: defaultConfig.useEnhanced,
            },
          };

          console.log('📤 Sending request to Google Cloud Speech API...');
          
          // Perform the transcription
          response = await this.client.recognize(request);
          
          console.log('📥 Received response from Google Cloud Speech API');
          
          // If we get here, it worked!
          console.log(`✅ Speech recognition succeeded with config:`, config);
          break;
          
        } catch (error) {
          console.log(`❌ Failed with config ${config.encoding}/${config.sampleRateHertz}:`, error);
          lastError = error;
          
          // If it's a permission or API error, don't retry with other configs
          if (error.message && (error.message.includes('PERMISSION_DENIED') || error.message.includes('API has not been used'))) {
            console.log('🚫 Stopping retries due to permission/API error');
            break;
          }
          
          // If it's an encoding mismatch, try the next config
          if (error.message && error.message.includes('Specify') && error.message.includes('encoding to match audio file')) {
            console.log('🔄 Encoding mismatch, trying next configuration');
            continue;
          }
          
          continue;
        }
      }
      
      if (!response) {
        if (lastError && lastError.message && lastError.message.includes('PERMISSION_DENIED')) {
          throw new Error(`Google Cloud Speech API access denied. Please check your credentials and ensure the Speech-to-Text API is enabled in project affable-framing-466420-r7`);
        }
        throw new Error(`All speech recognition attempts failed. Last error: ${lastError}`);
      }
      
      console.log('🔍 API Response:', JSON.stringify(response, null, 2));
      
      // Check if we have results
      if (!response.results || response.results.length === 0) {
        console.error('❌ No results in response:', response);
        throw new Error('No transcription results returned. The audio might be too short, silent, or in an unsupported format.');
      }
      
      console.log(`✅ Found ${response.results.length} result(s) in response`);
      
      // Log the actual results structure
      response.results.forEach((result, index) => {
        if (result) {
          console.log(`🔍 Result ${index}:`, JSON.stringify(result, null, 2));
        } else {
          console.log(`🔍 Result ${index}: null`);
        }
      });

      // Process the results
      console.log('🔍 Processing results:', response.results.length, 'results');
      
      // Try to find a result with actual transcript content
      let result, alternative, transcript, confidence;
      
      for (let i = 0; i < response.results.length; i++) {
        const currentResult = response.results[i];
        
        // Skip null results
        if (!currentResult) {
          console.log(`🔍 Result ${i}: null, skipping`);
          continue;
        }
        
        console.log(`🔍 Checking result ${i}:`, JSON.stringify(currentResult, null, 2));
        
        if (currentResult.alternatives && currentResult.alternatives.length > 0) {
          for (let j = 0; j < currentResult.alternatives.length; j++) {
            const currentAlternative = currentResult.alternatives[j];
            console.log(`🔍 Checking alternative ${j}:`, JSON.stringify(currentAlternative, null, 2));
            
            if (currentAlternative.transcript && currentAlternative.transcript.trim().length > 0) {
              result = currentResult;
              alternative = currentAlternative;
              transcript = currentAlternative.transcript;
              confidence = currentAlternative.confidence || 0;
              console.log(`✅ Found valid transcript in result ${i}, alternative ${j}`);
              break;
            }
          }
          if (transcript) break;
        }
      }
      
      if (!transcript || transcript.trim().length === 0) {
        console.error('❌ No valid transcript found in any result');
        
        // Log what we found for debugging
        console.log('🔍 Summary of what was found:');
        response.results.forEach((result, index) => {
          if (result && result.alternatives) {
            console.log(`  Result ${index}: ${result.alternatives.length} alternatives`);
            result.alternatives.forEach((alt, altIndex) => {
              console.log(`    Alternative ${altIndex}: transcript="${alt.transcript}", confidence=${alt.confidence}`);
            });
          } else if (result) {
            console.log(`  Result ${index}: no alternatives`);
          } else {
            console.log(`  Result ${index}: null`);
          }
        });
        
        throw new Error('No valid transcript found. The audio might be silent or contain no speech.');
      }

      // Extract word-level information
      const words = alternative.words?.map((word: any) => ({
        word: word.word || '',
        startTime: word.startTime?.seconds ? parseFloat(word.startTime.seconds) : 0,
        endTime: word.endTime?.seconds ? parseFloat(word.endTime.seconds) : 0,
        confidence: word.confidence || 0,
      })) || [];
      
      console.log(`🔍 Extracted ${words.length} words from transcript`);

      const totalTime = words.length > 0 ? words[words.length - 1].endTime : 0;

      console.log('✅ Speech recognition completed successfully');
      console.log(`📝 Transcript length: ${transcript.length} characters`);
      console.log(`🎯 Confidence: ${(confidence * 100).toFixed(1)}%`);

      return {
        transcript,
        confidence,
        words,
        languageCode: defaultConfig.languageCode,
        totalTime,
      };
    } catch (error) {
      console.error('❌ Speech recognition failed:', error);
      throw new Error(`Speech recognition failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze speech patterns and provide insights
   */
  async analyzeSpeech(recognitionResult: SpeechRecognitionResult): Promise<SpeechAnalysisResult> {
    try {
      const { transcript, confidence, words, totalTime } = recognitionResult;
      const wordCount = words.length;

      // Calculate speaking rate (words per minute)
      const speakingRate = totalTime > 0 ? (wordCount / totalTime) * 60 : 0;

      // Analyze pauses between words
      const pauses: number[] = [];
      for (let i = 1; i < words.length; i++) {
        const pause = words[i].startTime - words[i - 1].endTime;
        if (pause > 0.1) { // Pauses longer than 100ms
          pauses.push(pause);
        }
      }

      const pauseAnalysis = {
        totalPauses: pauses.length,
        averagePauseLength: pauses.length > 0 ? pauses.reduce((a, b) => a + b, 0) / pauses.length : 0,
        longestPause: pauses.length > 0 ? Math.max(...pauses) : 0,
      };

      // Calculate quality score based on confidence, speaking rate, and pause analysis
      let qualityScore = confidence * 100;
      
      // Bonus for good speaking rate (150-200 WPM is ideal)
      if (speakingRate >= 150 && speakingRate <= 200) {
        qualityScore += 10;
      } else if (speakingRate >= 120 && speakingRate <= 250) {
        qualityScore += 5;
      }

      // Penalty for too many long pauses
      if (pauseAnalysis.averagePauseLength > 1.0) {
        qualityScore -= 10;
      }

      qualityScore = Math.max(0, Math.min(100, qualityScore));

      return {
        text: transcript,
        wordCount,
        speakingRate: Math.round(speakingRate),
        pauseAnalysis,
        confidence: Math.round(confidence * 100),
        language: recognitionResult.languageCode,
        qualityScore: Math.round(qualityScore),
      };
    } catch (error) {
      console.error('❌ Speech analysis failed:', error);
      throw new Error(`Speech analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get supported languages
   */
  async getSupportedLanguages(): Promise<Array<{ code: string; name: string }>> {
    const languages = [
      { code: 'en-US', name: 'English (US)' },
      { code: 'en-GB', name: 'English (UK)' },
      { code: 'es-ES', name: 'Spanish (Spain)' },
      { code: 'fr-FR', name: 'French (France)' },
      { code: 'de-DE', name: 'German (Germany)' },
      { code: 'it-IT', name: 'Italian (Italy)' },
      { code: 'pt-BR', name: 'Portuguese (Brazil)' },
      { code: 'ru-RU', name: 'Russian (Russia)' },
      { code: 'ja-JP', name: 'Japanese (Japan)' },
      { code: 'ko-KR', name: 'Korean (Korea)' },
      { code: 'zh-CN', name: 'Chinese (Simplified)' },
      { code: 'ar-SA', name: 'Arabic (Saudi Arabia)' },
      { code: 'hi-IN', name: 'Hindi (India)' },
    ];

    return languages;
  }

  /**
   * Check if the service is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get service status
   */
  getStatus(): { ready: boolean; message: string } {
    if (this.isInitialized) {
      return { ready: true, message: 'Google Cloud Speech service is ready' };
    } else {
      return { 
        ready: false, 
        message: 'Google Cloud Speech service not initialized. Please check your credentials.' 
      };
    }
  }

  /**
   * Test basic service connectivity
   */
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      await this.waitForReady();
      
      // Try to create a simple request to test connectivity
      const testRequest = {
        audio: {
          content: Buffer.from('test').toString('base64'), // Minimal test audio
        },
        config: {
          encoding: 'MP3',
          sampleRateHertz: 16000,
          languageCode: 'en-US',
        },
      };
      
      console.log('🧪 Testing service connectivity...');
      const response = await this.client.recognize(testRequest);
      console.log('✅ Service connectivity test passed');
      
      return { 
        success: true, 
        message: 'Service connectivity test passed',
        details: response
      };
      
    } catch (error) {
      console.error('❌ Service connectivity test failed:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      };
    }
  }

  /**
   * Transcribe long audio files (>1 minute) using LongRunningRecognize
   */
  private async transcribeLongAudio(
    audioBuffer: Buffer,
    config: Partial<SpeechRecognitionConfig> = {}
  ): Promise<SpeechRecognitionResult> {
    try {
      await this.waitForReady();
      
      // Default configuration for long audio
      const defaultConfig: SpeechRecognitionConfig = {
        encoding: 'MP3',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: true,
        enableWordConfidence: true,
        useEnhanced: true,
        ...config,
      };

      console.log('🎤 Starting long audio transcription...');
      console.log('⚙️ Config:', defaultConfig);

      // For very long audio, we need to use GCS URI instead of inline content
      // Let's try with a smaller chunk first, then fall back to GCS if needed
      const maxInlineSize = 10 * 1024 * 1024; // 10MB limit for inline audio
      
      if (audioBuffer.length > maxInlineSize) {
        console.log('📁 Audio too large for inline processing, using GCS approach...');
        throw new Error('Audio file too large. Please use Google Cloud Storage for files larger than 10MB.');
      }

      // Try to process with inline content first
      const request = {
        audio: {
          content: audioBuffer.toString('base64'),
        },
        config: {
          encoding: defaultConfig.encoding as any,
          sampleRateHertz: defaultConfig.sampleRateHertz,
          languageCode: defaultConfig.languageCode,
          enableAutomaticPunctuation: defaultConfig.enableAutomaticPunctuation,
          enableWordTimeOffsets: defaultConfig.enableWordTimeOffsets,
          enableWordConfidence: defaultConfig.enableWordConfidence,
          useEnhanced: defaultConfig.useEnhanced,
        },
      };

      console.log('📤 Sending long-running request to Google Cloud Speech API...');

      // Start the long-running operation
      const [operation] = await this.client.longRunningRecognize(request);
      console.log('🔄 Long-running operation started:', operation.name);

      // Wait for the operation to complete
      const [response] = await operation.promise();
      console.log('✅ Long-running operation completed');

      if (!response.results || response.results.length === 0) {
        throw new Error('No transcription results returned from long-running operation');
      }

      // Process the results (same as short audio)
      const result = response.results[0];
      const transcript = result.alternatives?.[0]?.transcript || '';
      const confidence = result.alternatives?.[0]?.confidence || 0;

      if (!transcript || transcript.trim().length === 0) {
        throw new Error('No valid transcript found in long-running operation');
      }

      // Extract word-level information
      const words = result.alternatives?.[0]?.words?.map((word: any) => ({
        word: word.word || '',
        startTime: word.startTime?.seconds ? parseFloat(word.startTime.seconds) : 0,
        endTime: word.endTime?.seconds ? parseFloat(word.endTime.seconds) : 0,
        confidence: word.confidence || 0,
      })) || [];

      const totalTime = words.length > 0 ? words[words.length - 1].endTime : 0;

      console.log('✅ Long audio transcription completed successfully');
      console.log(`📝 Transcript length: ${transcript.length} characters`);
      console.log(`🎯 Confidence: ${(confidence * 100).toFixed(1)}%`);

      return {
        transcript,
        confidence,
        words,
        languageCode: defaultConfig.languageCode,
        totalTime,
      };

    } catch (error) {
      console.error('❌ Long audio transcription failed:', error);
      
      // Check if it's a duration/limit error
      if (error instanceof Error && error.message.includes('duration limit')) {
        throw new Error('Audio file is too long for inline processing. Please use a shorter audio file (<10MB) or implement Google Cloud Storage integration.');
      }
      
      throw new Error(`Long audio transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
