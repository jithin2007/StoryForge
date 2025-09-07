// StoryForge AI - Google Gemini Integration
// Dynamic frontend with comprehensive error handling and progress tracking

// Configuration
const API_BASE_URL = 'https://storyforge-pcf2.onrender.com/';
let currentStory = null;
let storyGallery = [];
let progressInterval = null;

// DOM Elements
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const loadingSubtext = document.getElementById('loadingSubtext');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const storyDisplay = document.getElementById('storyDisplay');
const generateBtn = document.getElementById('generateBtn');
const apiStatus = document.getElementById('apiStatus');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadStoriesFromStorage();
});

function initializeApp() {
    console.log('🚀 StoryForge AI initializing...');

    // Navigation event listeners
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.dataset.section;
            showSection(section);
        });
    });

    // Check backend connection
    checkBackendConnection();

    // Add keyboard shortcuts
    setupKeyboardShortcuts();

    // Update UI based on screen size
    handleResponsiveUpdates();
}

// Backend connection check with detailed status
async function checkBackendConnection() {
    updateApiStatus('checking', 'Connecting to AI backend...');

    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();

        if (response.ok) {
            console.log('✅ Backend connected:', data);

            if (data.apis.googleAI === 'configured') {
                updateApiStatus('connected', 'Google Gemini AI ready to generate stories!');
            } else {
                updateApiStatus('warning', 'Backend connected, but Google AI key needed');
            }
        } else {
            throw new Error('Backend responded with error');
        }
    } catch (error) {
        console.warn('⚠️ Backend connection failed:', error.message);
        updateApiStatus('error', 'Backend not connected. Please start the server.');
    }
}

function updateApiStatus(status, message) {
    if (!apiStatus) return;

    apiStatus.className = `api-status ${status}`;

    const icons = {
        checking: '<i class="fas fa-circle-notch fa-spin"></i>',
        connected: '<i class="fas fa-check-circle"></i>',
        warning: '<i class="fas fa-exclamation-triangle"></i>',
        error: '<i class="fas fa-times-circle"></i>'
    };

    apiStatus.innerHTML = `${icons[status]} <span>${message}</span>`;
}

// Navigation function
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionName).classList.add('active');

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Update gallery when switching to it
    if (sectionName === 'gallery') {
        updateGalleryDisplay();
    }
}

// Enhanced story generation with Google Gemini
async function generateStory() {
    const prompt = document.getElementById('storyPrompt').value.trim();
    const genre = document.getElementById('genre').value;
    const tone = document.getElementById('tone').value;
    const audience = document.getElementById('audience').value;
    const scenes = parseInt(document.getElementById('scenes').value);

    // Enhanced validation
    if (!prompt) {
        showError('Please enter a story idea to get started');
        document.getElementById('storyPrompt').focus();
        return;
    }

    if (prompt.length < 10) {
        showError('Please provide a more detailed story idea (at least 10 characters)');
        document.getElementById('storyPrompt').focus();
        return;
    }

    // Disable button and show loading
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fab fa-google"></i> <i class="fas fa-spinner fa-spin"></i> Generating...';
    showLoadingWithProgress('StoryForge is crafting your story...', 'This may take 30-60 seconds');

    try {
        // Step 1: Generate story text with Google Gemini
        updateLoadingWithProgress(15, 'Connecting to Google Gemini...', 'Sending your story idea to AI');

        const storyResponse = await fetch(`${API_BASE_URL}/generate-story`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt,
                genre,
                tone,
                audience,
                scenes
            }),
        });

        updateLoadingWithProgress(40, 'Processing AI response...', 'An LLM is creating your narrative');

        if (!storyResponse.ok) {
            const errorData = await storyResponse.json();
            throw new Error(errorData.error || `Story generation failed: ${storyResponse.status}`);
        }

        const storyData = await storyResponse.json();
        currentStory = storyData;

        // Step 2: Display story with placeholder images
        updateLoadingWithProgress(60, 'Preparing story display...', 'Formatting your story');
        displayStory(storyData);

        // Step 3: Generate images for each scene
        updateLoadingWithProgress(70, 'Creating scene illustrations...', 'This may take a moment for each image');
        await generateStoryImages(storyData.scenes);

        // Success
        updateLoadingWithProgress(100, 'Story complete!', 'Enjoy your AI-generated story');
        setTimeout(() => {
            hideLoading();
            showSuccess('Story generated successfully with LLM!');
            showSection('create');

            // Smooth scroll to story
            setTimeout(() => {
                document.getElementById('storyDisplay').scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 100);
        }, 1000);

        // Save to gallery
        saveStoryToGallery(storyData);

    } catch (error) {
        console.error('Generation error:', error);
        hideLoading();

        // Enhanced error messages
        let errorMessage = error.message;
        if (error.message.includes('Invalid Google AI API key')) {
            errorMessage = 'Google AI API key is invalid. Please check your .env file.';
        } else if (error.message.includes('quota')) {
            errorMessage = 'Google AI quota exceeded. Please check your usage limits.';
        } else if (error.message.includes('not configured')) {
            errorMessage = 'Google AI API key not configured. Please add it to backend/.env file.';
        }

        showError(errorMessage);
    } finally {
        // Re-enable button
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fab fa-google"></i> Generate with StoryForge';
    }
}

