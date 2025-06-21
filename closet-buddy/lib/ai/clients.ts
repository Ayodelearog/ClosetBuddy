import { InferenceClient } from "@huggingface/inference"
import type { AIConfig, AIResponse, StyleAnalysisOutput } from "@/types"

export class AIClients {
  private config: AIConfig
  private hfClient: InferenceClient | null = null

  constructor(config: AIConfig) {
    this.config = config
    this.initializeClients()
  }

  private initializeClients() {
    switch (this.config.provider) {
      case "huggingface":
        if (!this.config.apiKey) {
          console.warn("Hugging Face API key not configured - some features may be limited")
          // Still initialize client for public models, but with limited functionality
          this.hfClient = new InferenceClient()
        } else {
          this.hfClient = new InferenceClient(this.config.apiKey)
        }
        break
      case "openai":
        // handle openai initialization
        break
      case "anthropic":
        // handle anthropic initialization
        break
      case "ollama":
        // handle ollama initialization
        break
    }
  }

  async analyzeStyle(prompt: string): Promise<AIResponse> {
    switch (this.config.provider) {
      case "huggingface":
        return this.analyzeStyleWithHuggingFace(prompt)
      default:
        return { success: false, error: "Unsupported AI provider" }
    }
  }

  private async analyzeStyleWithHuggingFace(prompt: string): Promise<AIResponse> {
    if (!this.hfClient) throw new Error("Hugging Face client not initialized")

    try {
      // Use a more fashion-focused prompt
      const fashionPrompt = `As a professional fashion stylist, ${prompt}
    
    Please analyze the wardrobe and provide insights in this exact JSON format:
    {
      "stylePersonality": "classic|trendy|casual|formal|eclectic|minimalist",
      "dominantThemes": ["theme1", "theme2", "theme3"],
      "colorPalette": ["#color1", "#color2", "#color3"],
      "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
      "confidence": 0.8
    }`

      const response = await this.hfClient.textGeneration({
        model: this.config.models.styleAnalysis,
        inputs: fashionPrompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false,
        },
      })

      const result = this.parseStyleAnalysisResponse(response.generated_text)
      return {
        success: true,
        data: result,
        confidence: result.confidence || 0.7,
      }
    } catch (error) {
      console.warn("Hugging Face style analysis failed:", error)
      return {
        success: false,
        error: `Hugging Face error: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  private parseStyleAnalysisResponse(responseText: string): StyleAnalysisOutput {
    try {
      const parsed = JSON.parse(responseText)
      return {
        stylePersonality: parsed.stylePersonality || "unknown",
        dominantThemes: parsed.dominantThemes || [],
        colorPalette: parsed.colorPalette || [],
        recommendations: parsed.recommendations || [],
        confidence: parsed.confidence || 0.5,
      }
    } catch (error) {
      console.warn("Failed to parse style analysis response:", error)
      return {
        stylePersonality: "unknown",
        dominantThemes: [],
        colorPalette: [],
        recommendations: [],
        confidence: 0.3,
      }
    }
  }

  async analyzeClothingImage(imageFile: File): Promise<AIResponse> {
    if (!this.hfClient) {
      return {
        success: false,
        error: "Hugging Face client not initialized",
      }
    }

    try {
      const formData = new FormData()
      formData.append("file", imageFile)

      // Use vision model for clothing classification
      const response = await fetch(`${this.config.baseUrl}/models/${this.config.models.imageAnalysis}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.statusText}`)
      }

      const result = await response.json()

      return {
        success: true,
        data: {
          classifications: result,
          confidence: result[0]?.score || 0.5,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: `Image analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }
}
