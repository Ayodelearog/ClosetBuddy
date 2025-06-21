// AI Service Configuration
export interface AIConfig {
	provider: "huggingface" | "openai" | "anthropic" | "ollama"
	apiKey?: string
	baseUrl?: string
	models: {
	  styleAnalysis: string
	  textGeneration: string
	  colorAnalysis: string
	  outfitDescription: string
	  imageAnalysis?: string // Added for clothing image analysis
	}
  }
  
  export const getAIConfig = (): AIConfig => {
	const provider = (process.env.AI_SERVICE_PROVIDER || "huggingface") as AIConfig["provider"]
  
	const configs: Record<AIConfig["provider"], AIConfig> = {
	  huggingface: {
		provider: "huggingface",
		apiKey: process.env.HUGGINGFACE_ACCESS_TOKEN,
		baseUrl: "https://api-inference.huggingface.co",
		models: {
		  // Better models for fashion/clothing tasks
		  styleAnalysis: "microsoft/DialoGPT-medium", // For conversational style advice
		  textGeneration: "microsoft/DialoGPT-medium", // For generating fashion advice
		  colorAnalysis: "google/vit-base-patch16-224", // Vision model for color detection
		  outfitDescription: "Salesforce/blip-image-captioning-base", // Image-to-text for outfit descriptions
		  imageAnalysis: "google/vit-base-patch16-224", // For general clothing image analysis
		},
	  },
	  openai: {
		provider: "openai",
		apiKey: process.env.OPENAI_API_KEY,
		models: {
		  styleAnalysis: "gpt-4o", // Better for complex analysis
		  textGeneration: "gpt-4o",
		  colorAnalysis: "gpt-4o", // Can handle image inputs
		  outfitDescription: "gpt-4o",
		  imageAnalysis: "gpt-4o",
		},
	  },
	  anthropic: {
		provider: "anthropic",
		apiKey: process.env.ANTHROPIC_API_KEY,
		models: {
		  styleAnalysis: "claude-3-5-sonnet-20241022", // Latest model with vision
		  textGeneration: "claude-3-5-sonnet-20241022",
		  colorAnalysis: "claude-3-5-sonnet-20241022",
		  outfitDescription: "claude-3-5-sonnet-20241022",
		  imageAnalysis: "claude-3-5-sonnet-20241022",
		},
	  },
	  ollama: {
		provider: "ollama",
		baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
		models: {
		  styleAnalysis: "llava", // Multimodal model for image + text
		  textGeneration: "llama3.1",
		  colorAnalysis: "llava",
		  outfitDescription: "llava",
		  imageAnalysis: "llava",
		},
	  },
	}
  
	return configs[provider]
  }
  
  export const validateAIConfig = (config: AIConfig): boolean => {
	switch (config.provider) {
	  case "huggingface":
		// Hugging Face Inference API typically requires a token
		return !!config.apiKey && !!config.baseUrl
	  case "ollama":
		return !!config.baseUrl
	  case "openai":
	  case "anthropic":
		return !!config.apiKey
	  default:
		return false
	}
  }
  
  // Fashion-specific model recommendations for Hugging Face
  export const FASHION_MODELS = {
	// For clothing classification
	clothingClassification: "microsoft/swin-base-patch4-window7-224",
  
	// For color detection in images
	colorDetection: "google/vit-base-patch16-224",
  
	// For fashion image captioning
	fashionCaptioning: "Salesforce/blip-image-captioning-base",
  
	// For style transfer or generation
	styleGeneration: "runwayml/stable-diffusion-v1-5",
  
	// For text-based fashion advice
	fashionAdvice: "microsoft/DialoGPT-medium",
  } as const
  