// Enhanced progress loading
function showLoadingWithProgress(title, subtitle) {
    loadingText.textContent = title;
    loadingSubtext.textContent = subtitle;
    progressFill.style.width = '0%';
    progressText.textContent = '0%';
    loadingOverlay.classList.remove('hidden');

    // Simulate progress
    let progress = 0;
    progressInterval = setInterval(() => {
        if (progress < 10) {
            progress += Math.random() * 2;
            updateProgress(progress);
        }
    }, 200);
}

function updateLoadingWithProgress(percentage, title, subtitle) {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }

    loadingText.textContent = title;
    loadingSubtext.textContent = subtitle;
    updateProgress(percentage);
}

function updateProgress(percentage) {
    const clampedPercentage = Math.min(100, Math.max(0, percentage));
    progressFill.style.width = clampedPercentage + '%';
    progressText.textContent = Math.round(clampedPercentage) + '%';
}

function hideLoading() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
    loadingOverlay.classList.add('hidden');
}

// Display story with enhanced formatting
function displayStory(storyData) {
    const storyTitle = document.getElementById('storyTitle');
    const storyGenre = document.getElementById('storyGenre');
    const storyTone = document.getElementById('storyTone');
    const storyAudience = document.getElementById('storyAudience');
    const storyScenes = document.getElementById('storyScenes');

    // Update header
    storyTitle.textContent = storyData.title;
    storyGenre.textContent = storyData.genre;
    storyTone.textContent = storyData.tone;
    storyAudience.textContent = storyData.audience;

    // Clear previous scenes
    storyScenes.innerHTML = '';

    // Create scene elements with animation
    storyData.scenes.forEach((scene, index) => {
        const sceneElement = createSceneElement(scene, index + 1);
        storyScenes.appendChild(sceneElement);

        // Animate scene appearance
        setTimeout(() => {
            sceneElement.style.opacity = '0';
            sceneElement.style.transform = 'translateY(20px)';
            sceneElement.style.transition = 'all 0.6s ease';

            setTimeout(() => {
                sceneElement.style.opacity = '1';
                sceneElement.style.transform = 'translateY(0)';
            }, 50);
        }, index * 200);
    });

    // Show story display
    storyDisplay.classList.remove('hidden');
}

// Create individual scene element
function createSceneElement(scene, sceneNumber) {
    const sceneDiv = document.createElement('div');
    sceneDiv.className = 'story-scene';
    sceneDiv.id = `scene-${scene.id}`;

    sceneDiv.innerHTML = `
        <div class="scene-content">
            <div class="scene-number">${sceneNumber}</div>
            <div class="scene-text">${scene.text}</div>
        </div>
        <div class="scene-image">
            <div class="image-loading">
                <i class="fas fa-paint-brush"></i>
                <br>Creating illustration...
                <div style="margin-top: 0.5rem; font-size: 0.75rem;">Using AI image generation</div>
            </div>
        </div>
    `;

    return sceneDiv;
}

