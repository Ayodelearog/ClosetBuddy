'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClothingItem } from '@/types';
import { ClothingItemService } from '@/lib/supabase';

export function useWardrobe() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load items from database
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Using demo user ID for now
      const { data, error } = await ClothingItemService.getAll('demo-user');
      
      if (error) {
        throw new Error('Failed to load items');
      }
      
      setItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (item: ClothingItem) => {
    try {
      const { error } = await ClothingItemService.update(item.id, {
        favorite: !item.favorite
      });

      if (error) {
        throw new Error('Failed to update favorite status');
      }

      // Update local state immediately for better UX
      setItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, favorite: !i.favorite } : i
      ));
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw err;
    }
  }, []);

  // Delete item
  const deleteItem = useCallback(async (item: ClothingItem) => {
    try {
      const { error } = await ClothingItemService.delete(item.id, item.user_id);

      if (error) {
        throw new Error('Failed to delete item');
      }

      // Remove from local state
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (err) {
      console.error('Error deleting item:', err);
      throw err;
    }
  }, []);

  // Add new item
  const addItem = useCallback((newItem: ClothingItem) => {
    setItems(prev => [newItem, ...prev]);
  }, []);

  // Calculate stats
  const stats = {
    totalItems: items.length,
    favoriteItems: items.filter(item => item.favorite).length,
    totalWears: items.reduce((sum, item) => sum + item.wear_count, 0),
    daysActive: items.length > 0 ? Math.max(1, Math.floor(
      (Date.now() - new Date(items.reduce((oldest, item) => 
        new Date(item.created_at) < new Date(oldest.created_at) ? item : oldest
      ).created_at).getTime()) / (1000 * 60 * 60 * 24)
    )) : 1,
  };

  // Load items on mount
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return {
    items,
    loading,
    error,
    stats,
    loadItems,
    toggleFavorite,
    deleteItem,
    addItem,
  };
}
