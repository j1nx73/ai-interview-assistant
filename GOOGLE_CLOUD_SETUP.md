# Google Cloud Speech-to-Text Integration Setup Guide

This guide will help you set up Google Cloud Speech-to-Text integration for the AI Interview Assistant.

## Prerequisites

- Google Cloud account
- A Google Cloud project
- Basic knowledge of Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "ai-interview-assistant")
5. Click "Create"

## Step 2: Enable Required APIs

1. In your project, go to "APIs & Services" > "Library"
2. Search for and enable these APIs:
   - **Speech-to-Text API**
   - **Vertex AI API** (for future AI features)

## Step 3: Create a Service Account

1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Enter service account details:
   - Name: `speech-to-text-service`
   - Description: `Service account for Speech-to-Text API`
4. Click "Create and Continue"

## Step 4: Assign Permissions

1. Add these roles to your service account:
   - **Speech-to-Text Admin** (`roles/speech.admin`)
   - **Service Account Token Creator** (`roles/iam.serviceAccountTokenCreator`)
2. Click "Continue"
3. Click "Done"

## Step 5: Create and Download API Key

1. Click on your service account name
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Click "Create"
6. The JSON file will download automatically

## Step 6: Configure Environment Variables

1. Place the downloaded JSON file in your project (e.g., in a `credentials` folder)
2. Update your `.env` file with:

```env
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
VERTEX_AI_PROJECT=your-project-id
VERTEX_AI_LOCATION=us-central1
```

**Important**: Replace `your-project-id` with your actual Google Cloud project ID and update the path to your JSON key file.

## Step 7: Install Dependencies

The required packages are already installed:
- `@google-cloud/speech` - For Speech-to-Text API
- `@google-ai/generativelanguage` - For future AI features

## Step 8: Test the Integration

1. Start your development server: `npm run dev`
2. Go to `/speech-analysis` page
3. Try recording audio or uploading an audio file
4. Check the browser console for any error messages

## Troubleshooting

### Common Issues

1. **"Service not initialized" error**
   - Check that `GOOGLE_APPLICATION_CREDENTIALS` is set correctly
   - Verify the JSON file path is absolute and accessible
   - Ensure the service account has the correct permissions

2. **"Permission denied" error**
   - Verify the Speech-to-Text API is enabled
   - Check that the service account has the `speech.admin` role
   - Ensure the project is active and billing is enabled

3. **"File not found" error**
   - Double-check the path in `GOOGLE_APPLICATION_CREDENTIALS`
   - Use absolute paths (e.g., `/Users/username/project/credentials/key.json`)
   - Ensure the file exists and is readable

### Debug Steps

1. Check the browser console for detailed error messages
2. Verify environment variables are loaded correctly
3. Test the API endpoint: `GET /api/speech-to-text`
4. Check Google Cloud Console logs for API usage

## API Usage and Billing

### Speech-to-Text API Pricing

- **Standard models**: $0.006 per 15 seconds
- **Enhanced models**: $0.009 per 15 seconds
- **Long audio models**: $0.016 per 15 seconds

### Usage Limits

- **File size**: Maximum 10MB per request
- **Audio length**: Maximum 60 minutes
- **Supported formats**: MP3, WAV, M4A, OGG, FLAC, etc.

### Cost Optimization

1. Use standard models for basic transcription
2. Compress audio files before upload
3. Set up billing alerts to monitor costs
4. Use enhanced models only when needed

## Security Best Practices

1. **Never commit API keys to version control**
   - Add `*.json` to your `.gitignore` file
   - Use environment variables for sensitive data

2. **Restrict service account permissions**
   - Only grant necessary roles
   - Use principle of least privilege

3. **Monitor API usage**
   - Set up billing alerts
   - Review access logs regularly

4. **Rotate keys periodically**
   - Update service account keys every 90 days
   - Use different keys for different environments

## Production Deployment

### Environment Variables

For production, set these environment variables in your hosting platform:

```bash
GOOGLE_CLOUD_PROJECT=your-production-project-id
GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/service-account-key.json
VERTEX_AI_PROJECT=your-production-project-id
VERTEX_AI_LOCATION=us-central1
```

### File Storage

1. Store credentials securely (e.g., in environment variables or secure file storage)
2. Use production Google Cloud projects
3. Enable audit logging
4. Set up monitoring and alerting

## Next Steps

Once Speech-to-Text is working, you can:

1. **Integrate with Vertex AI** for advanced AI features
2. **Add real-time transcription** for live interviews
3. **Implement speech quality scoring** using AI models
4. **Add multi-language support** for international users
5. **Create speech analytics dashboard** with historical data

## Support

- [Google Cloud Speech-to-Text Documentation](https://cloud.google.com/speech-to-text/docs)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Cloud Support](https://cloud.google.com/support)

## Example Usage

### Basic Speech Recognition

```typescript
import { speechService } from '@/lib/google-cloud-speech'

// Process audio file
const result = await speechService.transcribeAudio(audioBuffer, {
  languageCode: 'en-US',
  encoding: 'MP3',
  enableAutomaticPunctuation: true
})

console.log('Transcript:', result.transcript)
console.log('Confidence:', result.confidence)
```

### Speech Analysis

```typescript
// Analyze speech patterns
const analysis = await speechService.analyzeSpeech(result)

console.log('Quality Score:', analysis.qualityScore)
console.log('Speaking Rate:', analysis.speakingRate)
console.log('Pause Analysis:', analysis.pauseAnalysis)
```

This setup will give you a powerful, enterprise-grade speech recognition system integrated with your AI Interview Assistant!
