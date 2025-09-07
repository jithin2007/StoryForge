# Architecture Overview

This document provides a technical overview of the StoryForge AI Gemini system architecture, design decisions, and implementation details.

## System Architecture

┌─────────────────┐ ┌──────────────────┐ ┌─────────────────┐
│ │ │ │ │ │
│ Client/API │────│ Express.js │────│ Google Gemini │
│ Consumer │ │ Backend Server │ │ API │
│ │ │ │ │ │
└─────────────────┘ └──────────────────┘ └─────────────────┘
│
│
┌───────────┼───────────┐
│ │ │
┌───────▼────┐ ┌────▼─────┐ ┌──▼──────────┐
│ Hugging │ │Pollinations│ │ Fallback │
│ Face API │ │ AI │ │ Placeholders│
│ │ │ │ │ │
└────────────┘ └──────────── └─────────────┘


## Core Components

### 1. Express.js Backend Server
- **Purpose**: HTTP API server handling all client requests
- **Framework**: Express.js with middleware for CORS, JSON parsing
- **Port**: Configurable (default 3001)
- **Features**:
  - RESTful API endpoints
  - Comprehensive error handling
  - Request validation
  - Environment variable configuration

### 2. Story Generation Engine
- **Primary Provider**: Google Gemini 2.0 Flash
- **Input**: User prompts with optional parameters (genre, tone, audience, scenes)
- **Output**: Structured story with multiple scenes and auto-generated image prompts
- **Features**:
  - Dynamic prompt engineering
  - Scene-based story structure
  - Automatic image prompt generation
  - Genre and tone customization

### 3. Image Generation Pipeline
Multi-layered fallback system ensuring 99.9% availability:

#### Layer 1: Hugging Face (Optional)
- **Model**: Stable Diffusion variants
- **Requirement**: API key
- **Advantages**: High quality, consistent results
- **Output**: Base64-encoded images

#### Layer 2: Pollinations AI (Primary Free)
- **Provider**: Pollinations.ai
- **Requirement**: None (completely free)
- **Advantages**: No API key, unlimited usage
- **Output**: Direct image URLs
- **Retry Logic**: 3 attempts with progressive delays

#### Layer 3: Enhanced Placeholders (Fallback)
- **Provider**: via.placeholder.com
- **Requirement**: None
- **Features**: Colorful, styled placeholders with prompt text
- **Purpose**: Ensure UI never breaks

## Request Flow

### Story Generation Flow

Client Request → POST /generate-story

Validate request body (prompt, optional parameters)

Construct enhanced prompt for Google Gemini

Call Gemini API with structured prompt

Parse response into scenes

Generate image prompts for each scene

Return structured story with image prompts


### Image Generation Flow

Client Request → POST /generate-image

Validate image prompt

Try Hugging Face API (if configured)
├─ Success → Return base64 image
└─ Failure → Continue to next layer

Try Pollinations AI (with retry logic)
├─ Success → Return image URL
└─ Failure → Continue to fallback

Generate enhanced placeholder

Return result with source information


## Error Handling Strategy

### Graceful Degradation
- APIs failing doesn't break user experience
- Automatic fallback to next available service
- Informative error messages without technical details

### Retry Logic
- Pollinations: 3 attempts with exponential backoff
- Timeouts: 30 seconds for external APIs
- Circuit breaker pattern for failed services

## Security Considerations

### API Key Management
- Server-side only (never exposed to client)
- Environment variable configuration
- No hardcoded keys in source code

### Input Validation
- Request body validation
- Prompt length limits
- Parameter sanitization

## Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Runtime | Node.js | 16+ | JavaScript server environment |
| Framework | Express.js | 4.x | Web application framework |
| HTTP Client | Axios | 1.x | External API communication |
| AI API | Google Gemini | 2.0 Flash | Story generation |
| Image APIs | Various | - | Image generation services |
| Config | dotenv | 16.x | Environment variable management |
