# Troubleshooting Guide

Common issues and solutions for the StoryForge AI Gemini project.

## Installation Issues

### Node.js Version Problems

**Issue**: npm install fails with version errors

npm ERR! engine Unsupported engine


**Solution**:
1. Check your Node.js version: `node --version`
2. Upgrade to Node.js 16 or higher from [nodejs.org](https://nodejs.org)
3. Clear npm cache: `npm cache clean --force`
4. Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Permission Errors (macOS/Linux)

**Issue**: EACCES permission errors during npm install

**Solution**:

Option 1: Use npm prefix (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH


## Configuration Issues

### Environment Variables Not Loading

**Issue**: Server starts but API keys not recognized

**Solution**:
1. Verify `.env` file exists in `/backend` directory
2. Check file has no spaces around = signs:

GOOGLE_AI_API_KEY=your_key_here

NOT: GOOGLE_AI_API_KEY = your_key_here
3. Restart server after changing `.env`
4. Test environment loading:

console.log('Google Key:', process.env.GOOGLE_AI_API_KEY ? 'Loaded' : 'Missing');


### Invalid API Keys

**Issue**: API key errors from Google AI or Hugging Face

**Solutions**:

**Google AI Key:**
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Ensure you're signed in to the correct account
3. Create new API key if current one is invalid
4. Check for billing/quota limits

**Hugging Face Key:**
1. Visit [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Ensure token has "read" permissions
3. Try creating a new token
4. Key is optional - system works without it

## Runtime Issues

### Port Already in Use

**Issue**: 

Error: listen EADDRINUSE: address already in use :::3001


**Solutions**:
1. Change port in `.env`:

PORT=3002

2. Kill process using the port:

Find process
lsof -i :3001

Kill process
kill -9 <PID>

3. Use different port temporarily:

PORT=3002 npm start


### Story Generation Fails

**Issue**: Google AI errors or timeouts

**Common Causes & Solutions**:

**API Key Issues:**

{"error": "Google AI API key not configured"}

- Verify GOOGLE_AI_API_KEY in .env
- Check key is valid at Google AI Studio

**Quota Exceeded:**

{"error": "Google AI quota exceeded"}

- Check usage at [Google AI Studio](https://aistudio.google.com/)
- Wait for quota reset or upgrade plan

### Image Generation Always Using Placeholders

**Issue**: All image requests return placeholder images

**Diagnostic Steps**:
1. Check backend logs for specific error messages
2. Test each API individually

**Solutions**:
- Hugging Face: Ensure model license is accepted on their website
- Pollinations: May be temporarily down, try again later
- Check firewall/proxy settings blocking external APIs

## API Issues

### 400 Bad Request Errors

**Issue**: Request validation failing

**Solutions**:
1. Verify Content-Type header: `application/json`
2. Check request body format:

{
"prompt": "Your story here",
"genre": "Fantasy"
}

3. Ensure prompt is not empty
4. Check for JSON syntax errors

### 500 Internal Server Errors

**Issue**: Server-side errors

**Solutions**:
- Restart server: `npm start`
- Check all environment variables
- Verify API keys are valid
- Check internet connectivity

## Git and GitHub Issues

### Git Configuration

**Issue**: Author identity unknown errors

**Solution**:

git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"


### Push Rejected

**Issue**: `Updates were rejected` error

**Solution**:

git pull origin main --allow-unrelated-histories
git push origin main


## Getting Help

### Log Analysis
Always check server logs first:

npm start

Look for error messages, API responses, success indicators

### Testing APIs
Use curl or Postman to test endpoints directly:

Health check
curl http://localhost:3001/health

Story generation
curl -X POST http://localhost:3001/generate-story
-H "Content-Type: application/json"
-d '{"prompt": "test story"}'


### Common Log Messages

**✅ Success Messages:**

✅ Hugging Face succeeded!
✅ Pollinations succeeded!
🚀 StoryForge AI running on port 3001


**❌ Error Messages to Watch:**

❌ Hugging Face failed: 404
❌ Pollinations timeout
Google AI error: API_KEY_INVALID


Option 2: Fix permissions
sudo chown -R $(whoami) ~/.npm
