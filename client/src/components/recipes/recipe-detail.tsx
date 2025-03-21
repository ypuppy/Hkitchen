import { Recipe, InventoryItem, RecipeIngredient, RecipeInstruction } from "@shared/schema";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Clock, Users, Printer, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
  inventoryItems: InventoryItem[];
}

export default function RecipeDetail({ recipe, onClose, inventoryItems }: RecipeDetailProps) {
  const { toast } = useToast();
  
  // Parse ingredients and instructions if they're stored as strings
  const ingredients: RecipeIngredient[] = typeof recipe.ingredients === 'string' 
    ? JSON.parse(recipe.ingredients) 
    : recipe.ingredients as RecipeIngredient[];
  
  const instructions: RecipeInstruction[] = typeof recipe.instructions === 'string' 
    ? JSON.parse(recipe.instructions) 
    : recipe.instructions as RecipeInstruction[];
  
  // Generate a placeholder image URL based on the recipe title
  const imageUrl = recipe.imageUrl || `https://source.unsplash.com/1200x800/?food,${encodeURIComponent(recipe.title)}`;
  
  // Check if ingredient is in inventory
  const isIngredientInInventory = (ingredientName: string): boolean => {
    return inventoryItems.some(item => 
      ingredientName.toLowerCase().includes(item.name.toLowerCase())
    );
  };
  
  const handlePrintRecipe = () => {
    window.print();
  };
  
  const handleSaveRecipe = () => {
    toast({
      title: "Recipe Saved",
      description: "This recipe has been saved to your favorites.",
    });
  };
  
  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] p-0 overflow-y-auto">
        <div className="relative">
          <img 
            src={imageUrl}
            alt={recipe.title} 
            className="w-full h-64 object-cover rounded-t-lg"
          />
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
              <Badge className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                {recipe.matchedIngredients} ingredients matched
              </Badge>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-neutral-700">{recipe.description}</p>
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
              <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Note:</span> Items in gray are missing from your inventory and need to be purchased.
                </p>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-3 text-neutral-800">Instructions</h3>
              <ol className="space-y-4">
                {instructions.map((instruction) => (
                  <li key={instruction.step} className="flex">
                    <span className="bg-primary-100 text-primary-800 w-6 h-6 rounded-full flex items-center justify-center font-medium text-sm mr-3 flex-shrink-0 mt-0.5">
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
            <Button variant="ghost" className="text-neutral-600 hover:text-neutral-900 transition-colors" onClick={handleSaveRecipe}>
              <Bookmark className="h-5 w-5 mr-1" />
              Save Recipe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
