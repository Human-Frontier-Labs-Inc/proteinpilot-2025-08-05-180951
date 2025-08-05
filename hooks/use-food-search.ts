import { useState, useEffect, useMemo } from 'react';

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  category: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  verified: boolean;
}

interface SearchFilters {
  category?: string;
  minProtein?: number;
  maxCalories?: number;
  verified?: boolean;
}

export function useFoodSearch(foods: FoodItem[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState<'name' | 'protein' | 'calories'>('name');

  const filteredAndSortedFoods = useMemo(() => {
    let filtered = foods;

    // Text search
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(food =>
        food.name.toLowerCase().includes(search) ||
        food.brand?.toLowerCase().includes(search) ||
        food.category.toLowerCase().includes(search)
      );
    }

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(food => food.category === filters.category);
    }

    if (filters.minProtein !== undefined) {
      filtered = filtered.filter(food => food.protein >= filters.minProtein!);
    }

    if (filters.maxCalories !== undefined) {
      filtered = filtered.filter(food => food.calories <= filters.maxCalories!);
    }

    if (filters.verified !== undefined) {
      filtered = filtered.filter(food => food.verified === filters.verified);
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'protein':
          return b.protein - a.protein; // Highest protein first
        case 'calories':
          return a.calories - b.calories; // Lowest calories first
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [foods, searchTerm, filters, sortBy]);

  const getCategories = useMemo(() => {
    const categories = new Set(foods.map(food => food.category));
    return Array.from(categories).sort();
  }, [foods]);

  const getHighProteinFoods = useMemo(() => {
    return foods
      .filter(food => food.protein >= 15) // High protein threshold
      .sort((a, b) => b.protein - a.protein)
      .slice(0, 10);
  }, [foods]);

  const getLowCalorieFoods = useMemo(() => {
    return foods
      .filter(food => food.calories <= 100 && food.protein >= 10)
      .sort((a, b) => a.calories - b.calories)
      .slice(0, 10);
  }, [foods]);

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    filteredAndSortedFoods,
    getCategories,
    getHighProteinFoods,
    getLowCalorieFoods,
    clearFilters,
    hasActiveFilters: searchTerm.trim() !== '' || Object.keys(filters).length > 0,
  };
}