// Generate images for all scenes with better error handling
async function generateStoryImages(scenes) {
    const totalScenes = scenes.length;

    for (let i = 0; i < totalScenes; i++) {
        const scene = scenes[i];
        try {
            const progress = 70 + ((i + 1) / totalScenes) * 25;
            updateLoadingWithProgress(
                progress, 
                `Generating images... (${i + 1}/${totalScenes})`, 
                `Creating illustration for scene ${i + 1}`
            );

            const imageResponse = await fetch(`${API_BASE_URL}/generate-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imagePrompt: scene.imagePrompt,
                    style: 'digital art, cinematic'
                }),
            });

            if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                updateSceneImage(scene.id, imageData.imageUrl, imageData.source, imageData.message);
            } else {
                console.warn(`Failed to generate image for scene ${scene.id}`);
                updateSceneImage(scene.id, null, 'failed');
            }

            // Small delay between requests to avoid overwhelming the API
            if (i < totalScenes - 1) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }

        } catch (error) {
            console.error(`Error generating image for scene ${scene.id}:`, error);
            updateSceneImage(scene.id, null, 'failed');
        }
    }
}

// Update scene image with enhanced display
function updateSceneImage(sceneId, imageUrl, source, message) {
    const sceneElement = document.getElementById(`scene-${sceneId}`);
    if (!sceneElement) return;

    const imageContainer = sceneElement.querySelector('.scene-image');

    if (imageUrl && imageUrl !== 'failed') {
        const sourceLabels = {
            'huggingface': 'Hugging Face AI',
            'deepai-free': 'DeepAI',
            'placeholder': 'Placeholder',
            'stability-ai': 'Stability AI'
        };

        const sourceLabel = sourceLabels[source] || source;

        imageContainer.innerHTML = `
            <img src="${imageUrl}" alt="Scene ${sceneId} illustration" loading="lazy" 
                 style="opacity: 0; transition: opacity 0.5s ease;" 
                 onload="this.style.opacity = 1;">
            <div style="font-size: 0.75rem; color: var(--text-light); margin-top: 0.5rem; text-align: center;">
                Generated by ${sourceLabel}
                ${message ? `<br><em>${message}</em>` : ''}
            </div>
        `;
    } else {
        imageContainer.innerHTML = `
            <div class="image-loading" style="background: #fee2e2; color: #dc2626; border-color: #fecaca;">
                <i class="fas fa-exclamation-triangle"></i>
                <br>Image generation unavailable
                <div style="margin-top: 0.5rem; font-size: 0.75rem;">
                    Add Hugging Face API key for images
                </div>
            </div>
        `;
    }
}

// Regenerate images for current story
async function regenerateImages() {
    if (!currentStory || !currentStory.scenes) {
        showError('No story loaded to regenerate images');
        return;
    }

    showLoadingWithProgress('Regenerating scene images...', 'Creating new illustrations');

    try {
        // Reset all images to loading state
        currentStory.scenes.forEach(scene => {
            const sceneElement = document.getElementById(`scene-${scene.id}`);
            if (sceneElement) {
                const imageContainer = sceneElement.querySelector('.scene-image');
                imageContainer.innerHTML = `
                    <div class="image-loading">
                        <i class="fas fa-paint-brush"></i>
                        <br>Creating new illustration...
                    </div>
                `;
            }
        });

        // Generate new images
        await generateStoryImages(currentStory.scenes);

        updateLoadingWithProgress(100, 'Images regenerated!', 'New illustrations ready');
        setTimeout(() => {
            hideLoading();
            showSuccess('Images regenerated successfully!');
        }, 1000);
    } catch (error) {
        hideLoading();
        showError('Failed to regenerate images: ' + error.message);
    }
}

// Form management
function clearForm() {
    document.getElementById('storyPrompt').value = '';
    document.getElementById('genre').value = 'Fantasy';
    document.getElementById('tone').value = 'Epic';
    document.getElementById('audience').value = 'Adults';
    document.getElementById('scenes').value = '4';
}

function clearStory() {
    storyDisplay.classList.add('hidden');
    currentStory = null;
    clearForm();
}

// Export story to PDF (placeholder)
function exportStory() {
    if (!currentStory) {
        showError('No story to export');
        return;
    }

    showSuccess('PDF export feature coming soon! For now, you can copy the text.');
}

// Gallery management
function saveStoryToGallery(storyData) {
    const galleryStory = {
        id: Date.now(),
        title: storyData.title,
        genre: storyData.genre,
        tone: storyData.tone,
        audience: storyData.audience,
        createdAt: new Date().toISOString(),
        thumbnail: null,
        scenes: storyData.scenes.length,
        generatedBy: storyData.generatedBy || 'StoryForge'
    };

    storyGallery.unshift(galleryStory);

    // Keep only last 20 stories
    if (storyGallery.length > 20) {
        storyGallery = storyGallery.slice(0, 20);
    }

    localStorage.setItem('storyGallery', JSON.stringify(storyGallery));
    updateGalleryDisplay();
}

function loadStoriesFromStorage() {
    try {
        const saved = localStorage.getItem('storyGallery');
        if (saved) {
            storyGallery = JSON.parse(saved);
            updateGalleryDisplay();
        }
    } catch (error) {
        console.warn('Failed to load stories from storage:', error);
        storyGallery = [];
    }
}

function updateGalleryDisplay() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;

    if (storyGallery.length === 0) {
        galleryGrid.innerHTML = `
            <div class="gallery-card placeholder">
                <div class="gallery-image">
                    <i class="fab fa-google"></i>
                </div>
                <div class="gallery-content">
                    <h4>Create your first story</h4>
                    <p>Stories generated with StoryForge will appear here</p>
                </div>
            </div>
        `;
        return;
    }

    galleryGrid.innerHTML = storyGallery.map(story => `
        <div class="gallery-card" onclick="viewStoryFromGallery('${story.id}')">
            <div class="gallery-image">
                <i class="fas fa-book-open"></i>
                <div style="position: absolute; top: 0.5rem; right: 0.5rem; background: var(--primary-color); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">
                    <i class="fab fa-google"></i>
                </div>
            </div>
            <div class="gallery-content">
                <h4>${story.title}</h4>
                <p>${story.genre} • ${story.tone} • ${story.scenes} scenes</p>
                <small>Created ${formatDate(story.createdAt)}</small>
            </div>
        </div>
    `).join('');
}

function viewStoryFromGallery(storyId) {
    // This would load and display a saved story
    showError('Story viewing from gallery coming soon!');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
        return 'today';
    } else if (diffInHours < 48) {
        return 'yesterday';
    } else {
        return date.toLocaleDateString();
    }
}

// Demo function with sample data
function showDemo() {
    const demoPrompts = [
        "A lonely robot discovers a glowing flower in the ruins of a post-apocalyptic city and learns about hope and friendship.",
        "A young witch starts a magical bakery where each pastry grants the eater a temporary superpower.",
        "An astronaut finds a planet where time flows backwards and must navigate this strange world to return home.",
        "A detective investigates mysterious disappearances in a small town where shadows come alive at night."
    ];

    const randomPrompt = demoPrompts[Math.floor(Math.random() * demoPrompts.length)];

    document.getElementById('storyPrompt').value = randomPrompt;
    document.getElementById('genre').value = "Sci-Fi";
    document.getElementById('tone').value = "Epic";
    document.getElementById('audience').value = "All Ages";
    document.getElementById('scenes').value = "4";

    showSection('create');

    // Focus and highlight the generate button
    setTimeout(() => {
        generateBtn.focus();
        generateBtn.style.animation = 'pulse 2s infinite';
        showSuccess('Demo prompt loaded! Click Generate to see StoryForge in action.');
        setTimeout(() => {
            generateBtn.style.animation = '';
        }, 6000);
    }, 500);
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Ctrl+Enter or Cmd+Enter to generate story
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            if (document.getElementById('create').classList.contains('active')) {
                event.preventDefault();
                generateStory();
            }
        }

        // Escape to close loading or clear form
        if (event.key === 'Escape') {
            if (!loadingOverlay.classList.contains('hidden')) {
                // Don't allow canceling during generation
                return;
            }
            if (document.getElementById('create').classList.contains('active')) {
                clearForm();
            }
        }
    });
}

// Responsive updates
function handleResponsiveUpdates() {
    window.addEventListener('resize', () => {
        // Handle any responsive updates needed
    });
}

// Message functions
function showSuccess(message) {
    const successEl = document.getElementById('successMessage');
    if (!successEl) return;

    successEl.querySelector('span').textContent = message;
    successEl.classList.remove('hidden');
    successEl.classList.add('show');

    setTimeout(() => {
        successEl.classList.remove('show');
        setTimeout(() => successEl.classList.add('hidden'), 300);
    }, 4000);
}

function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    if (!errorEl) return;

    errorEl.querySelector('#errorText').textContent = message;
    errorEl.classList.remove('hidden');
    errorEl.classList.add('show');

    setTimeout(() => {
        errorEl.classList.remove('show');
        setTimeout(() => errorEl.classList.add('hidden'), 300);
    }, 6000);
}

// Global error handler
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showError('An unexpected error occurred. Please try again.');
    event.preventDefault();
});

// Service worker registration (future enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Future: Add service worker for offline functionality
    });
}

console.log('🎯 StoryForge AI initialized');
console.log('🔗 Backend URL:', API_BASE_URL);
console.log('📚 Ready to create unlimited stories!');
