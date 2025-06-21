import { InferenceClient } from "@huggingface/inference"
import { getAIConfig, FASHION_MODELS } from "./config"

export interface FashionAnalysisResult {
  clothingType?: string
  colors?: string[]
  style?: string
  occasion?: string
  confidence: number
}

export class HuggingFaceFashionClient {
  private client: InferenceClient
  private config = getAIConfig()

  constructor() {
    this.client = new InferenceClient(this.config.apiKey)
  }

  async classifyClothing(imageFile: File): Promise<FashionAnalysisResult> {
    try {
      const response = await this.client.imageClassification({
        data: imageFile,
        model: FASHION_MODELS.clothingClassification,
      })

      return {
        clothingType: response[0]?.label || "unknown",
        confidence: response[0]?.score || 0.5,
      }
    } catch (error) {
      console.error("Clothing classification failed:", error)
      return { confidence: 0 }
    }
  }

  async generateOutfitCaption(imageFile: File): Promise<string> {
    try {
      const response = await this.client.imageToText({
        data: imageFile,
        model: FASHION_MODELS.fashionCaptioning,
      })

      return response.generated_text || "A stylish outfit"
    } catch (error) {
      console.error("Outfit caption generation failed:", error)
      return "Unable to describe outfit"
    }
  }

  async getFashionAdvice(prompt: string): Promise<string> {
    try {
      const fashionPrompt = `As a professional fashion stylist, please provide advice: ${prompt}`

      const response = await this.client.textGeneration({
        model: FASHION_MODELS.fashionAdvice,
        inputs: fashionPrompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          return_full_text: false,
        },
      })

      return response.generated_text || "Consider mixing classic pieces with trendy accessories."
    } catch (error) {
      console.error("Fashion advice generation failed:", error)
      return "Unable to provide fashion advice at this time."
    }
  }

  async analyzeColors(imageFile: File): Promise<string[]> {
    try {
      // This would ideally use a color detection model
      // For now, we'll use image classification and extract color info
      const response = await this.client.imageClassification({
        data: imageFile,
        model: FASHION_MODELS.colorDetection,
      })

      // Extract color information from labels (this is a simplified approach)
      const colorKeywords = [
        "red",
        "blue",
        "green",
        "black",
        "white",
        "yellow",
        "pink",
        "purple",
        "orange",
        "brown",
        "gray",
      ]
      const detectedColors: string[] = []

      response.forEach((result) => {
        const label = result.label.toLowerCase()
        colorKeywords.forEach((color) => {
          if (label.includes(color) && !detectedColors.includes(color)) {
            detectedColors.push(color)
          }
        })
      })

      return detectedColors.length > 0 ? detectedColors : ["neutral"]
    } catch (error) {
      console.error("Color analysis failed:", error)
      return ["neutral"]
    }
  }
}

export const fashionClient = new HuggingFaceFashionClient()
