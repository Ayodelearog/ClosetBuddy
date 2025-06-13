# ClosetBuddy 👗✨

Your AI-powered wardrobe assistant that suggests perfect outfits based on weather, occasion, and your personal style.

## Features

### Phase 1 (Current) ✅

- **Digital Wardrobe Management**: Upload and organize your clothing items
- **Smart Image Upload**: Drag & drop image upload with automatic resizing
- **Color Detection**: Automatic color extraction from clothing photos
- **Categorization**: Organize items by type, occasion, season, and mood
- **Search & Filter**: Find items quickly with advanced filtering
- **Favorites System**: Mark your favorite pieces
- **Responsive Design**: Works perfectly on desktop and mobile

### Phase 2 (Coming Soon) 🚧

- **Weather Integration**: Real-time weather-based outfit suggestions
- **Color Coordination**: Smart color matching and outfit combinations
- **Occasion-based Filtering**: Outfit suggestions for specific events
- **Basic AI Suggestions**: Simple outfit recommendation engine

### Phase 3 (Future) 🔮

- **Advanced AI**: Sophisticated outfit suggestions using free AI models
- **Style Learning**: AI learns your preferences over time
- **Outfit History**: Track what you've worn and when
- **Social Features**: Share outfits and get feedback

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database + Storage + Auth)
- **UI Components**: Lucide React icons, Custom components
- **Image Processing**: Canvas API for color extraction and resizing
- **File Upload**: React Dropzone for drag & drop functionality

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd closet-buddy
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**

   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Create the following tables in your Supabase SQL editor:

   ```sql
   -- Create clothing_items table
   CREATE TABLE clothing_items (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id TEXT NOT NULL,
     name TEXT NOT NULL,
     category TEXT NOT NULL,
     subcategory TEXT,
     colors TEXT[] NOT NULL DEFAULT '{}',
     image_url TEXT NOT NULL,
     image_path TEXT NOT NULL,
     occasions TEXT[] NOT NULL DEFAULT '{}',
     seasons TEXT[] NOT NULL DEFAULT '{}',
     mood_tags TEXT[] NOT NULL DEFAULT '{}',
     brand TEXT,
     size TEXT,
     material TEXT,
     care_instructions TEXT,
     purchase_date TEXT,
     last_worn TIMESTAMP,
     wear_count INTEGER NOT NULL DEFAULT 0,
     favorite BOOLEAN NOT NULL DEFAULT false,
     notes TEXT,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Create user_preferences table
   CREATE TABLE user_preferences (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id TEXT NOT NULL UNIQUE,
     favorite_colors TEXT[] NOT NULL DEFAULT '{}',
     style_preferences TEXT[] NOT NULL DEFAULT '{}',
     size_preferences JSONB NOT NULL DEFAULT '{}',
     brand_preferences TEXT[] NOT NULL DEFAULT '{}',
     budget_range JSONB,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Create storage bucket for images
   INSERT INTO storage.buckets (id, name, public) VALUES ('clothing-images', 'clothing-images', true);

   -- Set up storage policies (allow public read, authenticated write)
   CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'clothing-images');
   CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'clothing-images');
   CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE USING (bucket_id = 'clothing-images');
   CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (bucket_id = 'clothing-images');
   ```

4. **Environment Setup**

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Add Your First Item**

   - Click "Add Your First Item" or navigate to `/add-item`
   - Upload a photo of your clothing item
   - Fill in the details (name, category, etc.)
   - Colors will be automatically detected from the image
   - Save the item to your wardrobe

2. **Browse Your Wardrobe**

   - Go to `/wardrobe` to see all your items
   - Use search and filters to find specific pieces
   - Toggle between grid and list views
   - Mark items as favorites

3. **Manage Items**
   - Edit item details by clicking the edit icon
   - Delete items you no longer own
   - Track how often you wear each piece

## Project Structure

```
closet-buddy/
├── app/                    # Next.js app directory
│   ├── add-item/          # Add new clothing item page
│   ├── wardrobe/          # Wardrobe management page
│   ├── layout.tsx         # Root layout with navigation
│   └── page.tsx           # Homepage
├── components/            # Reusable React components
│   ├── Navigation.tsx     # Main navigation component
│   ├── ImageUpload.tsx    # Image upload with drag & drop
│   └── ClothingItemCard.tsx # Individual item display
├── lib/                   # Utility functions and services
│   ├── supabase.ts        # Supabase client and database services
│   └── utils.ts           # Helper functions and constants
├── types/                 # TypeScript type definitions
│   └── index.ts           # All app types and interfaces
└── public/                # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

- [ ] **Phase 2**: Weather API integration
- [ ] **Phase 2**: Basic outfit suggestion algorithm
- [ ] **Phase 2**: Color coordination logic
- [ ] **Phase 3**: AI integration (Hugging Face/Ollama)
- [ ] **Phase 3**: User authentication
- [ ] **Phase 3**: Outfit history tracking
- [ ] **Phase 3**: Social features

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/your-username/closet-buddy/issues) on GitHub.
