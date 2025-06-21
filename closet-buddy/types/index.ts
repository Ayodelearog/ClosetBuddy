// Core types for ClosetBuddy application

export interface ClothingItem {
  id: string;
  user_id: string;
  name: string;
  category: ClothingCategory;
  subcategory?: string;
  colors: string[];
  image_url: string;
  image_path: string;
  occasions: Occasion[];
  seasons: Season[];
  mood_tags: MoodTag[];
  brand?: string;
  size?: string;
  material?: string;
  care_instructions?: string;
  purchase_date?: string;
  last_worn?: string;
  wear_count: number;
  favorite: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type ClothingCategory = 
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'outerwear'
  | 'shoes'
  | 'accessories'
  | 'underwear'
  | 'activewear'
  | 'sleepwear'
  | 'formal';

export type Occasion = 
  | 'casual'
  | 'work'
  | 'formal'
  | 'party'
  | 'date'
  | 'workout'
  | 'travel'
  | 'home'
  | 'special_event'
  | 'outdoor';

export type Season = 
  | 'spring'
  | 'summer'
  | 'fall'
  | 'winter'
  | 'all_season';

export type MoodTag = 
  | 'confident'
  | 'comfortable'
  | 'elegant'
  | 'edgy'
  | 'playful'
  | 'professional'
  | 'romantic'
  | 'sporty'
  | 'trendy'
  | 'classic';

export interface OutfitSuggestion {
  id: string;
  user_id: string;
  items: ClothingItem[];
  occasion: Occasion;
  weather_condition?: WeatherCondition;
  mood: MoodTag;
  confidence_score: number;
  reasoning: string;
  created_at: string;
}

export interface WeatherCondition {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
  humidity: number;
  feels_like: number;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  favorite_colors: string[];
  style_preferences: MoodTag[];
  size_preferences: Record<ClothingCategory, string>;
  brand_preferences: string[];
  budget_range?: {
    min: number;
    max: number;
  };
  created_at: string;
  updated_at: string;
}

// Form types
export interface AddClothingItemForm {
  name: string;
  category: ClothingCategory;
  subcategory?: string;
  colors: string[];
  occasions: Occasion[];
  seasons: Season[];
  mood_tags: MoodTag[];
  brand?: string;
  size?: string;
  material?: string;
  care_instructions?: string;
  purchase_date?: string;
  notes?: string;
  image: File | null;
}

// UI State types
export interface FilterState {
  categories: ClothingCategory[];
  occasions: Occasion[];
  seasons: Season[];
  moods: MoodTag[];
  colors: string[];
  favorites_only: boolean;
  search_query: string;
}

export interface SortOption {
  field: keyof ClothingItem;
  direction: 'asc' | 'desc';
  label: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}


export interface AIResponse {
  success: boolean
  data?: any
  error?: string
  confidence?: number
}

export interface StyleAnalysisInput {
  items: Array<{
    category: string
    colors: string[]
    occasions: string[]
    mood_tags: string[]
  }>
  userPreferences?: {
    favoriteColors: string[]
    stylePreferences: string[]
  }
}

export interface StyleAnalysisOutput {
  stylePersonality: string
  dominantThemes: string[]
  colorPalette: string[]
  recommendations: string[]
  confidence: number
}

export interface OutfitDescriptionInput {
  items: Array<{
    name: string
    category: string
    colors: string[]
  }>
  occasion?: string
  season?: string
  mood?: string
}

export interface OutfitDescriptionOutput {
  description: string
  styleNotes: string[]
  occasionFit: string
  confidence: number
}

export interface FashionAnalysisResult {
  clothingType?: string
  colors?: string[]
  style?: string
  occasion?: string
  confidence: number
}

export interface AIConfig {
  provider: "huggingface" | "openai" | "anthropic" | "ollama"
  apiKey?: string
  baseUrl?: string
  models: {
    styleAnalysis: string
    textGeneration: string
    colorAnalysis: string
    outfitDescription: string
    imageAnalysis?: string
  }
}
