# AI Integration Guide for ClosetBuddy

ClosetBuddy now includes powerful AI capabilities to enhance outfit suggestions, style analysis, and wardrobe management. This guide covers setup, configuration, and usage of the AI features.

## 🤖 Supported AI Providers

### 1. Hugging Face (Recommended for Free Tier)
- **Cost**: Free with generous limits
- **Setup**: No API key required for public models
- **Best for**: Getting started, basic style analysis
- **Models**: GPT-2, DialoGPT, and other open-source models

### 2. OpenAI
- **Cost**: Pay-per-use (~$5-20/month typical usage)
- **Setup**: Requires API key from platform.openai.com
- **Best for**: Advanced natural language processing, detailed descriptions
- **Models**: GPT-3.5-turbo, GPT-4

### 3. Anthropic Claude
- **Cost**: Pay-per-use, competitive pricing
- **Setup**: Requires API key from console.anthropic.com
- **Best for**: Thoughtful analysis, safety-focused responses
- **Models**: Claude-3-haiku, Claude-3-sonnet

### 4. Ollama (Local AI)
- **Cost**: Completely free
- **Setup**: Install Ollama locally
- **Best for**: Privacy, offline usage, no API costs
- **Models**: Llama2, Mistral, and other open-source models

## 🚀 Quick Setup

### Option 1: Hugging Face (Easiest)
```bash
# In your .env.local file
AI_SERVICE_PROVIDER=huggingface
# No API key required for basic usage
```

### Option 2: OpenAI
```bash
# Get API key from https://platform.openai.com
AI_SERVICE_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
```

### Option 3: Anthropic
```bash
# Get API key from https://console.anthropic.com
AI_SERVICE_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Option 4: Ollama (Local)
```bash
# Install Ollama first: https://ollama.ai
# Then pull a model:
ollama pull llama2

# In your .env.local file
AI_SERVICE_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
```

## 🎯 AI Features

### 1. Style Analysis
Analyzes your wardrobe to determine:
- Style personality (classic, trendy, casual, formal, eclectic, minimalist)
- Dominant color themes
- Preferred categories
- Risk tolerance
- Personalized recommendations

```typescript
import { AIUtils } from '@/lib/ai';

const analysis = await AIUtils.analyzeWardrobe(clothingItems);
console.log(analysis.data.stylePersonality); // "minimalist"
```

### 2. Outfit Descriptions
Generates engaging descriptions for outfit combinations:
- Stylish descriptions
- Style notes explaining why combinations work
- Occasion appropriateness
- Confidence scores

```typescript
const description = await AIUtils.describeOutfit(outfitItems, {
  occasion: 'work',
  season: 'fall',
  mood: 'professional'
});
```

### 3. Color Recommendations
Suggests complementary colors based on:
- Color harmony principles
- Occasion requirements
- Personal style preferences

```typescript
const colorRecs = await AIUtils.getColorRecommendations(['#000000', '#FFFFFF'], 'work');
```

### 4. Enhanced Outfit Engine
The `AIEnhancedOutfitEngine` combines rule-based algorithms with AI insights:

```typescript
import { AIEnhancedOutfitEngine } from '@/lib/ai';

const engine = new AIEnhancedOutfitEngine(clothingItems);
const suggestions = await engine.generateAIEnhancedSuggestions({
  useAI: true,
  occasion: 'work',
  maxItems: 5
});
```

## 🔧 Configuration Options

### Environment Variables
```bash
# Required
AI_SERVICE_PROVIDER=huggingface|openai|anthropic|ollama

# Provider-specific API keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
HUGGINGFACE_API_KEY=your_hf_key  # Optional for higher limits

# Ollama configuration
OLLAMA_BASE_URL=http://localhost:11434

# Model configuration (optional)
AI_MODEL_STYLE_ANALYSIS=gpt-3.5-turbo
AI_MODEL_TEXT_GENERATION=gpt-3.5-turbo
```

### Model Selection
Each provider uses optimized models for different tasks:

**Hugging Face**:
- Style Analysis: `microsoft/DialoGPT-medium`
- Text Generation: `gpt2`

**OpenAI**:
- All tasks: `gpt-3.5-turbo` (configurable)

**Anthropic**:
- All tasks: `claude-3-haiku-20240307`

**Ollama**:
- All tasks: `llama2` (or any installed model)

## 🧪 Testing AI Integration

Visit `/ai-test` in your application to:
- Check AI service status
- Test connection to your chosen provider
- Run sample style analysis
- Generate outfit descriptions
- Test color recommendations

Or use the API directly:
```bash
# Check status
curl http://localhost:3000/api/ai/test?action=status

# Test connection
curl http://localhost:3000/api/ai/test?action=test

# Test style analysis
curl http://localhost:3000/api/ai/test?action=analyze
```

## 📊 Usage Examples

### Basic Style Analysis
```typescript
import { OutfitSuggestionEngine } from '@/lib/outfitEngine';

const engine = new OutfitSuggestionEngine(items);

// Generate suggestions with AI enhancement
const suggestions = await engine.generateEnhancedSuggestions({
  useAI: true,
  occasion: 'work',
  season: 'fall'
});

// Each suggestion now includes AI-generated descriptions
suggestions.forEach(suggestion => {
  console.log(suggestion.aiDescription);
  console.log(suggestion.aiRecommendations);
});
```

### Advanced AI Features
```typescript
import { AIEnhancedOutfitEngine } from '@/lib/ai';

const aiEngine = new AIEnhancedOutfitEngine(items);

// Generate AI style profile
const profile = await aiEngine.generateAIStyleProfile();

// Get AI-enhanced suggestions
const suggestions = await aiEngine.generateAIEnhancedSuggestions({
  useAI: true,
  personalityWeight: 0.8,
  descriptionDetail: 'comprehensive'
});
```

## 🔒 Privacy & Security

### Data Handling
- **Hugging Face**: Data sent to Hugging Face servers
- **OpenAI**: Data sent to OpenAI servers (follows their privacy policy)
- **Anthropic**: Data sent to Anthropic servers (constitutional AI approach)
- **Ollama**: All processing happens locally, no data leaves your machine

### Recommendations
- For maximum privacy: Use Ollama
- For best free option: Use Hugging Face
- For best quality: Use OpenAI or Anthropic with API keys

## 🚨 Troubleshooting

### Common Issues

**"AI services not configured"**
- Check your `.env.local` file
- Ensure `AI_SERVICE_PROVIDER` is set
- Verify API keys are correct

**"Connection failed"**
- For Ollama: Ensure Ollama is running (`ollama serve`)
- For API providers: Check your internet connection and API key validity
- Check rate limits on your API provider

**"Model not found"**
- For Ollama: Pull the model first (`ollama pull llama2`)
- For other providers: Check if the model name is correct

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=ai:*
```

## 🔄 Fallback Behavior

The AI system is designed to gracefully handle failures:
1. If AI is unavailable, falls back to rule-based algorithms
2. If one AI call fails, continues with cached or default responses
3. Always provides meaningful outfit suggestions, with or without AI

## 📈 Performance Tips

1. **Caching**: AI responses are cached to improve performance
2. **Batch Processing**: Process multiple outfits together when possible
3. **Model Selection**: Choose appropriate models for your use case
4. **Rate Limiting**: Be mindful of API rate limits

## 🔮 Future Enhancements

Planned AI features:
- Image analysis for clothing items
- Trend prediction based on fashion data
- Personalized shopping recommendations
- Weather-aware outfit suggestions
- Social media integration for style inspiration

---

For more information, visit the [ClosetBuddy documentation](README.md) or check the `/ai-test` page in your application.
