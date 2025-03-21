import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { inventoryFormSchema, insertRecipeSchema } from "@shared/schema";
import { generateRecipes } from "./openai";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  const httpServer = createServer(app);

  // Inventory routes
  app.get("/api/inventory", async (req: Request, res: Response) => {
    try {
      const items = await storage.getInventoryItems();
      res.json(items);
    } catch (error) {
      console.error("Error getting inventory items:", error);
      res.status(500).json({ error: "Failed to retrieve inventory items" });
    }
  });

  app.get("/api/inventory/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const item = await storage.getInventoryItem(id);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }

      res.json(item);
    } catch (error) {
      console.error("Error getting inventory item:", error);
      res.status(500).json({ error: "Failed to retrieve inventory item" });
    }
  });

  app.post("/api/inventory", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedItem = inventoryFormSchema.parse(req.body);
      const newItem = await storage.createInventoryItem(validatedItem);
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

  app.put("/api/inventory/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Validate request body
      const validatedItem = inventoryFormSchema.parse(req.body);
      const updatedItem = await storage.updateInventoryItem(id, validatedItem);
      
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

  app.delete("/api/inventory/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
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
  app.post("/api/recipes/generate", async (req: Request, res: Response) => {
    try {
      const inventoryItems = await storage.getInventoryItems();
      
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
  app.get("/api/recipes", async (req: Request, res: Response) => {
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

  app.get("/api/recipes/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const recipe = await storage.getRecipe(id);
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

  return httpServer;
}
