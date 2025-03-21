import { useState, useMemo, useEffect } from "react";
import { Recipe, InventoryItem } from "@shared/schema";
import RecipeCard from "./recipe-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface RecipeListProps {
  recipes: Recipe[];
  isLoading: boolean;
  onViewRecipe: (recipe: Recipe) => void;
  inventoryItems: InventoryItem[];
}

type FilterTag = "All" | "Quick" | "Medium" | "Slow" | "Vegetarian" | "Low Carb";

export default function RecipeList({ recipes, isLoading, onViewRecipe, inventoryItems }: RecipeListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTag>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Apply filters and search
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      // First apply tag filters
      let matchesFilter = 
        activeFilter === "All" || 
        (activeFilter === "Quick" && recipe.cookTime <= 15) ||
        (activeFilter === "Medium" && recipe.cookTime > 15 && recipe.cookTime <= 30) ||
        (activeFilter === "Slow" && recipe.cookTime > 30);
      
      // Handle vegetarian tag
      if (activeFilter === "Vegetarian") {
        const tags = recipe.tags || [];
        matchesFilter = tags.includes("Vegetarian");
      }
      
      // Handle low carb tag
      if (activeFilter === "Low Carb") {
        const tags = recipe.tags || [];
        matchesFilter = tags.includes("Low Carb");
      }

      if (!matchesFilter) return false;

      // Then apply search if there is a query
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase().trim();
      
      // Search in title
      if (recipe.title.toLowerCase().includes(query)) return true;
      
      // Search in description
      if (recipe.description.toLowerCase().includes(query)) return true;
      
      // Search in ingredients (assuming they're stored as a JSON string)
      try {
        const ingredientsObj = JSON.parse(recipe.ingredients);
        // If it's an array of ingredients objects
        if (Array.isArray(ingredientsObj)) {
          return ingredientsObj.some(ing => 
            ing.name?.toLowerCase().includes(query));
        }
      } catch (e) {
        // In case the ingredients is not valid JSON or has a different format
        if (recipe.ingredients.toLowerCase().includes(query)) return true;
      }
      
      return false;
    });
  }, [recipes, activeFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm font-medium text-neutral-700 self-center mr-2">Filter by:</span>
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
        
        {[1, 2].map((i) => (
          <div key={i} className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm">
            <div className="flex flex-col md:flex-row animate-pulse">
              <div className="md:w-1/3 h-48 md:h-auto bg-gray-200"></div>
              <div className="p-4 md:w-2/3 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <div className="flex flex-wrap gap-1 pt-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div id="initialState" className="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
        <h3 className="text-lg font-medium text-neutral-700">Ready to Create Recipes</h3>
        <p className="text-neutral-500 mt-2">Click "Generate Recipes" to get AI-powered meal suggestions based on your ingredients.</p>
      </div>
    );
  }

  // Common filter and search UI for both empty and non-empty results
  const filterSearchUI = (
    <>
      {/* Search Bar */}
      <div className="w-full mb-4 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search recipes or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full max-w-md rounded-md"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm font-medium text-neutral-700 self-center mr-2">Filter by:</span>
        
        {/* Time Filters */}
        <Badge 
          variant={activeFilter === "All" ? "default" : "outline"}
          className={`rounded-full cursor-pointer ${activeFilter === "All" ? "bg-primary-100 text-primary-800 hover:bg-primary-200" : "bg-neutral-100 text-neutral-700 hover:bg-primary-100 hover:text-primary-800"}`} 
          onClick={() => setActiveFilter("All")}
        >
          All
        </Badge>
        <Badge 
          variant={activeFilter === "Quick" ? "default" : "outline"}
          className={`rounded-full cursor-pointer ${activeFilter === "Quick" ? "bg-primary-100 text-primary-800 hover:bg-primary-200" : "bg-neutral-100 text-neutral-700 hover:bg-primary-100 hover:text-primary-800"}`} 
          onClick={() => setActiveFilter("Quick")}
        >
          Quick (≤ 15 min)
        </Badge>
        <Badge 
          variant={activeFilter === "Medium" ? "default" : "outline"}
          className={`rounded-full cursor-pointer ${activeFilter === "Medium" ? "bg-primary-100 text-primary-800 hover:bg-primary-200" : "bg-neutral-100 text-neutral-700 hover:bg-primary-100 hover:text-primary-800"}`} 
          onClick={() => setActiveFilter("Medium")}
        >
          Medium (16-30 min)
        </Badge>
        <Badge 
          variant={activeFilter === "Slow" ? "default" : "outline"}
          className={`rounded-full cursor-pointer ${activeFilter === "Slow" ? "bg-primary-100 text-primary-800 hover:bg-primary-200" : "bg-neutral-100 text-neutral-700 hover:bg-primary-100 hover:text-primary-800"}`} 
          onClick={() => setActiveFilter("Slow")}
        >
          Slow (30+ min)
        </Badge>
        
        {/* Dietary Filters */}
        <Badge 
          variant={activeFilter === "Vegetarian" ? "default" : "outline"}
          className={`rounded-full cursor-pointer ${activeFilter === "Vegetarian" ? "bg-primary-100 text-primary-800 hover:bg-primary-200" : "bg-neutral-100 text-neutral-700 hover:bg-primary-100 hover:text-primary-800"}`} 
          onClick={() => setActiveFilter("Vegetarian")}
        >
          Vegetarian
        </Badge>
        <Badge 
          variant={activeFilter === "Low Carb" ? "default" : "outline"}
          className={`rounded-full cursor-pointer ${activeFilter === "Low Carb" ? "bg-primary-100 text-primary-800 hover:bg-primary-200" : "bg-neutral-100 text-neutral-700 hover:bg-primary-100 hover:text-primary-800"}`} 
          onClick={() => setActiveFilter("Low Carb")}
        >
          Low Carb
        </Badge>
      </div>
    </>
  );

  if (filteredRecipes.length === 0) {
    return (
      <div>
        {filterSearchUI}
        
        <div id="noRecipes" className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-medium text-neutral-700">No Recipes Found</h3>
          <p className="text-neutral-500 mt-2">
            {searchQuery 
              ? `No recipes matching "${searchQuery}". Try a different search term or adjust your filters.` 
              : "Try adding more ingredients to your inventory or adjusting your filters."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filterSearchUI}
      
      {/* Recipe count */}
      <div className="text-sm text-neutral-600 mb-2">
        Found {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
        {searchQuery && <span> matching "{searchQuery}"</span>}
      </div>
      
      {filteredRecipes.map((recipe) => (
        <RecipeCard 
          key={recipe.id} 
          recipe={recipe} 
          inventoryItems={inventoryItems}
          onClick={() => onViewRecipe(recipe)} 
        />
      ))}
    </div>
  );
}
