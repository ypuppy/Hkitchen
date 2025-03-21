import { Recipe, InventoryItem, RecipeIngredient } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

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

  const ingredients = typeof recipe.ingredients === 'string' 
    ? JSON.parse(recipe.ingredients) as RecipeIngredient[]
    : recipe.ingredients as RecipeIngredient[];

  const mainIngredients = getMainIngredients(recipe.ingredients);
  
  // Generate a placeholder image URL based on the recipe title
  const imageUrl = recipe.imageUrl || `https://source.unsplash.com/500x300/?food,${encodeURIComponent(recipe.title)}`;
  
  // Set difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty.toLowerCase()) {
      case 'easy': return 'bg-primary text-primary-foreground';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'hard': return 'bg-red-500 text-white';
      default: return 'bg-primary text-primary-foreground';
    }
  };
  
  return (
    <div 
      className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer fade-in"
      onClick={onClick}
    >
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 h-48 md:h-auto relative">
          <img 
            src={imageUrl}
            alt={recipe.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            <span className={`${getDifficultyColor(recipe.difficulty)} px-2 py-1 rounded text-xs font-medium`}>
              {recipe.difficulty}
            </span>
          </div>
        </div>
        <div className="p-4 md:w-2/3">
          <h3 className="text-lg font-medium text-neutral-800 mb-1">{recipe.title}</h3>
          <div className="flex items-center text-sm text-neutral-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>{recipe.cookTime} mins</span>
            <span className="mx-2">•</span>
            <span>{recipe.matchedIngredients} ingredients matched</span>
          </div>
          <p className="text-neutral-600 text-sm mb-3">{recipe.description}</p>
          <div className="flex flex-wrap gap-1">
            {mainIngredients.map((ingredient, idx) => (
              <Badge key={idx} variant="outline" className="bg-neutral-100 text-neutral-800 rounded-full text-xs">
                {ingredient.toLowerCase()}
              </Badge>
            ))}
            <Badge className="bg-primary-100 text-primary-800 rounded-full text-xs">
              ingredients in your inventory
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
