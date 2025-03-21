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

export default function Home() {
  const { toast } = useToast();
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [currentItemToEdit, setCurrentItemToEdit] = useState<InventoryItem | null>(null);
  const [currentItemToDelete, setCurrentItemToDelete] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Fetch inventory items
  const { data: inventoryItems = [], isLoading: isLoadingInventory } = useQuery({
    queryKey: ['/api/inventory'],
  });

  // Fetch recipes
  const { data: recipes = [], isLoading: isLoadingRecipes } = useQuery({
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
    <div className="bg-neutral-100 font-sans text-neutral-900 min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Header />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inventory Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-neutral-800">Food Inventory</h2>
                <button 
                  onClick={handleAddItemClick}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md flex items-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1z" clipRule="evenodd"/>
                  </svg>
                  Add Item
                </button>
              </div>
              
              {showAddItemForm && (
                <InventoryForm 
                  onCancel={handleCancelAdd} 
                  onSuccess={() => setShowAddItemForm(false)}
                />
              )}
              
              <InventoryList 
                items={inventoryItems} 
                isLoading={isLoadingInventory}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            </div>
          </div>
          
          {/* Recipe Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-neutral-800">Recipe Suggestions</h2>
                
                <button 
                  onClick={handleGenerateRecipes}
                  disabled={generateRecipesMutation.isPending || inventoryItems.length === 0}
                  className="bg-[#FF9800] hover:bg-[#ff8f00] text-white px-4 py-2 rounded-md flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {generateRecipesMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                  Generate Recipes
                </button>
              </div>
              
              <RecipeList 
                recipes={recipes}
                isLoading={isLoadingRecipes || generateRecipesMutation.isPending}
                onViewRecipe={handleViewRecipeDetails}
                inventoryItems={inventoryItems}
              />
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
