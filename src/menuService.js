import { MENU_DATA } from './MenuData.js';

const DIRECTUS_API_URL = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_DIRECTUS_API_URL : null) || (typeof process !== 'undefined' && process.env ? process.env.VITE_DIRECTUS_API_URL : null) || 'http://localhost:8055';
const CACHE_KEY = 'sisi-menu-cache';

/**
 * Retrieves the cached menu from localStorage and performs structural validation.
 * @returns {Array|null} Validated cached menu data or null if empty/corrupted.
 */
export const getCachedMenu = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    // Validate structure: must be an array where each category has id, title, and items
    if (!Array.isArray(parsed)) return null;
    for (const cat of parsed) {
      if (!cat.id || !cat.title || !Array.isArray(cat.items)) {
        return null;
      }
    }
    return parsed;
  } catch (err) {
    console.warn('[Directus Connection Diagnostics] Cache read error or corrupted cache data:', err);
    return null;
  }
};

/**
 * Saves the menu data structure to local storage cache.
 * @param {Array} menuData 
 */
export const setCachedMenu = (menuData) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(menuData));
  } catch (err) {
    console.warn('[Directus Connection Diagnostics] Cache write error:', err);
  }
};

/**
 * Fetches the menu using a strict three-tier fallback logic:
 * Level 1: Directus API - Load from CMS, update cache if successful.
 * Level 2: Cache Copy - If CMS is down, load the last successfully saved copy.
 * Level 3: Emergency Fallback - If CMS is down and no cache exists, use the original local array.
 * 
 * Logs corresponding diagnostic source message exactly as required to console.
 */
export async function fetchMenuData() {
  try {
    // Level 1: Directus API
    const [categoriesRes, dishesRes] = await Promise.all([
      fetch(`${DIRECTUS_API_URL}/items/categories?limit=-1`),
      fetch(`${DIRECTUS_API_URL}/items/dishes?limit=-1&fields=*,category.*`)
    ]);

    if (!categoriesRes.ok || !dishesRes.ok) {
      throw new Error(`HTTP Error! Categories status: ${categoriesRes.status}, Dishes status: ${dishesRes.status}`);
    }

    const categoriesJson = await categoriesRes.json();
    const dishesJson = await dishesRes.json();

    const categoriesData = categoriesJson.data || [];
    const dishesData = dishesJson.data || [];

    if (categoriesData.length === 0 || dishesData.length === 0) {
      throw new Error('API returned empty categories or dishes.');
    }

    // Process categories and map colors
    const categoryColors = {
      'snacks': 'var(--accent-terracotta)',
      'appetizers': 'var(--accent-terracotta)',
      'salads': 'var(--accent-green)',
      'soups': 'var(--accent-gold)',
      'pasta': 'var(--accent-terracotta)',
      'pizza': 'var(--accent-green)',
      'roman-pizza': 'var(--accent-green)',
      'main-dishes': 'var(--accent-gold)',
      'main-courses': 'var(--accent-gold)',
      'desserts': 'var(--accent-terracotta)',
      'ice-cream': 'var(--accent-green)'
    };

    const sortedCategories = categoriesData
      .filter(cat => cat.status === 'published')
      .sort((a, b) => (a.sort ?? a.id) - (b.sort ?? b.id));

    const processed = sortedCategories.map(cat => {
      const catDishes = dishesData
        .filter(dish => {
          if (dish.status !== 'published') return false;
          if (!dish.category) return false;
          return dish.category.slug === cat.slug;
        })
        .map(dish => {
          // Lookup original status (hit/new) from local MENU_DATA to preserve visual design
          let originalStatus = null;
          for (const localCat of MENU_DATA) {
            const localItem = localCat.items.find(i => i.name === dish.name);
            if (localItem) {
              originalStatus = localItem.status;
              break;
            }
          }

          return {
            id: dish.id,
            name: dish.name,
            category: dish.category.slug,
            weight: dish.weight || '',
            price: dish.price,
            description: dish.description || '',
            image: dish.image ? `${DIRECTUS_API_URL}/assets/${dish.image}` : null,
            status: originalStatus,
            order: dish.sort,
            visible: true
          };
        });

      // Sort dishes inside category
      catDishes.sort((a, b) => (a.order ?? a.id) - (b.order ?? b.id));

      return {
        id: cat.slug,
        title: cat.name,
        color: categoryColors[cat.slug] || 'var(--accent-gold)',
        items: catDishes
      };
    });

    if (processed.length > 0) {
      setCachedMenu(processed);
      console.log('Menu source: Directus API');
      return processed;
    } else {
      throw new Error('No published categories or dishes match criteria.');
    }
  } catch (err) {
    // Level 2: Cached copy
    const cached = getCachedMenu();
    if (cached) {
      console.log('Menu source: cached last successful response');
      console.warn('[Directus Connection Diagnostics] CMS is unavailable. Fallback to cached response. Error details:', err);
      return cached;
    }

    // Level 3: Emergency local fallback
    console.log('Menu source: emergency local fallback');
    console.error('[Directus Connection Diagnostics] CMS is unavailable and no cache exists. Emergency fallback. Error details:', err);
    return MENU_DATA;
  }
}
