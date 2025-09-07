# StoryForge AI Gemini

🚀 **AI-powered story and image generation platform using Google Gemini and multiple free text-to-image APIs**

Generate immersive multi-scene fantasy stories with corresponding AI-generated images. This project combines Google Gemini's powerful text generation with free image APIs to create complete visual storytelling experiences.

## ✨ Features

- **Multi-scene story generation** using Google Gemini 2.0 Flash
- **AI-generated images** for each scene using multiple free APIs
- **Robust fallback system** with Hugging Face, Pollinations AI, and styled placeholders
- **Express.js backend** with comprehensive REST API endpoints
- **Zero-cost image generation** with optional premium upgrades
- **Professional error handling** and automatic API failover
- **Batch image processing** for complete story visualization

## 🎯 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Git
- Google AI Studio API key (required)
- Hugging Face API key (optional, for better image quality)

### Installation

Clone the repository
git clone https://github.com/jithin2007/StoryForge.git

Navigate to backend directory
cd StoryForge/backend

Install dependencies
npm install

Configure environment variables
cp .env.example .env

Edit .env with your API keys
Start the server
npm start


Your backend will be running on `http://localhost:3001`

### Basic Usage

Generate a story
curl -X POST http://localhost:3001/generate-story
-H "Content-Type: application/json"
-d '{"prompt": "A space explorer discovers a mysterious planet"}'

Generate an image
curl -X POST http://localhost:3001/generate-image
-H "Content-Type: application/json"
-d '{"imagePrompt": "A futuristic spaceship on an alien world"}'


## 📖 Documentation

| File | Description |
|------|-------------|
| [Setup Guide](./docs/setup.md) | Detailed installation and configuration |
| [API Reference](./docs/api.md) | Complete API endpoints documentation |
| [Architecture](./docs/architecture.md) | System design and technical overview |
| [Troubleshooting](./docs/troubleshooting.md) | Common issues and solutions |

## 🔧 Configuration

Create a `.env` file in the `backend/` directory:

GOOGLE_AI_API_KEY=your_google_ai_key_here
HUGGINGFACE_API_KEY=your_huggingface_key_here # Optional
PORT=3001


## 🎨 API Endpoints

- `POST /generate-story` - Generate multi-scene stories
- `POST /generate-image` - Generate single images
- `POST /generate-story-images` - Batch generate images for all scenes
- `GET /health` - Health check and API status

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini for powerful story generation
- Hugging Face for image generation models
- Pollinations AI for free image generation
- The open source community
