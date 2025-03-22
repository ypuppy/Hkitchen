import { Recipe, InventoryItem, RecipeIngredient } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Clock, ChefHat, CheckCircle2, Flame, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface RecipeCardProps {
  recipe: Recipe;
  inventoryItems: InventoryItem[];
  onClick: () => void;
}

export default function RecipeCard({ recipe, inventoryItems, onClick }: RecipeCardProps) {
  // Get the main ingredient names for display
  const getMainIngredients = (ingredients: RecipeIngredient[] | string): string[] => {
    if (typeof ingredients === 'string') {
      try {
        const parsedIngredients = JSON.parse(ingredients) as RecipeIngredient[];
        return parsedIngredients.slice(0, 3).map(ing => ing.name);
      } catch (error) {
        console.error("Error parsing ingredients:", error);
        return [];
      }
    }
    return ingredients.slice(0, 3).map(ing => ing.name);
  };

  // Calculate percentage of matched ingredients
  const calculateMatchPercentage = () => {
    const total = recipe.totalIngredients || 1; // Prevent division by zero
    const matched = recipe.matchedIngredients || 0;
    return Math.round((matched / total) * 100);
  };

  const mainIngredients = getMainIngredients(recipe.ingredients);
  const matchPercentage = calculateMatchPercentage();
  
  // Generate a placeholder image URL based on the recipe title
  const imageUrl = recipe.imageUrl || `https://source.unsplash.com/500x300/?food,${encodeURIComponent(recipe.title.replace(/\s+/g, ','))}`;
  
  // Set difficulty badge style
  const getDifficultyStyle = (difficulty: string) => {
    switch(difficulty.toLowerCase()) {
      case 'easy': 
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-700',
          icon: <ChefHat className="h-3 w-3 mr-1" />
        };
      case 'medium': 
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-700',
          icon: <Flame className="h-3 w-3 mr-1" />
        };
      case 'hard': 
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          icon: <Flame className="h-3 w-3 mr-1" />
        };
      default: 
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-700',
          icon: <ChefHat className="h-3 w-3 mr-1" />
        };
    }
  };
  
  const difficultyStyle = getDifficultyStyle(recipe.difficulty);
  
  return (
    <div 
      className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 fade-in"
      onClick={onClick}
    >
      <div className="flex flex-col md:flex-row">
        <div className="md:w-2/5 h-56 md:h-auto relative overflow-hidden">
          <img 
            src={imageUrl}
            alt={recipe.title} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          
          {/* Recipe tags at bottom of image */}
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 max-w-[90%]">
            {recipe.tags && recipe.tags.map((tag, idx) => (
              <Badge key={idx} className="bg-black/60 text-white border-none text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          {/* Cook time pill */}
          <div className="absolute top-2 right-2">
            <div className="flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium shadow-sm">
              <Clock className="h-3 w-3 mr-1 text-primary" />
              <span>{recipe.cookTime} mins</span>
            </div>
          </div>
          
          {/* Difficulty badge */}
          <div className="absolute top-2 left-2">
            <div className={`flex items-center ${difficultyStyle.bg} ${difficultyStyle.text} px-2 py-1 rounded-full text-xs font-medium`}>
              {difficultyStyle.icon}
              <span>{recipe.difficulty}</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 md:w-3/5 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2 line-clamp-2">{recipe.title}</h3>
            
            <div className="flex items-center text-sm text-neutral-500 mb-3">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1 text-primary" />
                <span className="font-medium">{matchPercentage}%</span>
                <span className="ml-1">ingredients match</span>
              </div>
              <span className="mx-2">•</span>
              <span>Serves {recipe.servings}</span>
            </div>
            
            <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{recipe.description}</p>
          </div>
          
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-1">Main ingredients:</p>
            <div className="flex flex-wrap gap-1">
              {mainIngredients.map((ingredient, idx) => (
                <Badge key={idx} variant="outline" className="bg-neutral-50 text-neutral-700 border-neutral-200 rounded-full text-xs">
                  {ingredient.toLowerCase()}
                </Badge>
              ))}
              
              {mainIngredients.length < 3 && (
                <Badge variant="outline" className="bg-neutral-50 text-neutral-500 border-neutral-200 rounded-full text-xs">
                  + more
                </Badge>
              )}
            </div>
            
            <div className="mt-3 flex justify-between items-center">
              <Badge className="bg-primary/10 text-primary border-none rounded-full text-xs">
                {recipe.matchedIngredients} of {recipe.totalIngredients} ingredients in your inventory
              </Badge>
              
              <span className="text-xs text-primary font-medium">View Recipe →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
