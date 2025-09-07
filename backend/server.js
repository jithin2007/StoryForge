require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Health check endpoint
app.get('/health', (req, res) => {
  const hasGoogleAI = !!process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== 'your_google_ai_api_key_here';
  const hasHuggingFace = !!process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== 'your_huggingface_key_here';

  res.json({ 
    status: 'Backend is running with Google Gemini',
    timestamp: new Date().toISOString(),
    apis: {
      googleAI: hasGoogleAI ? 'configured' : 'missing key',
      huggingFace: hasHuggingFace ? 'configured' : 'missing key (optional)',
      pollinations: 'always free (no key needed)',
      imageGeneration: 'multiple free APIs available'
    }
  });
});

// Generate story using Google Gemini
app.post('/generate-story', async (req, res) => {
  const { prompt, genre = 'Fantasy', tone = 'Epic', audience = 'Adults', scenes = 4 } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Story prompt is required' });
  }

  if (!process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY === 'your_google_ai_api_key_here') {
    return res.status(500).json({ 
      error: 'Google AI API key not configured',
      instructions: 'Please add your Google AI Studio API key to the .env file'
    });
  }

  const systemPrompt = `You are a master storyteller specialized in creating engaging ${genre} stories with a ${tone} tone for ${audience}.

Create a compelling story based on the user's prompt, structured into exactly ${scenes} distinct scenes.

Requirements:
- Each scene should be 2-3 sentences long
- Include vivid descriptions that can be visualized
- Maintain consistent characters and settings
- Build toward a satisfying conclusion
- Make each scene flow naturally into the next

Format your response as exactly ${scenes} paragraphs, each representing one scene, separated by double line breaks.

Story prompt: ${prompt}`;

  try {
    // Use Gemini model for text generation
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const storyText = response.text();

    // Split story into scenes
    const storyScenes = storyText.split('\n\n').filter(scene => scene.trim().length > 0);

    // Generate image prompts for each scene
    const scenesWithPrompts = storyScenes.map((sceneText, index) => ({
      id: index + 1,
      text: sceneText.trim(),
      imagePrompt: generateImagePrompt(sceneText, genre, tone)
    }));

    res.json({ 
      title: generateStoryTitle(prompt, genre),
      genre,
      tone,
      audience,
      scenes: scenesWithPrompts,
      totalScenes: scenesWithPrompts.length,
      generatedBy: 'Google Gemini Pro'
    });

  } catch (error) {
    console.error('Google AI error:', error);

    // Provide helpful error messages
    let errorMessage = 'Failed to generate story';
    if (error.message.includes('API_KEY_INVALID')) {
      errorMessage = 'Invalid Google AI API key. Please check your key in the .env file.';
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      errorMessage = 'Google AI quota exceeded. Please check your usage limits.';
    } else if (error.message.includes('PERMISSION_DENIED')) {
      errorMessage = 'Permission denied. Make sure your Google AI API key has the correct permissions.';
    }

    res.status(500).json({ 
      error: errorMessage,
      details: error.message,
      solution: 'Check your Google AI Studio API key and quota at https://aistudio.google.com/'
    });
  }
});

// Pollinations AI - Completely Free Image Generation
async function generateImageWithPollinations(prompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🎨 Pollinations attempt ${attempt}/${retries}...`);
      
      // Clean prompt and create URL
      const cleanPrompt = encodeURIComponent(prompt.substring(0, 150));
      const seed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=1024&seed=${seed}&enhance=true&nologo=true`;
      
      // Test URL with longer timeout
      const response = await axios.get(imageUrl, { 
        timeout: 25000,
        responseType: 'arraybuffer'
      });
      
      if (response.status === 200 && response.data.length > 1000) {
        console.log('✅ Pollinations succeeded!');
        return imageUrl;
      }
      
      throw new Error('Invalid image response');
      
    } catch (error) {
      console.log(`❌ Pollinations attempt ${attempt} failed:`, error.message);
      
      if (attempt < retries) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  throw new Error('All Pollinations attempts failed');
}

// Alternative free image service
async function generateImageWithPicsum(prompt) {
  try {
    console.log('🖼️ Trying Picsum with overlay...');
    
    // Use Picsum for base image and add text overlay
    const seed = Math.floor(Math.random() * 1000);
    const baseUrl = `https://picsum.photos/seed/${seed}/1024/1024`;
    
    // Create a simple URL-based image with text (using a service that adds text to images)
    const encodedPrompt = encodeURIComponent(prompt.substring(0, 50));
    const imageUrl = `https://via.placeholder.com/1024x1024/4a90e2/ffffff?text=${encodedPrompt}`;
    
    console.log('✅ Picsum placeholder succeeded!');
    return imageUrl;
    
  } catch (error) {
    throw new Error('Picsum failed');
  }
}

