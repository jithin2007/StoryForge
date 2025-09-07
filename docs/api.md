# API Reference

Complete documentation for all StoryForge AI Gemini API endpoints.

## Base URL

http://localhost:3001


## Authentication

No authentication required for basic usage. API keys are configured server-side.

---

## Endpoints

### GET /health

Check server status and configured APIs.

**Response:**

"status": "Backend is running with Google Gemini",
"timestamp": "2025-09-07T11:30:00.000Z",
"apis": {
"googleAI": "configured",
"huggingFace": "configured",
"pollinations": "always free (no key needed)",
"imageGeneration": "multiple free APIs available"
}
}


---

### POST /generate-story

Generate a multi-scene story with image prompts.

**Request Body:**
{
"prompt": "A brave knight embarks on a quest to save the kingdom",
"genre": "Fantasy", // Optional: Fantasy, Sci-Fi, Adventure, etc.
"tone": "Epic", // Optional: Epic, Dark, Light, Mysterious, etc.
"audience": "Adults", // Optional: Adults, Children, Young Adult
"scenes": 4 // Optional: Number of scenes (1-10)
}


**Response:**

{
"title": "A Brave Knight Embarks On: A Fantasy Story",
"genre": "Fantasy",
"tone": "Epic",
"audience": "Adults",
"scenes": [
{
"id": 1,
"text": "Sir Galahad rode through the misty forest, his armor gleaming in the pale moonlight. The ancient prophecy echoed in his mind as he approached the cursed castle.",
"imagePrompt": "Sir Galahad rode through the misty forest, his armor gleaming in the pale moonlight, fantasy style, epic mood, cinematic lighting, highly detailed digital art"
}
],
"totalScenes": 4,
"generatedBy": "Google Gemini Pro"
}


**Error Response:**
{
"error": "Story prompt is required",
"details": "Request body must include 'prompt' field"
}


---

### POST /generate-image

Generate a single image from a text prompt.

**Request Body:**

{
"imagePrompt": "A majestic dragon soaring over mountains at sunset",
"style": "digital art" // Optional: digital art, photorealistic, painting, etc.
}

**Response:**
{
"imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
"source": "huggingface",
"message": "Generated with Hugging Face"
}

**Possible Sources:**
- `huggingface` - Generated using Hugging Face Stable Diffusion
- `pollinations` - Generated using Pollinations AI (free)
- `deepai-demo` - Generated using DeepAI demo key
- `placeholder` - Styled placeholder when APIs unavailable

---

### POST /generate-story-images

Batch generate images for all scenes in a story.

**Request Body:**
{
"scenes": [
{
"id": 1,
"imagePrompt": "A knight in shining armor riding through a forest"
},
{
"id": 2,
"imagePrompt": "A dark castle on a hilltop under stormy skies"
}
]
}

**Response:**

{
"images": [
{
"sceneId": 1,
"imageUrl": "https://image.pollinations.ai/prompt/...",
"source": "pollinations",
"message": "Generated with Pollinations AI - completely free!"
},
{
"sceneId": 2,
"imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
"source": "huggingface"
}
]
}

---

## Rate Limits

- **Story Generation**: No hard limits (depends on Google AI quota)
- **Image Generation**: 3-second delays between batch requests to avoid rate limiting
- **Free APIs**: May have temporary rate limits during high usage

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid request body |
| 500  | Internal Server Error - API failure or configuration issue |
| 502  | Bad Gateway - External API unavailable |

## Example Usage

### JavaScript/Node.js
const axios = require('axios');

// Generate a story
const generateStory = async () => {
try {
const response = await axios.post('http://localhost:3001/generate-story', {
prompt: 'A magical adventure in an enchanted forest',
genre: 'Fantasy',
scenes: 3
});
console.log(response.data);
} catch (error) {
console.error('Error:', error.response.data);
}
};

### curl
Generate story
curl -X POST http://localhost:3001/generate-story
-H "Content-Type: application/json"
-d '{
"prompt": "A detective solves a mystery in a futuristic city",
"genre": "Sci-Fi",
"tone": "Dark",
"scenes": 4
}'

Generate image
curl -X POST http://localhost:3001/generate-image
-H "Content-Type: application/json"
-d '{
"imagePrompt": "A cyberpunk detective in a neon-lit street",
"style": "digital art"
}'

