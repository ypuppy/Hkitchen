import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { inventoryFormSchema, insertRecipeSchema } from "@shared/schema";
import { generateRecipes } from "./openai";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";

// Authentication middleware to ensure the user is logged in
const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized - Please login first" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Create HTTP server
  const httpServer = createServer(app);

  // Inventory routes
  app.get("/api/inventory", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const items = await storage.getInventoryItems(userId);
      res.json(items);
    } catch (error) {
      console.error("Error getting inventory items:", error);
      res.status(500).json({ error: "Failed to retrieve inventory items" });
    }
  });

  app.get("/api/inventory/:id", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const item = await storage.getInventoryItem(id);
      
      // Check if the item belongs to the authenticated user
      if (!item || item.userId !== userId) {
        return res.status(404).json({ error: "Item not found" });
      }

      res.json(item);
    } catch (error) {
      console.error("Error getting inventory item:", error);
      res.status(500).json({ error: "Failed to retrieve inventory item" });
    }
  });

  app.post("/api/inventory", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      // Validate request body
      const validatedItem = inventoryFormSchema.parse(req.body);
      
      // Associate the item with the current user
      const itemWithUserId = {
        ...validatedItem,
        userId
      };
      
      const newItem = await storage.createInventoryItem(itemWithUserId);
      res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      console.error("Error creating inventory item:", error);
      res.status(500).json({ error: "Failed to create inventory item" });
    }
  });

  app.put("/api/inventory/:id", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      // Verify the item belongs to this user
      const existingItem = await storage.getInventoryItem(id);
      if (!existingItem || existingItem.userId !== userId) {
        return res.status(404).json({ error: "Item not found" });
      }

      // Validate request body
      const validatedItem = inventoryFormSchema.parse(req.body);
      
      // Preserve the user ID in the updated item
      const itemWithUserId = {
        ...validatedItem,
        userId
      };
      
      const updatedItem = await storage.updateInventoryItem(id, itemWithUserId);
      
      if (!updatedItem) {
        return res.status(404).json({ error: "Item not found" });
      }

      res.json(updatedItem);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      console.error("Error updating inventory item:", error);
      res.status(500).json({ error: "Failed to update inventory item" });
    }
  });

  app.delete("/api/inventory/:id", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      // Verify the item belongs to this user
      const existingItem = await storage.getInventoryItem(id);
      if (!existingItem || existingItem.userId !== userId) {
        return res.status(404).json({ error: "Item not found" });
      }

      const success = await storage.deleteInventoryItem(id);
      if (!success) {
        return res.status(404).json({ error: "Item not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ error: "Failed to delete inventory item" });
    }
  });

  // Recipe generation route
  app.post("/api/recipes/generate", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const inventoryItems = await storage.getInventoryItems(userId);
      
      if (inventoryItems.length === 0) {
        return res.status(400).json({ 
          error: "No inventory items found. Please add some ingredients first." 
        });
      }

      const recipes = await generateRecipes(inventoryItems);
      
      // Store the generated recipes
      const savedRecipes = await Promise.all(
        recipes.map(async (recipe) => {
          try {
            // Convert ingredients to JSON string for storage
            const recipeToSave = {
              ...recipe,
              ingredients: JSON.stringify(recipe.ingredients),
              instructions: JSON.stringify(recipe.instructions)
            };
            
            return await storage.createRecipe(recipeToSave);
          } catch (error) {
            console.error("Error saving recipe:", error);
            return null;
          }
        })
      );

      // Filter out any recipes that failed to save
      const validRecipes = savedRecipes.filter(recipe => recipe !== null);
      
      res.json(validRecipes);
    } catch (error) {
      console.error("Error generating recipes:", error);
      res.status(500).json({ 
        error: "Failed to generate recipes. Please check your OpenAI API key and try again." 
      });
    }
  });

  // Recipe routes
  
  // Get all favorite recipes - this needs to be before the /:id route to avoid conflicts
  app.get("/api/recipes/favorites", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const favoriteRecipes = await storage.getFavoriteRecipes(userId);
      
      // Parse JSON strings back to objects
      const formattedRecipes = favoriteRecipes.map(recipe => ({
        ...recipe,
        ingredients: JSON.parse(recipe.ingredients),
        instructions: JSON.parse(recipe.instructions)
      }));
      
      res.json(formattedRecipes);
    } catch (error) {
      console.error("Error retrieving favorite recipes:", error);
      res.status(500).json({ error: "Failed to retrieve favorite recipes" });
    }
  });

  // Get all recipes
  app.get("/api/recipes", async (_req: Request, res: Response) => {
    try {
      const recipes = await storage.getRecipes();
      
      // Parse JSON strings back to objects
      const formattedRecipes = recipes.map(recipe => ({
        ...recipe,
        ingredients: JSON.parse(recipe.ingredients),
        instructions: JSON.parse(recipe.instructions)
      }));
      
      res.json(formattedRecipes);
    } catch (error) {
      console.error("Error getting recipes:", error);
      res.status(500).json({ error: "Failed to retrieve recipes" });
    }
  });

  // Get recipe by ID
  app.get("/api/recipes/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Check if user is authenticated to add favorite info
      const userId = req.isAuthenticated() ? req.user?.id : undefined;
      const recipe = await storage.getRecipe(id, userId);
      
      if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" });
      }

      // Parse JSON strings back to objects
      const formattedRecipe = {
        ...recipe,
        ingredients: JSON.parse(recipe.ingredients),
        instructions: JSON.parse(recipe.instructions)
      };

      res.json(formattedRecipe);
    } catch (error) {
      console.error("Error getting recipe:", error);
      res.status(500).json({ error: "Failed to retrieve recipe" });
    }
  });

  // Toggle favorite status for a recipe
  app.put("/api/recipes/:id/favorite", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const recipeId = Number(req.params.id);
      if (isNaN(recipeId)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const updatedRecipe = await storage.toggleFavoriteRecipe(recipeId, userId);
      
      if (!updatedRecipe) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      
      // Parse JSON strings back to objects
      const formattedRecipe = {
        ...updatedRecipe,
        ingredients: JSON.parse(updatedRecipe.ingredients),
        instructions: JSON.parse(updatedRecipe.instructions)
      };
      
      res.json(formattedRecipe);
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      res.status(500).json({ error: "Failed to update favorite status" });
    }
  });

  return httpServer;
}