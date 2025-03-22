import { useState } from "react";
import Header from "@/components/ui/header";
import InventoryList from "@/components/inventory/inventory-list";
import InventoryForm from "@/components/inventory/inventory-form";
import RecipeList from "@/components/recipes/recipe-list";
import RecipeDetail from "@/components/recipes/recipe-detail";
import EditItemModal from "@/components/modals/edit-item-modal";
import ConfirmDeleteModal from "@/components/modals/confirm-delete-modal";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InventoryItem, Recipe } from "@shared/schema";
import { PlusCircle, ChefHat, Loader2, Sparkles, Utensils, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { toast } = useToast();
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [currentItemToEdit, setCurrentItemToEdit] = useState<InventoryItem | null>(null);
  const [currentItemToDelete, setCurrentItemToDelete] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Fetch inventory items
  const { data: inventoryItems = [], isLoading: isLoadingInventory } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory'],
  });

  // Fetch recipes
  const { data: recipes = [], isLoading: isLoadingRecipes } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes'],
  });

  // Generate recipes mutation
  const generateRecipesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/recipes/generate', {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      toast({
        title: "Recipes Generated",
        description: "New recipe suggestions have been created based on your inventory.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate recipes. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete inventory item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: "Item Deleted",
        description: "The item has been removed from your inventory.",
      });
      setShowDeleteConfirmation(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  const handleAddItemClick = () => {
    setShowAddItemForm(true);
  };

  const handleCancelAdd = () => {
    setShowAddItemForm(false);
  };

  const handleEditItem = (item: InventoryItem) => {
    setCurrentItemToEdit(item);
  };

  const handleCloseEditModal = () => {
    setCurrentItemToEdit(null);
  };

  const handleDeleteItem = (id: number) => {
    setCurrentItemToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (currentItemToDelete !== null) {
      deleteItemMutation.mutate(currentItemToDelete);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setCurrentItemToDelete(null);
  };

  const handleViewRecipeDetails = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleCloseRecipeModal = () => {
    setSelectedRecipe(null);
  };

  const handleGenerateRecipes = () => {
    generateRecipesMutation.mutate();
  };

  return (
    <div className="bg-neutral-50 font-sans text-neutral-900 min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Header />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inventory Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-white p-2 rounded-lg mr-3 shadow-sm">
                    <Utensils className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-white">My Pantry</h2>
                </div>
                <Button 
                  onClick={handleAddItemClick}
                  className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-sm border border-emerald-200"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              
              <div className="p-5">
                {showAddItemForm && (
                  <InventoryForm 
                    onCancel={handleCancelAdd} 
                    onSuccess={() => setShowAddItemForm(false)}
                  />
                )}
                
                {inventoryItems.length === 0 && !isLoadingInventory && !showAddItemForm && (
                  <div className="text-center py-8 border-2 border-dashed border-neutral-200 rounded-lg bg-neutral-50">
                    <Utensils className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                    <h3 className="text-lg font-medium text-neutral-700">Your pantry is empty</h3>
                    <p className="text-neutral-500 mt-1 mb-4">Add ingredients to get started with recipe suggestions</p>
                    <Button onClick={handleAddItemClick} className="bg-primary hover:bg-primary/90">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add First Item
                    </Button>
                  </div>
                )}
                
                <InventoryList 
                  items={inventoryItems} 
                  isLoading={isLoadingInventory}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
                
                {inventoryItems.length > 0 && !showAddItemForm && (
                  <div className="mt-4 pt-4 border-t border-neutral-100 text-center">
                    <button
                      onClick={handleAddItemClick}
                      className="text-sm text-primary font-medium hover:underline flex items-center justify-center mx-auto"
                    >
                      <PlusCircle className="h-3 w-3 mr-1" />
                      Add more ingredients
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Recipe Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-white p-2 rounded-lg mr-3 shadow-sm">
                    <BookOpen className="h-5 w-5 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Recipe Suggestions</h2>
                </div>
                
                <Button 
                  onClick={handleGenerateRecipes}
                  disabled={generateRecipesMutation.isPending || inventoryItems.length === 0}
                  className="bg-white text-amber-600 hover:bg-amber-50 shadow-sm border border-amber-200 disabled:opacity-70 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:border-neutral-200"
                >
                  {generateRecipesMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Recipes
                    </>
                  )}
                </Button>
              </div>
              
              <div className="p-5">
                {inventoryItems.length === 0 && !isLoadingInventory && (
                  <div className="text-center py-8 border-2 border-dashed border-neutral-200 rounded-lg bg-neutral-50">
                    <ChefHat className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                    <h3 className="text-lg font-medium text-neutral-700">No ingredients yet</h3>
                    <p className="text-neutral-500 mt-1">Add ingredients to your inventory to get recipe suggestions</p>
                  </div>
                )}
                
                {inventoryItems.length > 0 && (
                  <RecipeList 
                    recipes={recipes}
                    isLoading={isLoadingRecipes || generateRecipesMutation.isPending}
                    onViewRecipe={handleViewRecipeDetails}
                    inventoryItems={inventoryItems}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Modals */}
        {currentItemToEdit && (
          <EditItemModal 
            item={currentItemToEdit} 
            onClose={handleCloseEditModal} 
          />
        )}
        
        {showDeleteConfirmation && (
          <ConfirmDeleteModal 
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            isPending={deleteItemMutation.isPending}
          />
        )}
        
        {selectedRecipe && (
          <RecipeDetail 
            recipe={selectedRecipe} 
            onClose={handleCloseRecipeModal}
            inventoryItems={inventoryItems}
          />
        )}
      </div>
    </div>
  );
}