// Generate image using multiple FREE APIs
app.post('/generate-image', async (req, res) => {
  const { imagePrompt, style = 'digital art' } = req.body;

  if (!imagePrompt) {
    return res.status(400).json({ error: 'Image prompt is required' });
  }

  const enhancedPrompt = `${imagePrompt}, ${style}, high quality, detailed`;

  try {
    // Try Hugging Face first (if configured)
    if (process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== 'your_huggingface_key_here') {
      try {
        console.log('🤗 Trying Hugging Face...');
        
        const hfResponse = await axios.post(
          'https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4',
          { inputs: enhancedPrompt },
          {
            headers: {
              'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
              'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer',
            timeout: 30000
          }
        );

        if (hfResponse.data && hfResponse.data.length > 1000) {
          const imageBuffer = Buffer.from(hfResponse.data);
          const imageBase64 = imageBuffer.toString('base64');
          const imageUrl = `data:image/png;base64,${imageBase64}`;

          console.log('✅ Hugging Face succeeded!');
          return res.json({ imageUrl, source: 'huggingface' });
        }

      } catch (hfError) {
        console.log('❌ Hugging Face failed:', hfError.response?.status || hfError.message);
      }
    }

    // Try Pollinations AI (completely free)
    try {
      const pollinationsUrl = await generateImageWithPollinations(enhancedPrompt, 3);
      
      return res.json({ 
        imageUrl: pollinationsUrl, 
        source: 'pollinations',
        message: ''
      });

    } catch (pollinationsError) {
      console.log('❌ Pollinations failed:', pollinationsError.message);
    }

    // Try alternative free service
    try {
      const picsumUrl = await generateImageWithPicsum(enhancedPrompt);
      
      return res.json({ 
        imageUrl: picsumUrl, 
        source: 'picsum-placeholder',
        message: 'Using placeholder image service'
      });

    } catch (picsumError) {
      console.log('❌ Picsum failed:', picsumError.message);
    }

    // Final fallback - enhanced placeholder
    console.log('🎨 Using enhanced placeholder...');
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEAA7', 'DDA0DD', 'FFB6C1', '87CEEB'];
    const bgColor = colors[Math.floor(Math.random() * colors.length)];
    const seed = Math.floor(Math.random() * 1000);
    
    const placeholderText = encodeURIComponent(`AI Art: ${imagePrompt.substring(0, 30)}...`);
    const placeholderUrl = `https://via.placeholder.com/1024x1024/${bgColor}/ffffff?text=${placeholderText}`;

    res.json({ 
      imageUrl: placeholderUrl,
      source: 'enhanced-placeholder',
      message: 'All image APIs temporarily unavailable. Using styled placeholder.'
    });

  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate image',
      details: error.message
    });
  }
});

// Batch generate images for all scenes
app.post('/generate-story-images', async (req, res) => {
  const { scenes } = req.body;

  if (!scenes || !Array.isArray(scenes)) {
    return res.status(400).json({ error: 'Scenes array is required' });
  }

  try {
    const imagesPromises = scenes.map(async (scene, index) => {
      try {
        // Add progressive delay to avoid overwhelming free APIs
        await new Promise(resolve => setTimeout(resolve, index * 3000));

        const imageResponse = await axios.post(`http://localhost:${process.env.PORT || 3001}/generate-image`, {
          imagePrompt: scene.imagePrompt,
          style: 'cinematic digital art'
        });

        return {
          sceneId: scene.id,
          imageUrl: imageResponse.data.imageUrl,
          source: imageResponse.data.source,
          message: imageResponse.data.message
        };
      } catch (error) {
        const colors = ['FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEAA7'];
        const bgColor = colors[Math.floor(Math.random() * colors.length)];
        
        return {
          sceneId: scene.id,
          imageUrl: `https://via.placeholder.com/1024x1024/${bgColor}/ffffff?text=Scene+${scene.id}`,
          source: 'fallback-placeholder',
          error: error.message
        };
      }
    });

    const images = await Promise.all(imagesPromises);
    res.json({ images });

  } catch (error) {
    console.error('Batch image generation error:', error);
    res.status(500).json({ error: 'Failed to generate images' });
  }
});

// Generate story with Hugging Face as alternative
app.post('/generate-story-huggingface', async (req, res) => {
  const { prompt, genre = 'Fantasy', tone = 'Epic', audience = 'Adults' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Story prompt is required' });
  }

  if (!process.env.HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY === 'your_huggingface_key_here') {
    return res.status(500).json({ 
      error: 'Hugging Face API key not configured',
      instructions: 'Please add your Hugging Face API key to the .env file'
    });
  }

  try {
    const systemPrompt = `Write a ${genre} story with ${tone} tone for ${audience}:\n\n${prompt}`;

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
      { inputs: systemPrompt },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const storyText = response.data[0]?.generated_text || 'Story generation failed';

    res.json({ 
      story: storyText,
      generatedBy: 'Hugging Face'
    });

  } catch (error) {
    console.error('Hugging Face error:', error);
    res.status(500).json({ 
      error: 'Failed to generate story with Hugging Face',
      details: error.message
    });
  }
});

// Helper functions
function generateImagePrompt(sceneText, genre, tone) {
  // Create detailed image prompt from scene text
  const sceneWords = sceneText.split(' ').slice(0, 20).join(' ');
  return `${sceneWords}, ${genre.toLowerCase()} style, ${tone.toLowerCase()} mood, cinematic lighting, highly detailed digital art`;
}

function generateStoryTitle(prompt, genre) {
  const words = prompt.split(' ').slice(0, 4);
  const title = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return `${title}: A ${genre} Story`;
}

function getRandomColor() {
  const colors = ['4f46e5', '06b6d4', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 'f97316', 'ec4899'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 StoryForge AI running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
