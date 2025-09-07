# Setup Guide

This guide will walk you through setting up the StoryForge AI Gemini project from scratch.

## System Requirements

- **Node.js**: Version 16.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: Latest version
- **Operating System**: Windows, macOS, or Linux

## Step 1: Clone the Repository

git clone https://github.com/jithin2007/StoryForge.git
cd StoryForge


## Step 2: Install Dependencies

Navigate to the backend directory and install required packages:

cd backend
npm install


This will install all necessary dependencies including:
- Express.js for the web server
- Axios for HTTP requests
- Google Generative AI SDK
- CORS for cross-origin requests
- dotenv for environment variables

## Step 3: Configure Environment Variables

1. **Copy the example environment file:**


2. **Edit the `.env` file** with your preferred text editor:

nano .env # or use any text editor


3. **Add your API keys:**

GOOGLE_AI_API_KEY=your_actual_google_ai_key_here
HUGGINGFACE_API_KEY=your_huggingface_key_here # Optional
PORT=3001


## Step 4: Obtain API Keys

### Google AI Studio API Key (Required)

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" in the left sidebar
4. Create a new API key
5. Copy and paste it into your `.env` file

### Hugging Face API Key (Optional)

1. Sign up at [Hugging Face](https://huggingface.co/)
2. Go to Settings > Access Tokens
3. Create a new token with "read" permissions
4. Copy and paste it into your `.env` file

**Note:** Hugging Face key is optional. The system will use free alternatives like Pollinations AI if not provided.

## Step 5: Start the Server

npm start


## Step 6: Test the Installation

Open another terminal and test the health endpoint:

curl http://localhost:3001/health


You should receive a JSON response with the system status.

## Troubleshooting Setup Issues

### Port Already in Use
If port 3001 is occupied, change the PORT value in your `.env` file:

PORT=3002


### Permission Errors
On macOS/Linux, you might need to use `sudo` for global npm installations:

sudo npm install -g npm@latest


### API Key Issues
- Ensure API keys have no extra spaces
- Verify keys are valid by testing them directly with the respective services
- Check that environment variables are loaded by adding console logs

## Next Steps

Once setup is complete:
1. Read the [API Documentation](./api.md)
2. Explore the [Architecture Overview](./architecture.md)
3. Check [Troubleshooting](./troubleshooting.md) for common issues
