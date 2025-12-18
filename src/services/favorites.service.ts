/**
 * Favorites Service
 * Manages favorite artworks in localStorage
 */

const FAVORITES_KEY = 'favorite_artworks';

export interface FavoriteArtwork {
  id: number;
  title: string;
  artist: string;
  price: string | number;
  image: string;
  category: string;
  addedAt: number;
}

export const favoritesService = {
  /**
   * Get all favorite artworks
   */
  getAll: (): FavoriteArtwork[] => {
    try {
      const favorites = localStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error reading favorites:', error);
      return [];
    }
  },

  /**
   * Add artwork to favorites
   */
  add: (artwork: Omit<FavoriteArtwork, 'addedAt'>): boolean => {
    try {
      const favorites = favoritesService.getAll();
      
      // Check if already in favorites
      if (favorites.some(fav => fav.id === artwork.id)) {
        console.log('Artwork already in favorites');
        return false;
      }

      const newFavorite: FavoriteArtwork = {
        ...artwork,
        addedAt: Date.now(),
      };
      console.log('Added to favorites:', newFavorite);
      favorites.push(newFavorite);

      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  },

  /**
   * Remove artwork from favorites
   */
  remove: (artworkId: number): boolean => {
    try {
      const favorites = favoritesService.getAll();
      const filtered = favorites.filter(fav => fav.id !== artworkId);
      
      if (filtered.length === favorites.length) {
        console.log('Artwork not found in favorites');
        return false;
      }

      localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
      console.log('Removed from favorites:', artworkId);
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  },

  /**
   * Toggle favorite status
   */
  toggle: (artwork: Omit<FavoriteArtwork, 'addedAt'>): boolean => {
    const isFavorite = favoritesService.isFavorite(artwork.id);
    
    if (isFavorite) {
      return !favoritesService.remove(artwork.id);
    } else {
      return favoritesService.add(artwork);
    }
  },

  /**
   * Check if artwork is in favorites
   */
  isFavorite: (artworkId: number): boolean => {
    const favorites = favoritesService.getAll();
    console.log('check',favorites, artworkId)
    return favorites.some(fav => fav.id === artworkId);
  },

  /**
   * Get favorite by ID
   */
  getById: (artworkId: number): FavoriteArtwork | null => {
    const favorites = favoritesService.getAll();
    return favorites.find(fav => fav.id === artworkId) || null;
  },

  /**
   * Get favorites count
   */
  getCount: (): number => {
    return favoritesService.getAll().length;
  },

  /**
   * Clear all favorites
   */
  clear: (): void => {
    try {
      localStorage.removeItem(FAVORITES_KEY);
      console.log('All favorites cleared');
    } catch (error) {
      console.error('Error clearing favorites:', error);
    }
  },

  /**
   * Get favorites sorted by date added (newest first)
   */
  getSortedByDate: (): FavoriteArtwork[] => {
    const favorites = favoritesService.getAll();
    return favorites.sort((a, b) => b.addedAt - a.addedAt);
  },

  /**
   * Export favorites as JSON
   */
  export: (): string => {
    const favorites = favoritesService.getAll();
    return JSON.stringify(favorites, null, 2);
  },

  /**
   * Import favorites from JSON
   */
  import: (jsonString: string): boolean => {
    try {
      const favorites = JSON.parse(jsonString);
      if (Array.isArray(favorites)) {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        console.log('Favorites imported successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing favorites:', error);
      return false;
    }
  },
};

export default favoritesService;

// Made with Bob
