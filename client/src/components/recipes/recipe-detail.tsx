import { Recipe, InventoryItem, RecipeIngredient, RecipeInstruction } from "@shared/schema";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Clock, Users, Printer, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
  inventoryItems: InventoryItem[];
}

export default function RecipeDetail({ recipe, onClose, inventoryItems }: RecipeDetailProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Parse ingredients and instructions if they're stored as strings
  const ingredients: RecipeIngredient[] = typeof recipe.ingredients === 'string' 
    ? JSON.parse(recipe.ingredients) 
    : recipe.ingredients as RecipeIngredient[];
  
  const instructions: RecipeInstruction[] = typeof recipe.instructions === 'string' 
    ? JSON.parse(recipe.instructions) 
    : recipe.instructions as RecipeInstruction[];
  
  // Generate image URL, checking for local images first
  const getImageUrl = () => {
    // If recipe has an imageUrl field, use that
    if (recipe.imageUrl) {
      return recipe.imageUrl;
    }
    
    // Check if we have a local image for this recipe by ID
    const localImagePath = `/images/recipe-${recipe.id}.jpg`;
    
    // Fallback to Unsplash for placeholder images
    const unsplashUrl = `https://source.unsplash.com/1200x800/?food,${encodeURIComponent(recipe.title)}`;
    
    return localImagePath;
  };
  
  const imageUrl = getImageUrl();
  
  // Improved check if ingredient is in inventory (matches ingredient names more flexibly)
  const isIngredientInInventory = (ingredientName: string): boolean => {
    if (!ingredientName || inventoryItems.length === 0) {
      return false;
    }
    
    const normalizedName = ingredientName.toLowerCase().trim();
    
    return inventoryItems.some(item => {
      const normalizedItem = item.name.toLowerCase().trim();
      return normalizedName.includes(normalizedItem) || normalizedItem.includes(normalizedName);
    });
  };
  
  // Toggle favorite mutation
  const { mutate: toggleFavorite, isPending } = useMutation({
    mutationFn: async () => {
      return apiRequest('PUT', `/api/recipes/${recipe.id}/favorite`);
    },
    onSuccess: () => {
      // Invalidate recipes queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recipes/favorites'] });
      
      toast({
        title: recipe.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: recipe.isFavorite ? 
          `${recipe.title} has been removed from your favorites.` : 
          `${recipe.title} has been added to your favorites.`,
        duration: 3000
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
        duration: 3000
      });
      console.error("Failed to toggle favorite:", error);
    }
  });
  
  const handlePrintRecipe = () => {
    window.print();
  };
  
  const handleToggleFavorite = () => {
    toggleFavorite();
  };
  
  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] p-0 overflow-y-auto bg-white" aria-describedby="recipe-details-description">
        <div className="relative">
          <div className="w-full h-64 overflow-hidden rounded-t-lg">
            <img 
              src={imageUrl}
              alt={recipe.title} 
              className="w-full h-64 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://source.unsplash.com/1200x800/?food,${encodeURIComponent(recipe.title)}`;
              }}
            />
          </div>
          <Button 
            variant="ghost" 
            className="absolute top-4 right-4 bg-neutral-800 bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-colors"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">{recipe.title}</h2>
              <div className="flex items-center text-sm text-neutral-600">
                <div className="flex items-center mr-4">
                  <Clock className="h-4 w-4 mr-1 text-neutral-500" />
                  <span>{recipe.cookTime} mins total</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-neutral-500" />
                  <span>Serves {recipe.servings}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 md:mt-0">
              <Badge className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium border-none">
                {recipe.matchedIngredients} ingredients matched
              </Badge>
            </div>
          </div>
          
          <div className="mb-6">
            <p id="recipe-details-description" className="text-neutral-700">{recipe.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-1">
              <h3 className="text-lg font-semibold mb-3 text-neutral-800">Ingredients</h3>
              <ul className="space-y-2">
                {ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 ${ingredient.inInventory || isIngredientInInventory(ingredient.name) ? 'text-primary' : 'text-neutral-300'} mr-2 mt-0.5`} 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className={ingredient.inInventory || isIngredientInInventory(ingredient.name) ? 'text-neutral-700' : 'text-neutral-500'}>
                      <span className="font-medium">{ingredient.quantity}</span> {ingredient.unit && `${ingredient.unit} `}{ingredient.name}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 bg-primary/5 rounded-md border border-primary/20">
                <p className="text-sm text-neutral-700">
                  <span className="font-medium">Shopping Note:</span> Items in gray are missing from your inventory and need to be purchased.
                </p>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-3 text-neutral-800">Instructions</h3>
              <ol className="space-y-4">
                {instructions.map((instruction) => (
                  <li key={instruction.step} className="flex">
                    <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center font-medium text-sm mr-3 flex-shrink-0 mt-0.5">
                      {instruction.step}
                    </span>
                    <p className="text-neutral-700">{instruction.instruction}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 pt-4 flex justify-between">
            <Button variant="ghost" className="text-neutral-600 hover:text-neutral-900 transition-colors" onClick={handlePrintRecipe}>
              <Printer className="h-5 w-5 mr-1" />
              Print Recipe
            </Button>
            <Button 
              variant="ghost" 
              className="text-neutral-600 hover:text-neutral-900 transition-colors" 
              onClick={handleToggleFavorite}
              disabled={isPending}
            >
              <Star 
                className={`h-5 w-5 mr-1 ${recipe.isFavorite ? 'text-yellow-500 fill-yellow-500' : ''}`} 
              />
              {recipe.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
