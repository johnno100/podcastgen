# Deployment Guide for Podcast Generator MVP

This guide provides instructions for deploying the Podcast Generator MVP to Google Cloud Platform.

## Prerequisites

1. Google Cloud Platform account
2. Google Cloud SDK installed and configured
3. Docker installed locally
4. API keys for:
   - Google Gemini
   - Anthropic Claude
   - ElevenLabs

## Local Development Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your API keys
3. Run the application using Docker Compose:

```bash
docker-compose up
```

The application will be available at http://localhost:4200

## Deployment to Google Cloud

### Manual Deployment

1. Build the Docker image:

```bash
docker build -t gcr.io/[PROJECT_ID]/podcast-generator:latest .
```

2. Push the image to Google Container Registry:

```bash
docker push gcr.io/[PROJECT_ID]/podcast-generator:latest
```

3. Deploy to Cloud Run:

```bash
gcloud run deploy podcast-generator \
  --image gcr.io/[PROJECT_ID]/podcast-generator:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --set-env-vars NODE_ENV=production
```

### Continuous Deployment with Cloud Build

1. Connect your GitHub repository to Google Cloud Build
2. Create a Cloud Build trigger that uses the `cloudbuild.yaml` configuration
3. Set up Secret Manager secrets for your API keys:
   - `GEMINI_API_KEY`
   - `CLAUDE_API_KEY`
   - `ELEVENLABS_API_KEY`
4. Update the Cloud Run service to use these secrets as environment variables

## Environment Variables

The application requires the following environment variables:

- `GEMINI_API_KEY`: API key for Google Gemini
- `CLAUDE_API_KEY`: API key for Anthropic Claude
- `ELEVENLABS_API_KEY`: API key for ElevenLabs
- `OUTPUT_DIRECTORY`: Directory for storing generated podcasts (default: `/tmp/podcast-output`)
- `NODE_ENV`: Environment mode (`development` or `production`)

## Monitoring and Logging

- Cloud Run provides built-in logging through Cloud Logging
- The application uses Winston for structured logging
- Monitor application performance through Cloud Monitoring

## Scaling

The application is configured to run with 1 CPU and 1GB of memory. Adjust these values based on your workload requirements.

## Security Considerations

- API keys are stored as environment variables and should be managed securely
- The application is configured to allow unauthenticated access for the MVP
- For production use, consider adding authentication and authorization
